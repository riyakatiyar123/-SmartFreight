const pool = require('../db/connection')


// ========================================
// GET ALL BIDS FOR A SHIPMENT
// ========================================

const getBids = async (req, res) => {

    try {

        const { shipmentId } = req.params

        const result = await pool.query(
            `
            SELECT
                b.*,
                u.name AS transporter_name,
                u.rating,
                u.total_trips,
                u.on_time_deliveries,
                u.truck_type,
                u.truck_capacity_kg,
                u.truck_number
            FROM bids b
            JOIN users u
                ON b.transporter_id = u.id
            WHERE b.shipment_id = $1
            ORDER BY b.amount ASC
            `,
            [shipmentId]
        )

        res.json(result.rows)

    } catch (err) {

        console.error(
            'Get bids error:',
            err
        )

        res.status(500).json({
            error:
                err.message ||
                'Failed to get bids'
        })
    }
}


// ========================================
// GET DASHBOARD BID COUNT
// ========================================

const getDashboardBidCount = async (req, res) => {

    try {

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                error: 'Authentication required'
            })

        }

        let result


        // ==================================
        // SHIPPER
        // ==================================

        if (req.user.role === 'shipper') {

            result = await pool.query(
                `
                SELECT COUNT(*) AS count
                FROM bids b
                JOIN shipments s
                    ON b.shipment_id = s.id
                WHERE s.user_id = $1
                `,
                [req.user.id]
            )

        }


        // ==================================
        // TRANSPORTER
        // ==================================

        else if (req.user.role === 'transporter') {

            result = await pool.query(
                `
                SELECT COUNT(*) AS count
                FROM bids
                WHERE transporter_id = $1
                `,
                [req.user.id]
            )

        }


        // ==================================
        // UNKNOWN ROLE
        // ==================================

        else {

            return res.status(400).json({
                error: 'Invalid user role'
            })

        }


        return res.json({

            count:
                Number(
                    result.rows[0].count
                )

        })

    } catch (err) {

        console.error(
            'Dashboard bid count error:',
            err
        )

        return res.status(500).json({

            error:
                err.message ||
                'Failed to get bid count'

        })

    }
}


// ========================================
// PLACE BID
// ========================================

const placeBid = async (req, res) => {

    try {

        if (!req.user || !req.user.id) {

            return res.status(401).json({
                error: 'Authentication required'
            })

        }


        const {
            shipment_id,
            amount,
            note
        } = req.body


        // ==================================
        // VALIDATE INPUT
        // ==================================

        if (
            !shipment_id ||
            !amount
        ) {

            return res.status(400).json({
                error:
                    'Shipment id and amount are required'
            })

        }


        const bidAmount =
            Number(amount)


        if (
            !Number.isFinite(bidAmount) ||
            bidAmount <= 0
        ) {

            return res.status(400).json({
                error:
                    'Bid amount must be a valid positive number'
            })

        }


        // ==================================
        // CHECK SHIPMENT
        // ==================================

        const shipment =
            await pool.query(
                `
                SELECT *
                FROM shipments
                WHERE id = $1
                `,
                [shipment_id]
            )


        if (
            shipment.rows.length === 0
        ) {

            return res.status(404).json({
                error:
                    'Shipment not found'
            })

        }


        const shipmentData =
            shipment.rows[0]


        // ==================================
        // CHECK STATUS
        // ==================================

        if (
            shipmentData.status !== 'posted'
        ) {

            return res.status(400).json({
                error:
                    'This shipment is no longer accepting bids'
            })

        }


        // ==================================
        // CHECK USER IS NOT SHIPPER
        // ==================================

        if (
            String(shipmentData.user_id) ===
            String(req.user.id)
        ) {

            return res.status(403).json({
                error:
                    'You cannot place a bid on your own shipment'
            })

        }


        // ==================================
        // CHECK EXISTING BID
        // ==================================

        const existingBid =
            await pool.query(
                `
                SELECT *
                FROM bids
                WHERE shipment_id = $1
                  AND transporter_id = $2
                  AND status != 'withdrawn'
                `,
                [
                    shipment_id,
                    req.user.id
                ]
            )


        if (
            existingBid.rows.length > 0
        ) {

            return res.status(400).json({
                error:
                    'You have already placed a bid on this shipment'
            })

        }


        // ==================================
        // GET TRANSPORTER
        // ==================================

        const transporter =
            await pool.query(
                `
                SELECT
                    id,
                    name
                FROM users
                WHERE id = $1
                `,
                [req.user.id]
            )


        if (
            transporter.rows.length === 0
        ) {

            return res.status(404).json({
                error:
                    'Transporter account not found'
            })

        }


        const transporterData =
            transporter.rows[0]


        // ==================================
        // INSERT BID
        // ==================================

        const result =
            await pool.query(
                `
                INSERT INTO bids
                    (
                        shipment_id,
                        transporter_id,
                        amount,
                        note
                    )
                VALUES
                    (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                RETURNING *
                `,
                [
                    shipment_id,
                    req.user.id,
                    bidAmount,
                    note || null
                ]
            )


        // ==================================
        // NEW BID RESPONSE
        // ==================================

        const newBid = {

            ...result.rows[0],

            transporter_name:
                transporterData.name

        }


        // ==================================
        // SOCKET.IO
        // ==================================

        const io =
            req.app.get('io')


        if (io) {

            io.to(
                String(shipment_id)
            ).emit(
                'new-bid',
                newBid
            )

        }


        // ==================================
        // RESPONSE
        // ==================================

        return res.status(201).json(
            newBid
        )

    } catch (err) {

        console.error(
            'Place bid error:',
            err
        )

        return res.status(500).json({
            error:
                err.message ||
                'Failed to place bid'
        })

    }
}


