const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
const dotenv = require('dotenv')

dotenv.config()

const pool = require('./db/connection')

// ========================================
// ROUTES
// ========================================

const authRoutes = require('./routes/auth')
const shipmentRoutes = require('./routes/shipments')
const bidRoutes = require('./routes/bids')

// ========================================
// EXPRESS APP
// ========================================

const app = express()

// ========================================
// HTTP SERVER
// ========================================

const server = http.createServer(app)

// ========================================
// SOCKET.IO
// ========================================
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://smartfreight-frontend.onrender.com'
        ],
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE'
        ],
        credentials: true
    }
})

// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: [
            'http://localhost:5173',
            'https://smartfreight-frontend.onrender.com'
        ],
        credentials: true
    })
)

app.use(express.json())

app.use(
    express.urlencoded({
        extended: true
    })
)

// ========================================
// BASIC ROUTE
// ========================================

app.get('/', (req, res) => {
    res.json({
        message: 'SmartFreight API is running'
    })
})

// ========================================
// API ROUTES
// ========================================

app.use('/auth', authRoutes)

app.use('/shipments', shipmentRoutes)

app.use('/bids', bidRoutes)

// ========================================
// LATEST TRUCK LOCATIONS
// ========================================

const latestLocations = new Map()

// ========================================
// ARRIVAL LOCK
// ========================================
//
// Prevents multiple arrival events from being
// processed at the same time.
//
// shipmentId -> true
//
// This is only an in-memory protection.
// The database check below is still the
// permanent protection.
//

const arrivalLocks = new Set()

// ========================================
// SOCKET.IO CONNECTION
// ========================================

