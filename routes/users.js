const express = require('express')
const router = express.Router()
const pool = require('../db/connection')
const verifyToken = require('../middleware/auth')

// GET user profile by id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, phone, city,
                    truck_number, truck_type, truck_capacity_kg,
                    mileage_kmpl, fuel_type, years_experience,
                    rating, total_trips, on_time_deliveries,
                    cancellations, aadhaar_verified, created_at
             FROM users WHERE id = $1`,
            [req.params.id]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET my profile
router.get('/me/profile', verifyToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE id = $1',
            [req.user.id]
        )
        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

module.exports = router