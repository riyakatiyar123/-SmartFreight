const pool = require('../db/connection')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


// ========================================
// HELPER: EMAIL VALIDATION
// ========================================

const isValidEmail = (email) => {

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
}


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


        // ========================================
        // CLEAN INPUT
        // ========================================

        const cleanName =
            typeof name === 'string'
                ? name.trim()
                : ''

        const cleanEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : ''

        const cleanPhone =
            typeof phone === 'string'
                ? phone.replace(/\D/g, '')
                : ''


        // ========================================
        // NAME
        // ========================================

        if (!cleanName) {

            return res.status(400).json({
                error: 'Full name is required.'
            })

        }

        if (cleanName.length < 2) {

            return res.status(400).json({
                error: 'Full name must contain at least 2 characters.'
            })

        }


        // ========================================
        // EMAIL
        // ========================================

        if (!cleanEmail) {

            return res.status(400).json({
                error: 'Email address is required.'
            })

        }

        if (!isValidEmail(cleanEmail)) {

            return res.status(400).json({
                error: 'Please enter a valid email address.'
            })

        }


        // ========================================
        // PASSWORD
        // ========================================

        if (!password) {

            return res.status(400).json({
                error: 'Password is required.'
            })

        }

        if (password.length < 6) {

            return res.status(400).json({
                error: 'Password must be at least 6 characters.'
            })

        }


        // ========================================
        // ROLE
        // ========================================

        if (!role) {

            return res.status(400).json({
                error: 'Please select whether you are a shipper or transporter.'
            })

        }

        if (
            !['shipper', 'transporter'].includes(role)
        ) {

            return res.status(400).json({
                error: 'Invalid account type. Please select shipper or transporter.'
            })

        }


        // ========================================
        // PHONE
        // ========================================

        if (!cleanPhone) {

            return res.status(400).json({
                error: 'Phone number is required.'
            })

        }

        if (cleanPhone.length !== 10) {

            return res.status(400).json({
                error: 'Phone number must be exactly 10 digits.'
            })

        }


        // ========================================
        // TRANSPORTER VALIDATION
        // ========================================

        let cleanTruckNumber = null
        let cleanTruckType = null
        let truckCapacity = null
        let mileage = 4.0


        if (role === 'transporter') {

            // ------------------------------------
            // TRUCK NUMBER
            // ------------------------------------

            cleanTruckNumber =
                typeof truck_number === 'string'
                    ? truck_number.trim().toUpperCase()
                    : ''

            if (!cleanTruckNumber) {

                return res.status(400).json({
                    error: 'Truck registration number is required.'
                })

            }


            // ------------------------------------
            // TRUCK TYPE
            // ------------------------------------

            const validTruckTypes = [
                'mini',
                'medium',
                'heavy',
                'trailer'
            ]

            if (
                !validTruckTypes.includes(
                    truck_type
                )
            ) {

                return res.status(400).json({
                    error: 'Please select a valid truck type.'
                })

            }

            cleanTruckType = truck_type


            // ------------------------------------
            // TRUCK CAPACITY
            // ------------------------------------

            if (
                truck_capacity_kg === undefined ||
                truck_capacity_kg === null ||
                truck_capacity_kg === ''
            ) {

                return res.status(400).json({
                    error: 'Truck carrying capacity is required.'
                })

            }

            truckCapacity =
                Number(truck_capacity_kg)

            if (
                !Number.isFinite(truckCapacity) ||
                truckCapacity <= 0
            ) {

                return res.status(400).json({
                    error: 'Truck capacity must be greater than 0 kg.'
                })

            }


            // ------------------------------------
            // MILEAGE
            // ------------------------------------

            if (
                mileage_kmpl !== undefined &&
                mileage_kmpl !== null &&
                mileage_kmpl !== ''
            ) {

                mileage =
                    Number(mileage_kmpl)

            }

            if (
                !Number.isFinite(mileage) ||
                mileage < 2 ||
                mileage > 10
            ) {

                return res.status(400).json({
                    error: 'Fuel mileage must be between 2 and 10 km/L.'
                })

            }

        }


        // ========================================
        // CHECK EXISTING EMAIL
        // ========================================

        const existingUser =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER($1)
                `,
                [cleanEmail]
            )


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                error: 'This email is already registered. Please login instead.'
            })

        }


        // ========================================
        // CHECK EXISTING PHONE
        // ========================================

        const existingPhone =
            await pool.query(
                `
                SELECT id
                FROM users
                WHERE phone = $1
                `,
                [cleanPhone]
            )


        if (existingPhone.rows.length > 0) {

            return res.status(409).json({
                error: 'This phone number is already registered.'
            })

        }


        // ========================================
        // CHECK TRUCK NUMBER
        // ========================================

        if (role === 'transporter') {

            const existingTruck =
                await pool.query(
                    `
                    SELECT id
                    FROM users
                    WHERE truck_number = $1
                    `,
                    [cleanTruckNumber]
                )


            if (existingTruck.rows.length > 0) {

                return res.status(409).json({
                    error: 'This truck registration number is already registered.'
                })

            }

        }


        // ========================================
        // HASH PASSWORD
        // ========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            )


        // ========================================
        // CREATE USER
        // ========================================

        const result =
            await pool.query(

                `
                INSERT INTO users
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
                    total_trips
                `,

                [
                    cleanName,
                    cleanEmail,
                    hashedPassword,
                    role,
                    cleanPhone,
                    cleanTruckNumber,
                    cleanTruckType,
                    truckCapacity,
                    mileage
                ]

            )


        const newUser =
            result.rows[0]


        // ========================================
        // CHECK JWT SECRET
        // ========================================

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is missing from environment variables.'
            )

            return res.status(500).json({
                error: 'Server configuration error. Please contact the administrator.'
            })

        }


        // ========================================
        // CREATE JWT
        // ========================================

        const token =
            jwt.sign(

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


        // ========================================
        // SUCCESS
        // ========================================

        return res.status(201).json({

            message:
                'Account created successfully.',

            token,

            user:
                newUser

        })


    } catch (err) {

        console.error(
            'Registration error:',
            err
        )


        // ========================================
        // POSTGRES UNIQUE ERROR
        // ========================================

        if (err.code === '23505') {

            const detail =
                err.detail || ''

            if (
                detail.includes('email')
            ) {

                return res.status(409).json({
                    error: 'This email is already registered.'
                })

            }

            if (
                detail.includes('phone')
            ) {

                return res.status(409).json({
                    error: 'This phone number is already registered.'
                })

            }

            if (
                detail.includes('truck')
            ) {

                return res.status(409).json({
                    error: 'This truck registration number is already registered.'
                })

            }

            return res.status(409).json({
                error: 'An account with these details already exists.'
            })

        }


        // ========================================
        // INVALID DATA TYPE
        // ========================================

        if (err.code === '22P02') {

            return res.status(400).json({
                error: 'Some of the information you entered is invalid.'
            })

        }


        // ========================================
        // DATABASE CONNECTION ERROR
        // ========================================

        if (
            err.code === 'ECONNREFUSED' ||
            err.code === 'ENOTFOUND'
        ) {

            return res.status(503).json({
                error: 'Unable to connect to the database. Please try again later.'
            })

        }


        // ========================================
        // GENERAL SERVER ERROR
        // ========================================

        return res.status(500).json({
            error: 'Unable to create your account right now. Please try again.'
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


        // ========================================
        // CLEAN INPUT
        // ========================================

        const cleanEmail =
            typeof email === 'string'
                ? email.trim().toLowerCase()
                : ''


        // ========================================
        // EMAIL
        // ========================================

        if (!cleanEmail) {

            return res.status(400).json({
                error: 'Email address is required.'
            })

        }

        if (!isValidEmail(cleanEmail)) {

            return res.status(400).json({
                error: 'Please enter a valid email address.'
            })

        }


        // ========================================
        // PASSWORD
        // ========================================

        if (!password) {

            return res.status(400).json({
                error: 'Password is required.'
            })

        }


        // ========================================
        // FIND USER
        // ========================================

        const result =
            await pool.query(

                `
                SELECT
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
                WHERE LOWER(email) = LOWER($1)
                `,

                [cleanEmail]

            )


        // ========================================
        // USER NOT FOUND
        // ========================================

        if (result.rows.length === 0) {

            return res.status(401).json({
                error: 'Invalid email or password.'
            })

        }


        const user =
            result.rows[0]


        // ========================================
        // CHECK PASSWORD
        // ========================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            )


        if (!passwordMatch) {

            return res.status(401).json({
                error: 'Invalid email or password.'
            })

        }


        // ========================================
        // JWT SECRET
        // ========================================

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is missing from environment variables.'
            )

            return res.status(500).json({
                error: 'Server configuration error. Please contact the administrator.'
            })

        }


        // ========================================
        // CREATE JWT
        // ========================================

        const token =
            jwt.sign(

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


        // ========================================
        // REMOVE PASSWORD
        // ========================================

        delete user.password


        // ========================================
        // SUCCESS
        // ========================================

        return res.json({

            message:
                'Login successful.',

            token,

            user

        })


    } catch (err) {

        console.error(
            'Login error:',
            err
        )


        // ========================================
        // DATABASE CONNECTION ERROR
        // ========================================

        if (
            err.code === 'ECONNREFUSED' ||
            err.code === 'ENOTFOUND'
        ) {

            return res.status(503).json({
                error: 'Unable to connect to the database. Please try again later.'
            })

        }


        // ========================================
        // GENERAL SERVER ERROR
        // ========================================

        return res.status(500).json({
            error: 'Unable to login right now. Please try again.'
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