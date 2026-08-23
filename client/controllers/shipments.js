const pool = require('../db/connection')

// =====================================================
// GET ALL SHIPMENTS
// =====================================================

const getAllShipments = async (req, res) => {
    try {

        // ================================
        // TRANSPORTER
        // ================================

        if (req.user.role === 'transporter') {

            const result = await pool.query(`
                SELECT
                    s.*,
                    u.name AS shipper_name
                FROM shipments s
                JOIN users u
                    ON s.user_id = u.id
                WHERE
                    s.status = 'posted'
                    OR s.transporter_id = $1
                ORDER BY s.created_at DESC
            `, [req.user.id])

            return res.json(result.rows)
        }

        // ================================
        // SHIPPER
        // ================================

        if (req.user.role === 'shipper') {

            const result = await pool.query(`
                SELECT
                    s.*,
                    u.name AS shipper_name
                FROM shipments s
                JOIN users u
                    ON s.user_id = u.id
                WHERE s.user_id = $1
                ORDER BY s.created_at DESC
            `, [req.user.id])

            return res.json(result.rows)
        }

        return res.status(403).json({
            error: 'Invalid user role'
        })

    } catch (err) {

        console.error('Get shipments error:', err)

        res.status(500).json({
            error: err.message
        })
    }
}


// =====================================================
// GET ONE SHIPMENT
// ALSO RETURNS LAST KNOWN TRUCK LOCATION
// =====================================================

const getShipment = async (req, res) => {

    try {

        const { id } = req.params

        // ==========================================
        // GET SHIPMENT
        // ==========================================

        const result = await pool.query(
            `SELECT
                s.*,
                u.name AS shipper_name
             FROM shipments s
             JOIN users u
                ON s.user_id = u.id
             WHERE s.id = $1`,
            [id]
        )

        if (result.rows.length === 0) {

            return res.status(404).json({
                error: 'Shipment not found'
            })

        }

        const shipment = result.rows[0]


        // ==========================================
        // GET LAST KNOWN LOCATION
        // ==========================================

        const locationResult = await pool.query(
            `SELECT
                lat,
                lng,
                recorded_at
             FROM location_history
             WHERE shipment_id = $1
             ORDER BY recorded_at DESC
             LIMIT 1`,
            [id]
        )


        // ==========================================
        // ADD LOCATION TO RESPONSE
        // ==========================================

        if (locationResult.rows.length > 0) {

            const location =
                locationResult.rows[0]

            shipment.latest_location = {

                lat: Number(location.lat),

                lng: Number(location.lng),

                updatedAt:
                    location.recorded_at

            }

        } else {

            shipment.latest_location = null

        }


        // ==========================================
        // RETURN SHIPMENT
        // ==========================================

        res.json(shipment)

    } catch (err) {

        console.error(
            'Get shipment error:',
            err
        )

        res.status(500).json({
            error: err.message
        })
    }
}


// =====================================================
// GET LATEST LOCATION
// =====================================================

const getLatestLocation = async (req, res) => {

    try {

        const { id } = req.params


        // ==========================================
        // CHECK SHIPMENT EXISTS
        // ==========================================

        const shipmentResult = await pool.query(
            `SELECT
                id,
                user_id,
                transporter_id,
                status
             FROM shipments
             WHERE id = $1`,
            [id]
        )


        if (shipmentResult.rows.length === 0) {

            return res.status(404).json({
                error: 'Shipment not found'
            })

        }


        const shipment =
            shipmentResult.rows[0]


        // ==========================================
        // CHECK USER HAS ACCESS
        // ==========================================

        const isShipper =
            String(shipment.user_id) ===
            String(req.user.id)

        const isTransporter =
            String(shipment.transporter_id) ===
            String(req.user.id)


        if (!isShipper && !isTransporter) {

            return res.status(403).json({
                error:
                    'You do not have access to this shipment location'
            })

        }


        // ==========================================
        // GET LAST LOCATION
        // ==========================================

        const result = await pool.query(
            `SELECT
                lat,
                lng,
                recorded_at
             FROM location_history
             WHERE shipment_id = $1
             ORDER BY recorded_at DESC
             LIMIT 1`,
            [id]
        )


        if (result.rows.length === 0) {

            return res.json({
                location: null
            })

        }


        const location =
            result.rows[0]


        res.json({

            location: {

                lat:
                    Number(location.lat),

                lng:
                    Number(location.lng),

                updatedAt:
                    location.recorded_at

            }

        })

    } catch (err) {

        console.error(
            'Get latest location error:',
            err
        )

        res.status(500).json({
            error:
                'Failed to get latest truck location'
        })
    }
}