io.on('connection', (socket) => {

    console.log(
        `User connected: ${socket.id}`
    )

    // ====================================
    // JOIN SHIPMENT ROOM
    // ====================================

    socket.on(
        'join-shipment',
        async (shipmentId) => {

            try {

                if (!shipmentId) {

                    console.log(
                        '❌ Missing shipment ID'
                    )

                    return
                }

                const shipmentKey =
                    String(shipmentId)

                const room =
                    `shipment-${shipmentKey}`

                socket.join(room)

                console.log(
                    `Socket ${socket.id} joined shipment ${shipmentKey}`
                )

                // ==================================
                // SEND LAST KNOWN LOCATION
                // ==================================

                const lastLocation =
                    latestLocations.get(
                        shipmentKey
                    )

                if (lastLocation) {

                    socket.emit(
                        'truck-location',
                        lastLocation
                    )

                    console.log(
                        `📍 Sent previous truck location to ${socket.id}`
                    )
                }

                // ==================================
                // GET SHIPMENT STATE
                // ==================================

                const result =
                    await pool.query(
                        `
                        SELECT
                            id,
                            status,
                            arrived_at
                        FROM shipments
                        WHERE id = $1
                        `,
                        [shipmentId]
                    )

                if (
                    result.rows.length === 0
                ) {

                    console.log(
                        `❌ Shipment not found: ${shipmentKey}`
                    )

                    return
                }

                const shipment =
                    result.rows[0]

                console.log(
                    '📦 Shipment state:',
                    {
                        id:
                            shipment.id,

                        status:
                            shipment.status,

                        arrived_at:
                            shipment.arrived_at
                    }
                )

                // ==================================
                // RESTORE ARRIVAL STATE
                // ==================================

                if (shipment.arrived_at) {

                    socket.emit(
                        'shipment-arrived',
                        {
                            shipmentId:
                                shipmentKey,

                            arrived_at:
                                shipment.arrived_at,

                            message:
                                'The truck has already reached the destination.'
                        }
                    )

                    console.log(
                        `📦 Previous arrival restored for ${socket.id}`
                    )
                }

            } catch (error) {

                console.error(
                    '❌ Join shipment error:',
                    error
                )
            }
        }
    )

    // ====================================
    // TRUCK LOCATION UPDATE
    // ====================================

    socket.on(
        'location-update',
        async (data) => {

            try {

                const {
                    shipmentId,
                    lat,
                    lng,
                    mode,
                    accuracy
                } = data || {}

                // ==================================
                // VALIDATE DATA
                // ==================================

                if (
                    !shipmentId ||
                    lat === undefined ||
                    lng === undefined
                ) {

                    console.log(
                        '❌ Invalid location update'
                    )

                    return
                }

                const shipmentKey =
                    String(shipmentId)

                // ==================================
                // CONVERT COORDINATES
                // ==================================

                const latitude =
                    Number(lat)

                const longitude =
                    Number(lng)

                // ==================================
                // VALIDATE COORDINATES
                // ==================================

                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {

                    console.log(
                        '❌ Invalid latitude/longitude:',
                        lat,
                        lng
                    )

                    return
                }

                // ==================================
                // ACCURACY
                // ==================================

                let locationAccuracy = null

                if (
                    accuracy !== undefined &&
                    accuracy !== null
                ) {

                    const parsedAccuracy =
                        Number(accuracy)

                    if (
                        Number.isFinite(
                            parsedAccuracy
                        )
                    ) {

                        locationAccuracy =
                            parsedAccuracy
                    }
                }

                // ==================================
                // CREATE LOCATION OBJECT
                // ==================================

                const locationData = {

                    shipmentId:
                        shipmentKey,

                    lat:
                        latitude,

                    lng:
                        longitude,

                    mode:
                        mode ||
                        'simulation',

                    accuracy:
                        locationAccuracy,

                    updatedAt:
                        new Date().toISOString()
                }

                // ==================================
                // SAVE LATEST LOCATION
                // ==================================

                latestLocations.set(
                    shipmentKey,
                    locationData
                )

                console.log(
                    `🚚 Truck location updated for shipment ${shipmentKey}:`,
                    latitude,
                    longitude,
                    locationData.mode
                )

                // ==================================
                // SAVE LOCATION HISTORY
                // ==================================

                try {

                    await pool.query(
                        `
                        INSERT INTO location_history
                        (
                            shipment_id,
                            lat,
                            lng,
                            recorded_at
                        )
                        VALUES
                        (
                            $1,
                            $2,
                            $3,
                            NOW()
                        )
                        `,
                        [
                            shipmentId,
                            latitude,
                            longitude
                        ]
                    )

                    console.log(
                        '📍 Location saved to database'
                    )

                } catch (historyError) {

                    console.error(
                        '⚠️ Location history error:',
                        historyError.message
                    )
                }

                // ==================================
                // SEND LOCATION TO VIEWERS
                // ==================================

                io
                    .to(
                        `shipment-${shipmentKey}`
                    )
                    .emit(
                        'truck-location',
                        locationData
                    )

            } catch (error) {

                console.error(
                    '❌ Location update error:',
                    error
                )
            }
        }
    )

    // ====================================
    // SHIPMENT ARRIVED
    // ====================================

    socket.on(
        'shipment-arrived',
        async (data) => {

            try {

                const {
                    shipmentId,
                    arrived_at
                } = data || {}

                // ==================================
                // VALIDATE
                // ==================================

                if (!shipmentId) {

                    console.log(
                        '❌ Missing shipmentId in arrival event'
                    )

                    return
                }

                const shipmentKey =
                    String(shipmentId)

                // ==================================
                // DUPLICATE EVENT LOCK
                // ==================================

                if (
                    arrivalLocks.has(
                        shipmentKey
                    )
                ) {

                    console.log(
                        `⚠️ Arrival already being processed for ${shipmentKey}. Ignoring duplicate event.`
                    )

                    return
                }

                // Lock immediately
                arrivalLocks.add(
                    shipmentKey
                )

                try {

                    console.log(
                        `📦 Shipment ${shipmentKey} reached destination`
                    )

                    // ==================================
                    // FIRST CHECK DATABASE
                    // ==================================

                    const existingResult =
                        await pool.query(
                            `
                            SELECT
                                id,
                                status,
                                arrived_at
                            FROM shipments
                            WHERE id = $1
                            `,
                            [shipmentId]
                        )

                    if (
                        existingResult.rows.length === 0
                    ) {

                        console.log(
                            `❌ Shipment not found: ${shipmentKey}`
                        )

                        return
                    }

                    const existingShipment =
                        existingResult.rows[0]

                    // ==================================
                    // ALREADY ARRIVED
                    // ==================================
                    //
                    // DO NOT UPDATE.
                    // DO NOT SEND another arrival event.
                    //

                    if (
                        existingShipment.arrived_at
                    ) {

                        console.log(
                            `⚠️ Shipment ${shipmentKey} already has arrived_at. Ignoring duplicate arrival.`
                        )

                        return
                    }

                    // ==================================
                    // ONLY ASSIGNED / IN_TRANSIT
                    // ==================================

                    if (
                        existingShipment.status !== 'assigned' &&
                        existingShipment.status !== 'in_transit'
                    ) {

                        console.log(
                            `⚠️ Shipment ${shipmentKey} has status "${existingShipment.status}". Arrival ignored.`
                        )

                        return
                    }

                    // ==================================
                    // ARRIVAL TIME
                    // ==================================

                    let arrivalTime =
                        new Date()

                    if (arrived_at) {

                        const parsedDate =
                            new Date(arrived_at)

                        if (
                            !Number.isNaN(
                                parsedDate.getTime()
                            )
                        ) {

                            arrivalTime =
                                parsedDate
                        }
                    }

                    // ==================================
                    // SAVE ARRIVAL
                    // ==================================
                    //
                    // arrived_at IS NULL is extremely
                    // important here.
                    //
                    // It guarantees that only the
                    // first arrival request can save.
                    //

                    const result =
                        await pool.query(
                            `
                            UPDATE shipments
                            SET
                                arrived_at = $1
                            WHERE
                                id = $2
                                AND arrived_at IS NULL
                                AND status IN (
                                    'assigned',
                                    'in_transit'
                                )
                            RETURNING
                                id,
                                status,
                                arrived_at
                            `,
                            [
                                arrivalTime,
                                shipmentId
                            ]
                        )

                    // ==================================
                    // NOTHING UPDATED
                    // ==================================

                    if (
                        result.rows.length === 0
                    ) {

                        console.log(
                            `⚠️ Arrival for ${shipmentKey} was already saved or shipment state changed.`
                        )

                        return
                    }

                    // ==================================
                    // SUCCESS
                    // ==================================

                    const shipment =
                        result.rows[0]

                    console.log(
                        '======================================'
                    )

                    console.log(
                        '✅ SHIPMENT ARRIVAL SAVED'
                    )

                    console.log(
                        `Shipment ID: ${shipment.id}`
                    )

                    console.log(
                        `Status: ${shipment.status}`
                    )

                    console.log(
                        `Arrived At: ${shipment.arrived_at}`
                    )

                    console.log(
                        '======================================'
                    )

                    // ==================================
                    // NOTIFY VIEWERS ONCE
                    // ==================================

                    io
                        .to(
                            `shipment-${shipmentKey}`
                        )
                        .emit(
                            'shipment-arrived',
                            {
                                shipmentId:
                                    shipmentKey,

                                arrived_at:
                                    shipment.arrived_at,

                                message:
                                    'The truck has reached the destination.'
                            }
                        )

                    console.log(
                        `📢 Arrival notification sent for shipment ${shipmentKey}`
                    )

                } finally {

                    // ==================================
                    // RELEASE LOCK
                    // ==================================

                    arrivalLocks.delete(
                        shipmentKey
                    )
                }

            } catch (error) {

                console.error(
                    '======================================'
                )

                console.error(
                    '❌ SHIPMENT ARRIVAL ERROR'
                )

                console.error(
                    error
                )

                console.error(
                    '======================================'
                )
            }
        }
    )

    // ====================================
    // DISCONNECT
    // ====================================

    socket.on(
        'disconnect',
        () => {

            console.log(
                `User disconnected: ${socket.id}`
            )
        }
    )
})

// ========================================
// ERROR HANDLING
// ========================================

app.use(
    (err, req, res, next) => {

        console.error(
            '❌ Server error:',
            err
        )

        res.status(500).json({
            error:
                'Internal server error'
        })
    }
)

// ========================================
// START SERVER
// ========================================

const PORT =
    process.env.PORT || 3000

server.listen(
    PORT,
    async () => {

        console.log(
            `🚛 SmartFreight server running on port ${PORT}`
        )

        try {

            const result =
                await pool.query(
                    'SELECT NOW()'
                )

            console.log(
                'PostgreSQL connected successfully'
            )

            console.log(
                `Database time: ${result.rows[0].now}`
            )

        } catch (error) {

            console.error(
                '❌ PostgreSQL connection failed:',
                error.message
            )
        }
    }
)