// ========================================
// ACCEPT BID
// ========================================

const acceptBid = async (req, res) => {

    try {

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({
                error:
                    'Authentication required'
            })

        }


        const { id } =
            req.params


        // ==================================
        // GET BID
        // ==================================

        const bid =
            await pool.query(
                `
                SELECT *
                FROM bids
                WHERE id = $1
                `,
                [id]
            )


        if (
            bid.rows.length === 0
        ) {

            return res.status(404).json({
                error:
                    'Bid not found'
            })

        }


        const bidData =
            bid.rows[0]


        // ==================================
        // GET SHIPMENT
        // ==================================

        const shipment =
            await pool.query(
                `
                SELECT *
                FROM shipments
                WHERE id = $1
                `,
                [
                    bidData.shipment_id
                ]
            )


        if (
            shipment.rows.length === 0
        ) {

            return res.status(404).json({
                error:
                    'Shipment not found'
            })

        }


        const shipmentData =
            shipment.rows[0]


        // ==================================
        // CHECK OWNERSHIP
        // ==================================

        if (
            String(shipmentData.user_id) !==
            String(req.user.id)
        ) {

            return res.status(403).json({
                error:
                    'You can only accept bids on your own shipments'
            })

        }


        // ==================================
        // CHECK SHIPMENT STATUS
        // ==================================

        if (
            shipmentData.status !== 'posted'
        ) {

            return res.status(400).json({
                error:
                    'This shipment is no longer accepting bids'
            })

        }


        // ==================================
        // CHECK BID STATUS
        // ==================================

        if (
            bidData.status !== 'pending'
        ) {

            return res.status(400).json({
                error:
                    `This bid is already ${bidData.status}`
            })

        }


        // ==================================
        // ACCEPT BID
        // ==================================

        await pool.query(
            `
            UPDATE bids
            SET status = 'accepted'
            WHERE id = $1
            `,
            [id]
        )


        // ==================================
        // REJECT OTHER BIDS
        // ==================================

        await pool.query(
            `
            UPDATE bids
            SET status = 'rejected'
            WHERE shipment_id = $1
              AND id != $2
              AND status = 'pending'
            `,
            [
                bidData.shipment_id,
                id
            ]
        )


        // ==================================
        // ASSIGN TRANSPORTER
        // ==================================

        await pool.query(
            `
            UPDATE shipments
            SET
                status = 'assigned',
                transporter_id = $1
            WHERE id = $2
            `,
            [
                bidData.transporter_id,
                bidData.shipment_id
            ]
        )


        // ==================================
        // SOCKET.IO
        // ==================================

        const io =
            req.app.get('io')


        if (io) {

            io.to(
                String(
                    bidData.shipment_id
                )
            ).emit(
                'bid-accepted',
                {
                    bidId: id
                }
            )

        }


        // ==================================
        // RESPONSE
        // ==================================

        return res.json({

            message:
                'Bid accepted successfully',

            bidId:
                id,

            shipmentId:
                bidData.shipment_id,

            transporterId:
                bidData.transporter_id

        })

    } catch (err) {

        console.error(
            'Accept bid error:',
            err
        )

        return res.status(500).json({

            error:
                err.message ||
                'Failed to accept bid'

        })

    }

}