// =====================================================
// CREATE SHIPMENT
// =====================================================

const createShipment = async (req, res) => {

    try {

        const {
            from_city,
            to_city,
            weight_kg,
            amount,
            goods_type,
            notes,
            pickup_date,
            delivery_by,
            pickup_address,
            delivery_address,
            cargo_value,
            num_packages,
            special_handling,
            description,
            pickup_time
        } = req.body


        // ==========================================
        // ONLY SHIPPER CAN CREATE
        // ==========================================

        if (req.user.role !== 'shipper') {

            return res.status(403).json({
                error:
                    'Only shippers can post shipments'
            })

        }


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !from_city ||
            !to_city ||
            !weight_kg ||
            !amount
        ) {

            return res.status(400).json({
                error:
                    'From city, to city, weight and amount are required'
            })

        }


        // ==========================================
        // WEIGHT VALIDATION
        // ==========================================

        if (Number(weight_kg) <= 0) {

            return res.status(400).json({
                error:
                    'Weight must be greater than 0'
            })

        }


        // ==========================================
        // BUDGET VALIDATION
        // ==========================================

        if (Number(amount) <= 0) {

            return res.status(400).json({
                error:
                    'Budget must be greater than 0'
            })

        }


        // ==========================================
        // DELIVERY DATE VALIDATION
        // ==========================================

        if (
            pickup_date &&
            delivery_by
        ) {

            if (
                new Date(delivery_by) <=
                new Date(pickup_date)
            ) {

                return res.status(400).json({
                    error:
                        'Delivery date must be after pickup date'
                })

            }

        }


        // ==========================================
        // INSERT SHIPMENT
        // ==========================================

        const result = await pool.query(

            `INSERT INTO shipments
            (
                from_city,
                to_city,
                weight_kg,
                amount,
                goods_type,
                notes,
                pickup_date,
                delivery_by,
                user_id,
                pickup_address,
                delivery_address,
                cargo_value,
                num_packages,
                special_handling,
                description,
                pickup_time
            )
            VALUES
            (
                $1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12,
                $13, $14, $15, $16
            )
            RETURNING *`,

            [
                from_city,
                to_city,
                weight_kg,
                amount,
                goods_type || null,
                notes || null,
                pickup_date || null,
                delivery_by || null,
                req.user.id,
                pickup_address || null,
                delivery_address || null,
                cargo_value || null,
                num_packages || null,
                special_handling || null,
                description || null,
                pickup_time || null
            ]

        )


        res.status(201).json({

            message:
                'Shipment posted successfully',

            shipment:
                result.rows[0]

        })

    } catch (err) {

        console.error(
            'Create shipment error:',
            err
        )

        res.status(500).json({
            error:
                'Failed to create shipment'
        })
    }
}


// =====================================================
// UPDATE SHIPMENT STATUS
// =====================================================

const updateShipment = async (req, res) => {

    try {

        const { id } = req.params

        const { status } = req.body


        // ==========================================
        // GET SHIPMENT
        // ==========================================

        const shipment = await pool.query(
            'SELECT * FROM shipments WHERE id = $1',
            [id]
        )


        if (shipment.rows.length === 0) {

            return res.status(404).json({
                error:
                    'Shipment not found'
            })

        }


        // ==========================================
        // ONLY OWNER CAN UPDATE
        // ==========================================

        if (
            String(shipment.rows[0].user_id) !==
            String(req.user.id)
        ) {

            return res.status(403).json({
                error:
                    'Not your shipment'
            })

        }


        // ==========================================
        // UPDATE
        // ==========================================

        const result = await pool.query(

            `UPDATE shipments
             SET status = $1
             WHERE id = $2
             RETURNING *`,

            [
                status,
                id
            ]

        )


        res.json(
            result.rows[0]
        )

    } catch (err) {

        console.error(
            'Update shipment error:',
            err
        )

        res.status(500).json({
            error:
                err.message
        })
    }
}


// =====================================================
// MARK SHIPMENT AS PICKED UP
// TRANSPORTER → assigned → in_transit
// =====================================================

