const pool = require('../db/connection')

const getBids = async (req, res) => {
    try {
        const { shipmentId } = req.params

        const result = await pool.query(
            `SELECT
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
             ORDER BY b.amount ASC`,
            [shipmentId]
        )

        res.json(result.rows)

    } catch (err) {

        console.error('Get bids error:', err)

        res.status(500).json({
            error: err.message
        })

    }
}
const placeBid = async (req, res) => {
    try {
        const { shipment_id, amount, note } = req.body

        if (!shipment_id || !amount) {
            return res.status(400).json({
                error: 'Shipment id and amount are required'
            })
        }

        const shipment = await pool.query(
            'SELECT * FROM shipments WHERE id = $1',
            [shipment_id]
        )

        if (shipment.rows.length === 0) {
            return res.status(404).json({ error: 'Shipment not found' })
        }

        if (shipment.rows[0].status !== 'posted') {
            return res.status(400).json({
                error: 'This shipment is no longer accepting bids'
            })
        }

        const existingBid = await pool.query(
            'SELECT * FROM bids WHERE shipment_id = $1 AND transporter_id = $2',
            [shipment_id, req.user.id]
        )

        if (existingBid.rows.length > 0) {
            return res.status(400).json({
                error: 'You have already placed a bid on this shipment'
            })
        }

        // get transporter name for socket broadcast
        const transporter = await pool.query(
            'SELECT name FROM users WHERE id = $1',
            [req.user.id]
        )

        const result = await pool.query(
            `INSERT INTO bids (shipment_id, transporter_id, amount, note)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [shipment_id, req.user.id, amount, note]
        )

        const newBid = {
            ...result.rows[0],
            transporter_name: transporter.rows[0].name
        }

        // emit new bid to everyone watching this shipment
        const io = req.app.get('io')
        io.to(shipment_id).emit('new-bid', newBid)

        res.status(201).json(newBid)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

const acceptBid = async (req, res) => {
    try {
        const { id } = req.params

        const bid = await pool.query(
            'SELECT * FROM bids WHERE id = $1',
            [id]
        )

        if (bid.rows.length === 0) {
            return res.status(404).json({ error: 'Bid not found' })
        }

        const shipment = await pool.query(
            'SELECT * FROM shipments WHERE id = $1',
            [bid.rows[0].shipment_id]
        )

        if (shipment.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                error: 'You can only accept bids on your own shipments'
            })
        }

        await pool.query(
            'UPDATE bids SET status = $1 WHERE id = $2',
            ['accepted', id]
        )

        await pool.query(
            `UPDATE bids SET status = 'rejected'
             WHERE shipment_id = $1 AND id != $2`,
            [bid.rows[0].shipment_id, id]
        )

        await pool.query(
            `UPDATE shipments SET status = 'assigned',
             transporter_id = $1 WHERE id = $2`,
            [bid.rows[0].transporter_id, bid.rows[0].shipment_id]
        )

        // emit bid accepted to everyone in room
        const io = req.app.get('io')
        io.to(bid.rows[0].shipment_id).emit('bid-accepted', { bidId: id })

        res.json({ message: 'Bid accepted successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = { getBids, placeBid, acceptBid }