// ========================================
// WITHDRAW BID
// ========================================
//
// Transporter can withdraw ONLY their
// own pending bid.
//
// pending → withdrawn
//
// Accepted/rejected bids cannot be
// withdrawn.
// ========================================

const withdrawBid = async (req, res) => {

    try {

        // ==================================
        // CHECK AUTHENTICATION
        // ==================================

        if (
            !req.user ||
            !req.user.id
        ) {

            return res.status(401).json({
                error:
                    'Authentication required'
            })

        }


        const { id } =
            req.params


        // ==================================
        // GET BID
        // ==================================

        const result =
            await pool.query(
                `
                SELECT *
                FROM bids
                WHERE id = $1
                `,
                [id]
            )


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({
                error:
                    'Bid not found'
            })

        }


        const bid =
            result.rows[0]


        // ==================================
        // ONLY TRANSPORTER WHO PLACED BID
        // ==================================

        if (
            String(bid.transporter_id) !==
            String(req.user.id)
        ) {

            return res.status(403).json({
                error:
                    'You can only withdraw your own bid'
            })

        }


        // ==================================
        // ONLY PENDING BIDS
        // ==================================

        if (
            bid.status !== 'pending'
        ) {

            return res.status(400).json({
                error:
                    `You cannot withdraw a ${bid.status} bid`
            })

        }


        // ==================================
        // CHECK SHIPMENT
        // ==================================

        const shipmentResult =
            await pool.query(
                `
                SELECT *
                FROM shipments
                WHERE id = $1
                `,
                [bid.shipment_id]
            )


        if (
            shipmentResult.rows.length === 0
        ) {

            return res.status(404).json({
                error:
                    'Shipment not found'
            })

        }


        const shipment =
            shipmentResult.rows[0]


        // ==================================
        // SHIPMENT MUST STILL BE POSTED
        // ==================================

        if (
            shipment.status !== 'posted'
        ) {

            return res.status(400).json({
                error:
                    'This shipment is no longer accepting bid withdrawals'
            })

        }


        // ==================================
        // WITHDRAW BID
        // ==================================

        const updated =
            await pool.query(
                `
                UPDATE bids
                SET status = 'withdrawn'
                WHERE id = $1
                RETURNING *
                `,
                [id]
            )


        // ==================================
        // SOCKET.IO
        // ==================================

        const io =
            req.app.get('io')


        if (io) {

            io.to(
                String(
                    bid.shipment_id
                )
            ).emit(
                'bid-withdrawn',
                {
                    bidId: id,
                    shipmentId:
                        bid.shipment_id
                }
            )

        }


        // ==================================
        // RESPONSE
        // ==================================

        return res.json({

            message:
                'Bid withdrawn successfully',

            bid:
                updated.rows[0]

        })

    } catch (err) {

        console.error(
            'Withdraw bid error:',
            err
        )

        return res.status(500).json({

            error:
                err.message ||
                'Failed to withdraw bid'

        })

    }

}


// ========================================
// EXPORT
// ========================================

module.exports = {

    getBids,

    getDashboardBidCount,

    placeBid,

    acceptBid,

    withdrawBid

}