const markPickedUp = async (req, res) => {

    try {

        const { id } = req.params


        // ==========================================
        // GET SHIPMENT
        // ==========================================

        const result = await pool.query(
            'SELECT * FROM shipments WHERE id = $1',
            [id]
        )


        if (result.rows.length === 0) {

            return res.status(404).json({
                error:
                    'Shipment not found'
            })

        }


        const shipment =
            result.rows[0]


        // ==========================================
        // ONLY ASSIGNED TRANSPORTER
        // ==========================================

        if (
            String(shipment.transporter_id) !==
            String(req.user.id)
        ) {

            return res.status(403).json({
                error:
                    'Only the assigned transporter can mark pickup'
            })

        }


        // ==========================================
        // STATUS MUST BE ASSIGNED
        // ==========================================

        if (
            shipment.status !==
            'assigned'
        ) {

            return res.status(400).json({
                error:
                    `Cannot mark pickup. Current status is ${shipment.status}`
            })

        }


        // ==========================================
        // UPDATE STATUS
        // ==========================================

        const updated = await pool.query(

            `UPDATE shipments
             SET status = 'in_transit'
             WHERE id = $1
             RETURNING *`,

            [id]

        )


        res.json({

            message:
                'Shipment picked up successfully',

            shipment:
                updated.rows[0]

        })

    } catch (err) {

        console.error(
            'Mark pickup error:',
            err
        )

        res.status(500).json({
            error:
                'Failed to mark shipment as picked up'
        })
    }
}


// =====================================================
// COMPLETE DELIVERY
// SHIPPER → in_transit → delivered
// =====================================================

