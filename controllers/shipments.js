const completeDelivery = async (req, res) => {
    try {
        const { id } = req.params
        const { delivery_condition, delivery_notes, rating, comment } = req.body

        // check shipment belongs to this shipper
        const shipment = await pool.query(
            'SELECT * FROM shipments WHERE id = $1',
            [id]
        )

        if (shipment.rows.length === 0) {
            return res.status(404).json({ error: 'Shipment not found' })
        }

        if (shipment.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Not your shipment' })
        }

        // update shipment as delivered
        await pool.query(
            `UPDATE shipments
             SET status = 'delivered',
                 delivery_condition = $1,
                 delivery_notes = $2,
                 actual_delivery_time = NOW()
             WHERE id = $3`,
            [delivery_condition, delivery_notes, id]
        )

        // save rating
        if (rating && shipment.rows[0].transporter_id) {
            await pool.query(
                `INSERT INTO ratings
                 (shipment_id, shipper_id, transporter_id, rating, comment)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, req.user.id, shipment.rows[0].transporter_id, rating, comment]
            )

            // update transporter's average rating and trip count
            await pool.query(
                `UPDATE users SET
                    total_trips = total_trips + 1,
                    on_time_deliveries = on_time_deliveries +
                        CASE WHEN $1 = 'good' THEN 1 ELSE 0 END,
                    rating = (
                        SELECT AVG(rating)
                        FROM ratings
                        WHERE transporter_id = $2
                    )
                 WHERE id = $2`,
                [delivery_condition, shipment.rows[0].transporter_id]
            )
        }

        res.json({ message: 'Delivery confirmed successfully' })

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message })
    }
}

module.exports = {
    getAllShipments,
    getShipment,
    createShipment,
    updateShipment,
    deleteShipment,
    completeDelivery
}