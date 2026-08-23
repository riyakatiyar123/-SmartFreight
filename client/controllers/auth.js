const pool = require('../db/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// ========================================
// REGISTER
// ========================================

const register = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role,
            phone,
            truck_number,
            truck_type,
            truck_capacity_kg,
            mileage_kmpl
        } = req.body


        // Basic validation
        if (!name || !email || !password || !role) {

            return res.status(400).json({
                error: 'Name, email, password and role are required'
            })

        }


        // Validate role
        if (!['shipper', 'transporter'].includes(role)) {

            return res.status(400).json({
                error: 'Role must be shipper or transporter'
            })

        }


        // Transporter must provide truck number
        if (role === 'transporter' && !truck_number) {

            return res.status(400).json({
                error: 'Truck number is required for transporters'
            })

        }


        // Check if email already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        )


        if (existingUser.rows.length > 0) {

            return res.status(400).json({
                error: 'Email already registered. Please login.'
            })

        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        )


        // Create user
        const result = await pool.query(

            `INSERT INTO users
            (
                name,
                email,
                password,
                role,
                phone,
                truck_number,
                truck_type,
                truck_capacity_kg,
                mileage_kmpl
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )
            RETURNING
                id,
                name,
                email,
                role,
                phone,
                truck_number,
                truck_type,
                truck_capacity_kg,
                mileage_kmpl,
                rating,
                total_trips`,

            [
                name,
                email,
                hashedPassword,
                role,
                phone || null,
                truck_number || null,
                truck_type || null,
                truck_capacity_kg
                    ? Number(truck_capacity_kg)
                    : null,
                mileage_kmpl
                    ? Number(mileage_kmpl)
                    : 4.0
            ]

        )


        const newUser = result.rows[0]


        // Create JWT token
        const token = jwt.sign(

            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '7d'
            }

        )


        // Send response
        res.status(201).json({

            message: 'Account created successfully',

            token,

            user: newUser

        })


    } catch (err) {

        console.error(
            'Registration error:',
            err
        )

        res.status(500).json({
            error: 'Server error during registration'
        })

    }

}



// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body


        // Validate input
        if (!email || !password) {

            return res.status(400).json({
                error: 'Email and password are required'
            })

        }


        // Find user
        const result = await pool.query(

            `SELECT
                id,
                name,
                email,
                password,
                role,
                phone,
                truck_number,
                truck_type,
                truck_capacity_kg,
                mileage_kmpl,
                rating,
                total_trips,
                on_time_deliveries,
                cancellations,
                avg_response_minutes
             FROM users
             WHERE email = $1`,

            [email]

        )


        if (result.rows.length === 0) {

            return res.status(401).json({
                error: 'Invalid email or password'
            })

        }


        const user = result.rows[0]


        // Check password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            )


        if (!passwordMatch) {

            return res.status(401).json({
                error: 'Invalid email or password'
            })

        }


        // Create JWT
        const token = jwt.sign(

            {
                id: user.id,
                email: user.email,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: '7d'
            }

        )


        // Never send password to frontend
        delete user.password


        res.json({

            message: 'Login successful',

            token,

            user

        })


    } catch (err) {

        console.error(
            'Login error:',
            err
        )

        res.status(500).json({
            error: 'Server error during login'
        })

    }

}



// ========================================
// EXPORT
// ========================================

module.exports = {
    register,
    login
}