const completeDelivery = async (req, res) => {

    try {

        const { id } = req.params


        const {
            delivery_condition,
            delivery_notes,
            rating,
            comment
        } = req.body


        // ==========================================
        // GET SHIPMENT
        // ==========================================

        const shipmentResult =
            await pool.query(

                'SELECT * FROM shipments WHERE id = $1',

                [id]

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


        // ==========================================
        // ONLY SHIPPER CAN CONFIRM
        // ==========================================

        if (
            String(shipment.user_id) !==
            String(req.user.id)
        ) {

            return res.status(403).json({
                error:
                    'Only the shipper can confirm delivery'
            })

        }


        // ==========================================
        // MUST BE IN TRANSIT
        // ==========================================

        if (
            shipment.status !==
            'in_transit'
        ) {

            return res.status(400).json({
                error:
                    `Shipment cannot be completed. Current status is ${shipment.status}`
            })

        }


        // ==========================================
        // DELIVERY CONDITION
        // ==========================================

        if (!delivery_condition) {

            return res.status(400).json({
                error:
                    'Please select delivery condition'
            })

        }


        // ==========================================
        // VALID CONDITIONS
        // ==========================================

        const validConditions = [
            'good',
            'damaged',
            'missing',
            'partially_damaged'
        ]


        if (
            !validConditions.includes(
                delivery_condition
            )
        ) {

            return res.status(400).json({
                error:
                    'Invalid delivery condition'
            })

        }


        // ==========================================
        // RATING
        // ==========================================

        if (
            !rating ||
            Number(rating) < 1 ||
            Number(rating) > 5
        ) {

            return res.status(400).json({
                error:
                    'Please provide a rating between 1 and 5'
            })

        }


        // ==========================================
        // UPDATE SHIPMENT
        // ==========================================

        const updatedShipment =
            await pool.query(

                `UPDATE shipments
                 SET
                    status = 'delivered',
                    delivery_condition = $1,
                    delivery_notes = $2,
                    actual_delivery_time = NOW()
                 WHERE id = $3
                 RETURNING *`,

                [
                    delivery_condition,
                    delivery_notes || null,
                    id
                ]

            )


        // ==========================================
        // SAVE RATING
        // ==========================================

        if (shipment.transporter_id) {

            await pool.query(

                `INSERT INTO ratings
                (
                    shipment_id,
                    shipper_id,
                    transporter_id,
                    rating,
                    comment
                )
                VALUES
                ($1, $2, $3, $4, $5)`,

                [
                    id,
                    req.user.id,
                    shipment.transporter_id,
                    rating,
                    comment || null
                ]

            )


            // ======================================
            // UPDATE TRANSPORTER STATISTICS
            // ======================================

            await pool.query(

                `UPDATE users
                 SET

                    total_trips =
                        total_trips + 1,

                    on_time_deliveries =
                        on_time_deliveries +
                        CASE
                            WHEN $1 = 'good'
                            THEN 1
                            ELSE 0
                        END,

                    rating = (
                        SELECT AVG(rating)
                        FROM ratings
                        WHERE transporter_id = $2
                    )

                 WHERE id = $2`,

                [
                    delivery_condition,
                    shipment.transporter_id
                ]

            )

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.json({

            message:
                'Delivery confirmed successfully',

            status:
                'delivered',

            shipment:
                updatedShipment.rows[0]

        })

    } catch (err) {

        console.error(
            'Complete delivery error:',
            err
        )

        res.status(500).json({
            error:
                'Failed to complete delivery'
        })
    }
}


// =====================================================
// CANCEL / DELETE SHIPMENT
// =====================================================
//
// SHIPPER ONLY
//
// POSTED:
//     - If no bids → permanently delete
//     - If bids exist → cancel shipment
//
// ASSIGNED:
//     - Cancel shipment
//
// IN_TRANSIT:
//     - NOT allowed
//
// DELIVERED:
//     - NOT allowed
//
// =====================================================

const deleteShipment = async (req, res) => {

    try {

        const { id } = req.params


        // ==========================================
        // GET SHIPMENT
        // ==========================================

        const shipmentResult =
            await pool.query(
                `
                SELECT *
                FROM shipments
                WHERE id = $1
                `,
                [id]
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


        // ==========================================
        // ONLY SHIPPER / OWNER
        // ==========================================

        if (
            String(shipment.user_id) !==
            String(req.user.id)
        ) {

            return res.status(403).json({
                error:
                    'You can only cancel your own shipment'
            })

        }


        // ==========================================
        // DELIVERED
        // ==========================================

        if (
            shipment.status === 'delivered'
        ) {

            return res.status(400).json({
                error:
                    'A delivered shipment cannot be cancelled or deleted'
            })

        }


        // ==========================================
        // IN TRANSIT
        // ==========================================

        if (
            shipment.status === 'in_transit'
        ) {

            return res.status(400).json({
                error:
                    'A shipment that is already in transit cannot be cancelled'
            })

        }


        // ==========================================
        // CHECK BID COUNT
        // ==========================================

        const bidResult =
            await pool.query(
                `
                SELECT COUNT(*) AS count
                FROM bids
                WHERE shipment_id = $1
                `,
                [id]
            )


        const bidCount =
            Number(
                bidResult.rows[0].count
            )


        // ==========================================
        // POSTED + NO BIDS
        // ==========================================
        //
        // Permanently delete shipment.
        //
        // This is the only situation where
        // we physically delete the shipment.
        // ==========================================

        if (
            shipment.status === 'posted' &&
            bidCount === 0
        ) {

            await pool.query(
                `
                DELETE FROM shipments
                WHERE id = $1
                `,
                [id]
            )


            return res.json({

                message:
                    'Shipment deleted successfully',

                action:
                    'deleted'

            })

        }


        // ==========================================
        // POSTED + BIDS
        // ==========================================
        //
        // Do NOT delete because bids/history
        // should remain in the database.
        //
        // Instead mark shipment cancelled.
        // ==========================================

        if (
            shipment.status === 'posted'
        ) {

            await pool.query(
                `
                UPDATE shipments
                SET status = 'cancelled'
                WHERE id = $1
                `,
                [id]
            )


            // ======================================
            // SOCKET.IO
            // ======================================

            const io =
                req.app.get('io')


            if (io) {

                io.to(
                    String(id)
                ).emit(
                    'shipment-cancelled',
                    {
                        shipmentId: id
                    }
                )

            }


            return res.json({

                message:
                    'Shipment cancelled successfully',

                action:
                    'cancelled'

            })

        }


        // ==========================================
        // ASSIGNED
        // ==========================================
        //
        // Do NOT delete.
        //
        // Keep shipment history.
        // ==========================================

        if (
            shipment.status === 'assigned'
        ) {

            await pool.query(
                `
                UPDATE shipments
                SET status = 'cancelled'
                WHERE id = $1
                `,
                [id]
            )


            // ======================================
            // SOCKET.IO
            // ======================================

            const io =
                req.app.get('io')


            if (io) {

                io.to(
                    String(id)
                ).emit(
                    'shipment-cancelled',
                    {
                        shipmentId: id
                    }
                )

            }


            return res.json({

                message:
                    'Shipment cancelled successfully',

                action:
                    'cancelled'

            })

        }


        // ==========================================
        // OTHER STATUS
        // ==========================================

        return res.status(400).json({

            error:
                `Shipment cannot be cancelled in its current status: ${shipment.status}`

        })

    } catch (err) {

        console.error(
            'Delete/cancel shipment error:',
            err
        )

        return res.status(500).json({

            error:
                err.message ||
                'Failed to cancel shipment'

        })

    }
}
// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getAllShipments,

    getShipment,

    getLatestLocation,

    createShipment,

    updateShipment,

    deleteShipment,

    markPickedUp,

    completeDelivery

}