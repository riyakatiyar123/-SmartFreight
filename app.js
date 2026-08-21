require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const app = express()

// create HTTP server wrapping express
const server = http.createServer(app)

// attach socket.io to the server
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
})

// middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// make io accessible in controllers
app.set('io', io)

// socket.io connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // transporter joins a shipment room to watch it
    socket.on('join-shipment', (shipmentId) => {
        socket.join(shipmentId)
        console.log(`Socket ${socket.id} joined shipment ${shipmentId}`)
    })

    socket.on(
    'location-update',
    ({ shipmentId, lat, lng, mode, accuracy }) => {

        // Broadcast location to everyone
        // watching this shipment
        io.to(shipmentId).emit(
            'truck-location',
            {
                lat,
                lng,
                mode,
                accuracy
            }
        )

        console.log(
            `Location update for ${shipmentId}:`,
            lat,
            lng,
            mode
        )
    }
)

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})

// routes
const authRoutes = require('./routes/auth')
const shipmentRoutes = require('./routes/shipments')
const bidRoutes = require('./routes/bids')

app.use('/auth', authRoutes)
app.use('/shipments', shipmentRoutes)
app.use('/bids', bidRoutes)

// test route
app.get('/', (req, res) => {
    res.json({
        message: 'SmartFreight API is running',
        version: '1.0.0'
    })
})

// error handling
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err
    res.status(statusCode).json({ error: message })
})

const PORT = process.env.PORT || 3000

// use server.listen not app.listen
server.listen(PORT, () => {
    console.log(`SmartFreight server running on port ${PORT}`)
})

require('./db/connection')

module.exports = { io }