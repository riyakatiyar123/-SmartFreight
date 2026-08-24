import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io } from 'socket.io-client'

import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap
} from 'react-leaflet'

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import api from '../utils/api'
import Navbar from '../components/Navbar'
import BidCard from '../components/BidCard'
import TripCostAnalyzer from '../components/TripCostAnalyzer'

import '../styles/ShipmentDetail.css'


// ========================================
// FORMAT CITY NAME
// ========================================

const formatCityName = (city) => {

    if (!city) return ''

    return city
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(' ')
}


// ========================================
// LEAFLET ICON FIX
// ========================================

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

    iconUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

    shadowUrl:
        'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})


// ========================================
// MAP FOLLOWER
// ========================================

const MapFollower = ({ truckLocation }) => {

    const map = useMap()

    useEffect(() => {

        if (!truckLocation) return

        const lat = Number(truckLocation.lat)
        const lng = Number(truckLocation.lng)

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return
        }

        map.setView(
            [lat, lng],
            map.getZoom(),
            {
                animate: true
            }
        )

    }, [truckLocation, map])

    return null
}


// ========================================
// SHIPMENT DETAIL
// ========================================

const ShipmentDetail = () => {

    const { id } = useParams()
    const navigate = useNavigate()


    // ========================================
    // USER
    // ========================================

    let user = null

    try {

        const raw = localStorage.getItem('user')

        user = raw
            ? JSON.parse(raw)
            : null

    } catch (err) {

        console.error('Invalid user:', err)

    }


    // ========================================
    // REFS
    // ========================================

    const socketRef = useRef(null)

    const simulationIntervalRef = useRef(null)

    const locationIntervalRef = useRef(null)

    const simulationRouteRef = useRef([])

    const simulationIndexRef = useRef(0)

    const arrivalEmittedRef = useRef(false)

    const mountedRef = useRef(true)


    // ========================================
    // SHIPMENT STATE
    // ========================================

    const [shipment, setShipment] = useState(null)

    const [bids, setBids] = useState([])

    const [isLoading, setIsLoading] = useState(true)

    const [error, setError] = useState('')


    // ========================================
    // BID STATE
    // ========================================

    const [bidAmount, setBidAmount] = useState('')

    const [bidNote, setBidNote] = useState('')

    const [bidError, setBidError] = useState('')

    const [bidSuccess, setBidSuccess] = useState('')

    const [isSubmitting, setIsSubmitting] = useState(false)

    const [acceptingBid, setAcceptingBid] = useState(null)


    // ========================================
    // TRACKING STATE
    // ========================================

    const [truckLocation, setTruckLocation] = useState(null)

    const [trackingMode, setTrackingMode] = useState('simulation')

    const [isSharingLocation, setIsSharingLocation] = useState(false)

    const [destinationReached, setDestinationReached] = useState(false)

    const [arrivalTime, setArrivalTime] = useState(null)


    // ========================================
    // DELIVERY STATE
    // ========================================

    const [deliveryCondition, setDeliveryCondition] = useState('good')

    const [deliveryNotes, setDeliveryNotes] = useState('')

    const [deliveryRating, setDeliveryRating] = useState(5)

    const [hoverRating, setHoverRating] = useState(0)

    const [deliveryComment, setDeliveryComment] = useState('')

    const [isCompletingDelivery, setIsCompletingDelivery] = useState(false)

    const [deliveryError, setDeliveryError] = useState('')


    // ========================================
    // RATING LABELS
    // ========================================

    const ratingLabels = {
        1: 'Very Poor',
        2: 'Poor',
        3: 'Average',
        4: 'Very Good',
        5: 'Excellent'
    }


    // ========================================
    // CLEAR TIMERS
    // ========================================

    const clearTrackingTimers = () => {

        if (simulationIntervalRef.current) {

            clearInterval(
                simulationIntervalRef.current
            )

            simulationIntervalRef.current = null
        }

        if (locationIntervalRef.current) {

            clearInterval(
                locationIntervalRef.current
            )

            locationIntervalRef.current = null
        }
    }


    // ========================================
    // FETCH SHIPMENT + BIDS
    // ========================================

    const fetchShipmentAndBids = async () => {

        try {

            const [
                shipmentRes,
                bidsRes
            ] = await Promise.all([

                api.get(`/shipments/${id}`),

                api.get(`/bids/${id}`)

            ])

            if (!mountedRef.current) {
                return
            }

            const shipmentData = shipmentRes.data

            const bidsData =
                Array.isArray(bidsRes.data)
                    ? bidsRes.data
                    : []

            setShipment(shipmentData)

            setBids(bidsData)


            // ====================================
            // RESTORE ARRIVAL STATE
            // ====================================

            if (shipmentData.arrived_at) {

                setDestinationReached(true)

                setArrivalTime(
                    shipmentData.arrived_at
                )

            } else {

                setDestinationReached(false)

                setArrivalTime(
                    shipmentData.actual_delivery_time ||
                    null
                )

            }

        } catch (err) {

            console.error(
                'Failed to load shipment:',
                err
            )

            if (mountedRef.current) {

                setError(
                    err.response?.data?.error ||
                    'Failed to load shipment details'
                )

            }

        } finally {

            if (mountedRef.current) {
                setIsLoading(false)
            }

        }

    }


    // ========================================
    // SOCKET CONNECTION
    // ========================================

    useEffect(() => {

        mountedRef.current = true

        if (!user) {

            navigate('/')

            return

        }

        fetchShipmentAndBids()


        const socket = io(
            import.meta.env.VITE_API_URL || 'http://localhost:3000',
            {
                transports: [
                    'websocket',
                    'polling'
                ],

                reconnection: true,

                reconnectionAttempts: 10,

                reconnectionDelay: 1000
            }
        )

        socketRef.current = socket


        // ====================================
        // CONNECT
        // ====================================

        socket.on(
            'connect',
            () => {

                console.log(
                    '🔌 Socket connected:',
                    socket.id
                )

                socket.emit(
                    'join-shipment',
                    String(id)
                )

            }
        )


        // ====================================
        // SOCKET ERROR
        // ====================================

        socket.on(
            'connect_error',
            err => {

                console.warn(
                    'Socket error:',
                    err.message
                )

            }
        )


        // ====================================
        // NEW BID
        // ====================================

        socket.on(
            'new-bid',
            newBid => {

                if (!newBid) return

                setBids(prev => {

                    const exists =
                        prev.some(
                            bid =>
                                String(bid.id) ===
                                String(newBid.id)
                        )

                    if (exists) {
                        return prev
                    }

                    return [
                        ...prev,
                        newBid
                    ]

                })

            }
        )


        // ====================================
        // BID ACCEPTED
        // ====================================

        socket.on(
            'bid-accepted',
            ({ bidId }) => {

                setBids(
                    prev =>
                        prev.map(
                            bid => ({

                                ...bid,

                                status:
                                    String(bid.id) ===
                                    String(bidId)
                                        ? 'accepted'
                                        : 'rejected'

                            })
                        )
                )

                setShipment(
                    prev =>
                        prev
                            ? {
                                ...prev,
                                status: 'assigned'
                            }
                            : prev
                )

            }
        )


        // ====================================
        // TRUCK LOCATION
        // ====================================

        socket.on(
            'truck-location',
            data => {

                if (!data) return

                const lat = Number(data.lat)

                const lng = Number(data.lng)

                if (
                    !Number.isFinite(lat) ||
                    !Number.isFinite(lng)
                ) {
                    return
                }

                setTruckLocation({

                    lat,

                    lng,

                    mode:
                        data.mode ||
                        'simulation',

                    accuracy:
                        data.accuracy == null
                            ? null
                            : Number(data.accuracy),

                    updatedAt:
                        data.updatedAt ||
                        new Date().toISOString()

                })

            }
        )


        // ====================================
        // SHIPMENT ARRIVED
        // ====================================

        socket.on(
            'shipment-arrived',
            data => {

                const arrivedAt =
                    data?.arrived_at ||
                    new Date().toISOString()

                console.log(
                    '🎯 Shipment arrived:',
                    arrivedAt
                )

                setDestinationReached(true)

                setArrivalTime(arrivedAt)

                setIsSharingLocation(false)

                setShipment(
                    prev =>
                        prev
                            ? {
                                ...prev,

                                status: 'in_transit',

                                arrived_at: arrivedAt
                            }
                            : prev
                )

            }
        )


        // ====================================
        // CLEANUP
        // ====================================

        return () => {

            mountedRef.current = false

            clearTrackingTimers()

            simulationRouteRef.current = []

            simulationIndexRef.current = 0

            arrivalEmittedRef.current = false

            socket.removeAllListeners()

            socket.disconnect()

            socketRef.current = null

        }

    }, [id])


    // ========================================
    // PLACE BID
    // ========================================

    const handlePlaceBid = async e => {

        e.preventDefault()

        setBidError('')

        setBidSuccess('')

        const amount = Number(bidAmount)

        if (
            !Number.isFinite(amount) ||
            amount < 100
        ) {

            setBidError(
                'Please enter a valid bid amount.'
            )

            return
        }

        setIsSubmitting(true)

        try {

            await api.post(
                '/bids',
                {
                    shipment_id: id,
                    amount,
                    note:
                        bidNote.trim() ||
                        null
                }
            )

            setBidAmount('')

            setBidNote('')

            setBidSuccess(
                'Bid placed! The shipper will be notified.'
            )

            await fetchShipmentAndBids()

        } catch (err) {

            setBidError(
                err.response?.data?.error ||
                'Failed to place bid'
            )

        } finally {

            setIsSubmitting(false)

        }

    }


    // ========================================
    // ACCEPT BID
    // ========================================

    const handleAcceptBid = async bidId => {

        setError('')

        setAcceptingBid(bidId)

        try {

            await api.put(
                `/bids/${bidId}/accept`
            )

            await fetchShipmentAndBids()

        } catch (err) {

            setError(
                err.response?.data?.error ||
                'Failed to accept bid'
            )

        } finally {

            setAcceptingBid(null)

        }

    }


    // ========================================
    // WITHDRAW BID
    // ========================================

    const handleWithdrawBid = async bidId => {

        setError('')

        try {

            await api.put(
                `/bids/${bidId}/withdraw`
            )

            await fetchShipmentAndBids()

        } catch (err) {

            setError(
                err.response?.data?.error ||
                'Failed to withdraw bid'
        )

        }

    }


    // ========================================
    // MARK PICKED UP
    // ========================================

    const handleMarkPickedUp = async () => {

        setError('')

        try {

            const response =
                await api.put(
                    `/shipments/${id}/pickup`
                )

            if (response.data?.shipment) {

                setShipment(
                    response.data.shipment
                )

            } else {

                await fetchShipmentAndBids()

            }

        } catch (err) {

            setError(
                err.response?.data?.error ||
                'Failed to mark shipment as picked up'
            )

        }

    }


    // ========================================
    // COMPLETE DELIVERY
    // ========================================

    const handleCompleteDelivery = async () => {

        setDeliveryError('')

        if (
            deliveryRating < 1 ||
            deliveryRating > 5
        ) {

            setDeliveryError(
                'Please select a rating between 1 and 5.'
            )

            return

        }

        setIsCompletingDelivery(true)

        try {

            const response =
                await api.post(
                    `/shipments/${id}/complete`,
                    {
                        delivery_condition:
                            deliveryCondition,

                        delivery_notes:
                            deliveryNotes.trim() ||
                            null,

                        rating:
                            Number(deliveryRating),

                        comment:
                            deliveryComment.trim() ||
                            null
                    }
                )

            if (response.data?.shipment) {

                setShipment(
                    response.data.shipment
                )

            } else {

                await fetchShipmentAndBids()

            }

            setDestinationReached(false)

        } catch (err) {

            setDeliveryError(
                err.response?.data?.error ||
                'Failed to confirm delivery'
            )

        } finally {

            setIsCompletingDelivery(false)

        }

    }


    // ========================================
    // CITY COORDINATES
    // ========================================

    const cityCoordinates = {

        kanpur: {
            lat: 26.4499,
            lng: 80.3319
        },

        noida: {
            lat: 28.5355,
            lng: 77.3910
        },

        delhi: {
            lat: 28.6139,
            lng: 77.2090
        },

        newdelhi: {
            lat: 28.6139,
            lng: 77.2090
        },

        lucknow: {
            lat: 26.8467,
            lng: 80.9462
        },

        agra: {
            lat: 27.1767,
            lng: 78.0081
        },

        ghaziabad: {
            lat: 28.6692,
            lng: 77.4538
        },

        meerut: {
            lat: 28.9845,
            lng: 77.7064
        },

        jaipur: {
            lat: 26.9124,
            lng: 75.7873
        },

        gurugram: {
            lat: 28.4595,
            lng: 77.0266
        },

        gurgaon: {
            lat: 28.4595,
            lng: 77.0266
        },

        chandigarh: {
            lat: 30.7333,
            lng: 76.7794
        },

        varanasi: {
            lat: 25.3176,
            lng: 82.9739
        },

        prayagraj: {
            lat: 25.4358,
            lng: 81.8463
        },

        allahabad: {
            lat: 25.4358,
            lng: 81.8463
        },

        patna: {
            lat: 25.5941,
            lng: 85.1376
        },

        bhopal: {
            lat: 23.2599,
            lng: 77.4126
        },

        indore: {
            lat: 22.7196,
            lng: 75.8577
        },

        mumbai: {
            lat: 19.0760,
            lng: 72.8777
        },

        pune: {
            lat: 18.5204,
            lng: 73.8567
        },

        ahmedabad: {
            lat: 23.0225,
            lng: 72.5714
        },

        surat: {
            lat: 21.1702,
            lng: 72.8311
        },

        bengaluru: {
            lat: 12.9716,
            lng: 77.5946
        },

        bangalore: {
            lat: 12.9716,
            lng: 77.5946
        },

        hyderabad: {
            lat: 17.3850,
            lng: 78.4867
        },

        chennai: {
            lat: 13.0827,
            lng: 80.2707
        },

        kolkata: {
            lat: 22.5726,
            lng: 88.3639
        }

    }


    // ========================================
    // GEOCODE LOCATION
    // ========================================

    const geocodeLocation = async (
        city,
        address
    ) => {

        if (!city) {

            throw new Error(
                'City name is missing.'
            )

        }

        const normalizedCity =
            city
                .toLowerCase()
                .trim()

        const cityKey =
            normalizedCity
                .replace(/\s+/g, '')
                .replace(/-/g, '')

        if (cityCoordinates[cityKey]) {

            return cityCoordinates[cityKey]

        }

        const request = async query => {

            const response =
                await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(query)}`,
                    {
                        headers: {
                            Accept:
                                'application/json'
                        }
                    }
                )

            if (!response.ok) {

                throw new Error(
                    `Location service returned ${response.status}.`
                )

            }

            return response.json()

        }

        try {

            let data =
                await request(
                    address?.trim()
                        ? `${address}, ${city}, India`
                        : `${city}, India`
                )

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                data =
                    await request(
                        `${city}, India`
                    )

            }

            if (
                !Array.isArray(data) ||
                data.length === 0
            ) {

                throw new Error(
                    `Location not found: ${city}.`
                )

            }

            const lat =
                Number(data[0].lat)

            const lng =
                Number(data[0].lon)

            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng)
            ) {

                throw new Error(
                    `Invalid coordinates for ${city}.`
                )

            }

            return {
                lat,
                lng
            }

        } catch (err) {

            console.error(
                'Geocoding failed:',
                err
            )

            throw new Error(
                `Could not locate ${city}. Add this city to cityCoordinates.`
            )

        }

    }


    // ========================================
    // DEMO SIMULATION
    // ========================================

    const startSimulation = async () => {

        setError('')

        if (isSharingLocation) {
            return
        }

        if (!shipment) {

            setError(
                'Shipment data is not loaded yet.'
            )

            return

        }

        if (
            !shipment.from_city ||
            !shipment.to_city
        ) {

            setError(
                'Pickup and delivery cities are required for simulation.'
            )

            return

        }

        try {

            clearTrackingTimers()

            simulationRouteRef.current = []

            simulationIndexRef.current = 0

            arrivalEmittedRef.current = false

            setDestinationReached(false)

            setArrivalTime(null)

            setTruckLocation(null)

            setIsSharingLocation(true)


            // ====================================
            // START
            // ====================================

            const start =
                await geocodeLocation(
                    shipment.from_city,
                    shipment.pickup_address
                )


            // ====================================
            // END
            // ====================================

            const end =
                await geocodeLocation(
                    shipment.to_city,
                    shipment.delivery_address
                )


            console.log(
                `🚚 Route: ${shipment.from_city} → ${shipment.to_city}`
            )


            // ====================================
            // CREATE ROUTE
            // ====================================

            const numberOfPoints = 20

            const route = []

            for (
                let i = 0;
                i <= numberOfPoints;
                i++
            ) {

                const progress =
                    i / numberOfPoints

                const lat =
                    start.lat +
                    (
                        end.lat -
                        start.lat
                    ) *
                    progress

                const lng =
                    start.lng +
                    (
                        end.lng -
                        start.lng
                    ) *
                    progress

                route.push({
                    lat,
                    lng
                })

            }

            simulationRouteRef.current = route

            simulationIndexRef.current = 0


            // ====================================
            // MOVE TRUCK
            // ====================================

            const moveTruck = () => {

                const currentRoute =
                    simulationRouteRef.current

                const currentIndex =
                    simulationIndexRef.current

                const location =
                    currentRoute[currentIndex]

                if (!location) {

                    clearTrackingTimers()

                    setIsSharingLocation(false)

                    return

                }

                const isFinalPoint =
                    currentIndex >=
                    currentRoute.length - 1

                const updatedAt =
                    new Date().toISOString()


                // ====================================
                // UPDATE MAP
                // ====================================

                setTruckLocation({

                    lat: location.lat,

                    lng: location.lng,

                    mode: 'simulation',

                    accuracy: null,

                    updatedAt

                })


                const socket =
                    socketRef.current


                // ====================================
                // SEND LOCATION
                // ====================================

                if (
                    socket &&
                    socket.connected
                ) {

                    socket.emit(
                        'location-update',
                        {

                            shipmentId: id,

                            lat: location.lat,

                            lng: location.lng,

                            mode: 'simulation',

                            accuracy: null

                        }
                    )

                }


                // ====================================
                // DESTINATION REACHED
                // ====================================

                if (isFinalPoint) {

                    if (
                        arrivalEmittedRef.current
                    ) {

                        return

                    }

                    arrivalEmittedRef.current = true

                    const arrivedAt =
                        new Date().toISOString()


                    clearTrackingTimers()

                    setIsSharingLocation(false)

                    setDestinationReached(true)

                    setArrivalTime(arrivedAt)


                    // ====================================
                    // UPDATE LOCAL SHIPMENT
                    // ====================================

                    setShipment(
                        prev =>
                            prev
                                ? {
                                    ...prev,

                                    status: 'in_transit',

                                    arrived_at: arrivedAt
                                }
                                : prev
                    )


                    // ====================================
                    // NOTIFY SERVER
                    // ====================================

                    if (
                        socket &&
                        socket.connected
                    ) {

                        socket.emit(
                            'shipment-arrived',
                            {

                                shipmentId: id,

                                arrived_at: arrivedAt

                            }
                        )

                    }

                    console.log(
                        '🎯 DESTINATION REACHED:',
                        shipment.to_city
                    )

                    return
                }


                simulationIndexRef.current =
                    currentIndex + 1

            }


            // ====================================
            // FIRST LOCATION
            // ====================================

            moveTruck()


            // ====================================
            // MOVE EVERY 2 SECONDS
            // ====================================

            simulationIntervalRef.current =
                setInterval(
                    moveTruck,
                    2000
                )

        } catch (err) {

            console.error(
                'Simulation error:',
                err
            )

            clearTrackingTimers()

            setIsSharingLocation(false)

            setTruckLocation(null)

            setError(
                err.message ||
                'Unable to start demo simulation.'
            )

        }

    }


    // ========================================
    // REAL GPS
    // ========================================

    const startRealGPS = () => {

        if (!navigator.geolocation) {

            setError(
                'Geolocation is not supported on this device.'
            )

            return

        }

        clearTrackingTimers()

        setIsSharingLocation(true)


        const sendLocation = position => {

            const {
                latitude: lat,
                longitude: lng,
                accuracy
            } = position.coords

            setTruckLocation({

                lat,

                lng,

                mode: 'real',

                accuracy,

                updatedAt:
                    new Date().toISOString()

            })


            if (
                socketRef.current?.connected
            ) {

                socketRef.current.emit(
                    'location-update',
                    {

                        shipmentId: id,

                        lat,

                        lng,

                        accuracy,

                        mode: 'real'

                    }
                )

            }

        }


        const gpsError = err => {

            console.error(
                'GPS error:',
                err
            )

            setIsSharingLocation(false)

            setError(
                err.code === 1
                    ? 'Location permission denied. Please allow location access.'
                    : 'Unable to get your current location.'
            )

        }


        navigator.geolocation.getCurrentPosition(
            sendLocation,
            gpsError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )


        locationIntervalRef.current =
            setInterval(
                () => {

                    navigator.geolocation.getCurrentPosition(
                        sendLocation,
                        gpsError,
                        {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        }
                    )

                },
                5000
            )

    }


    // ========================================
    // START SHARING
    // ========================================

    const startSharingLocation = () => {

        setError('')

        if (isSharingLocation) {
            return
        }

        if (trackingMode === 'real') {

            startRealGPS()

        } else {

            startSimulation()

        }

    }


    // ========================================
    // STOP SHARING
    // ========================================

    const stopSharingLocation = () => {

        clearTrackingTimers()

        simulationRouteRef.current = []

        simulationIndexRef.current = 0

        arrivalEmittedRef.current = false

        setIsSharingLocation(false)

    }


    // ========================================
    // USER CHECK
    // ========================================

    if (!user) {
        return null
    }


    // ========================================
    // LOADING
    // ========================================

    if (isLoading) {

        return (

            <div className="shipment-detail-page">

                <Navbar />

                <div className="shipment-detail-container">

                    <div className="loading-state">
                        Loading shipment...
                    </div>

                </div>

            </div>

        )

    }


    // ========================================
    // SHIPMENT NOT FOUND
    // ========================================

    if (!shipment) {

        return (

            <div className="shipment-detail-page">

                <Navbar />

                <div className="shipment-detail-container">

                    <div className="detail-error">

                        {
                            error ||
                            'Shipment not found.'
                        }

                    </div>

                </div>

            </div>

        )

    }


    // ========================================
    // USER PERMISSIONS
    // ========================================

    const isMyShipment =
        user.role === 'shipper' &&
        String(shipment.user_id) ===
        String(user.id)


    const canBid =
        user.role === 'transporter' &&
        shipment.status === 'posted'


    const alreadyBid =
        bids.some(
            bid =>
                String(bid.transporter_id) ===
                String(user.id) &&
                bid.status !== 'withdrawn'
        )


    const isAssignedTransporter =
        user.role === 'transporter' &&
        String(shipment.transporter_id) ===
        String(user.id)


    // ========================================
    // ARRIVAL SECTIONS
    // ========================================

    const showArrivalConfirmation =
        isMyShipment &&
        destinationReached &&
        shipment.status === 'in_transit'


    const showTransporterReached =
        isAssignedTransporter &&
        destinationReached &&
        shipment.status === 'in_transit'


    // ========================================
    // UI
    // ========================================

    return (

        <div className="shipment-detail-page">

            <Navbar />

            <main className="shipment-detail-container">


                {/* ==================================
                    BACK
                ================================== */}

                <button
                    type="button"
                    className="back-btn"
                    onClick={() =>
                        navigate('/dashboard')
                    }
                >
                    ← Back to Dashboard
                </button>


                {/* ==================================
                    ERROR
                ================================== */}

                {error && (

                    <div className="form-error">
                        {error}
                    </div>

                )}


                {/* ==================================
                    HEADER
                ================================== */}

                <div className="detail-header">

                    <div>

                        <p className="detail-label">
                            SHIPMENT DETAILS
                        </p>

                        <h1>

                            {formatCityName(
                                shipment.from_city
                            )}

                            <span className="header-arrow">
                                →
                            </span>

                            {formatCityName(
                                shipment.to_city
                            )}

                        </h1>

                    </div>


                    <span
                        className={`detail-status status-${shipment.status}`}
                    >
                        {shipment.status}
                    </span>

                </div>


                {/* ==================================
                    SHIPMENT INFO
                ================================== */}

                <section className="shipment-info-card">

                    <div className="shipment-info-grid">

                        <div className="info-box">

                            <span>
                                Weight
                            </span>

                            <strong>
                                {shipment.weight_kg} kg
                            </strong>

                        </div>


                        <div className="info-box">

                            <span>
                                Budget
                            </span>

                            <strong>
                                ₹
                                {Number(
                                    shipment.amount || 0
                                ).toLocaleString('en-IN')}
                            </strong>

                        </div>


                        <div className="info-box">

                            <span>
                                Goods
                            </span>

                            <strong>
                                {
                                    shipment.goods_type ||
                                    'General'
                                }
                            </strong>

                        </div>


                        {/* ==================================
                            PREFERRED VEHICLE
                        ================================== */}

                        <div className="info-box">

                            <span>
                                Preferred Vehicle
                            </span>

                            <strong>
                                {
                                    shipment.vehicle_type ||
                                    'Any Suitable Truck'
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="shipment-extra-info">

                        {shipment.pickup_address && (

                            <div className="extra-info-item">

                                <h3>
                                    Pickup Address
                                </h3>

                                <p>
                                    {shipment.pickup_address}
                                </p>

                            </div>

                        )}

                        {shipment.delivery_address && (

                            <div className="extra-info-item">

                                <h3>
                                    Delivery Address
                                </h3>

                                <p>
                                    {shipment.delivery_address}
                                </p>

                            </div>

                        )}

                        {shipment.description && (

                            <div className="extra-info-item">

                                <h3>
                                    Cargo Description
                                </h3>

                                <p>
                                    {shipment.description}
                                </p>

                            </div>

                        )}

                        {shipment.notes && (

                            <div className="extra-info-item">

                                <h3>
                                    Special Instructions
                                </h3>

                                <p>
                                    {shipment.notes}
                                </p>

                            </div>

                        )}

                    </div>

                </section>


                {/* ==================================
                    ASSIGNED TRANSPORTER
                ================================== */}

                {
                    isAssignedTransporter &&
                    shipment.status === 'assigned' &&
                    (

                        <div
                            style={{
                                background: '#fffbeb',
                                border: '1px solid #fde68a',
                                borderRadius: 12,
                                padding: 20,
                                marginBottom: 20,
                                textAlign: 'center'
                            }}
                        >

                            <p
                                style={{
                                    margin: '0 0 8px',
                                    fontWeight: 700
                                }}
                            >
                                🚛 Shipment Assigned to You
                            </p>

                            <p
                                style={{
                                    margin: '0 0 16px',
                                    color: '#666',
                                    fontSize: 14
                                }}
                            >

                                Pick up the goods from{' '}

                                <strong>
                                    {formatCityName(
                                        shipment.from_city
                                    )}
                                </strong>

                                {' '}and then mark the shipment as picked up.

                            </p>

                            <button
                                type="button"
                                onClick={handleMarkPickedUp}
                                style={{
                                    padding: '12px 32px',
                                    background: '#d97706',
                                    color: '#fff',
                                    border: 0,
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: 15
                                }}
                            >
                                🚛 Mark as Picked Up
                            </button>

                        </div>

                    )
                }


                {/* ==========================================
                    TRANSPORTER — DESTINATION REACHED
                ========================================== */}

                {
                    showTransporterReached &&
                    (

                        <section
                            style={{
                                background: '#edf7ef',
                                border: '1px solid #b8d5bc',
                                borderRadius: 16,
                                padding: '30px 28px',
                                marginBottom: 28,
                                textAlign: 'center',
                                boxShadow:
                                    '0 4px 18px rgba(64, 93, 66, 0.08)'
                            }}
                        >

                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    margin: '0 auto 16px',
                                    borderRadius: '50%',
                                    background: '#dcebdc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 34,
                                    color: '#4f704f',
                                    fontWeight: 800
                                }}
                            >
                                ✓
                            </div>


                            <h2
                                style={{
                                    margin: '0 0 8px',
                                    color: '#4f704f',
                                    fontSize: 28,
                                    fontWeight: 800
                                }}
                            >
                                Reached Destination
                            </h2>


                            <p
                                style={{
                                    margin: '0 auto',
                                    maxWidth: 520,
                                    color: '#647069',
                                    fontSize: 15,
                                    lineHeight: 1.6
                                }}
                            >

                                The transporter has reached{' '}

                                <strong
                                    style={{
                                        color: '#202521'
                                    }}
                                >
                                    {formatCityName(
                                        shipment.to_city
                                    )}
                                </strong>

                                .

                            </p>


                            {arrivalTime && (

                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        marginTop: 16,
                                        padding: '7px 12px',
                                        background: '#ffffff',
                                        border:
                                            '1px solid #d5e2d6',
                                        borderRadius: 20,
                                        color: '#647069',
                                        fontSize: 12
                                    }}
                                >

                                    <span>
                                        🕒
                                    </span>

                                    <span>
                                        Arrived at{' '}
                                        {new Date(
                                            arrivalTime
                                        ).toLocaleString()}
                                    </span>

                                </div>

                            )}

                        </section>

                    )
                }


                {/* ====================================================
                    SHIPPER ONLY — GOODS HAVE ARRIVED
                ==================================================== */}

                {
                    showArrivalConfirmation &&
                    (

                        <section
                            style={{
                                background: '#edf7ef',
                                border: '1px solid #b8d5bc',
                                borderRadius: 16,
                                padding: '36px 28px',
                                marginBottom: 28,
                                textAlign: 'center',
                                boxShadow:
                                    '0 4px 18px rgba(64, 93, 66, 0.08)'
                            }}
                        >

                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    margin: '0 auto 16px',
                                    borderRadius: '18px',
                                    background: '#dcebdc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 34
                                }}
                            >
                                📦
                            </div>


                            <h2
                                style={{
                                    margin: '0 0 8px',
                                    color: '#4f704f',
                                    fontSize: 28,
                                    fontWeight: 800
                                }}
                            >
                                Goods Have Arrived
                            </h2>


                            <p
                                style={{
                                    color: '#647069',
                                    margin: '0 auto',
                                    maxWidth: 520,
                                    fontSize: 15,
                                    lineHeight: 1.6
                                }}
                            >

                                The transporter has reached{' '}

                                <strong
                                    style={{
                                        color: '#202521'
                                    }}
                                >
                                    {formatCityName(
                                        shipment.to_city
                                    )}
                                </strong>

                                . Please verify the goods before confirming delivery.

                            </p>


                            {arrivalTime && (

                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        marginTop: 16,
                                        padding: '7px 12px',
                                        background: '#ffffff',
                                        border:
                                            '1px solid #d5e2d6',
                                        borderRadius: 20,
                                        color: '#647069',
                                        fontSize: 12
                                    }}
                                >

                                    <span>
                                        🕒
                                    </span>

                                    <span>
                                        Arrived at{' '}
                                        {new Date(
                                            arrivalTime
                                        ).toLocaleString()}
                                    </span>

                                </div>

                            )}


                            {/* ==================================
                                CONFIRM DELIVERY CARD
                            ================================== */}

                            <div
                                style={{
                                    maxWidth: 680,
                                    margin: '28px auto 0',
                                    textAlign: 'left',
                                    background: '#ffffff',
                                    borderRadius: 16,
                                    padding: '28px 30px',
                                    border: '1px solid #d9e4da',
                                    boxShadow:
                                        '0 5px 20px rgba(64, 93, 66, 0.08)'
                                }}
                            >

                                <div
                                    style={{
                                        marginBottom: 26,
                                        paddingBottom: 18,
                                        borderBottom:
                                            '1px solid #e5ebe5'
                                    }}
                                >

                                    <h3
                                        style={{
                                            margin: 0,
                                            color: '#202521',
                                            fontSize: 20,
                                            fontWeight: 800
                                        }}
                                    >
                                        Confirm Delivery
                                    </h3>

                                    <p
                                        style={{
                                            margin: '6px 0 0',
                                            color: '#647069',
                                            fontSize: 13,
                                            lineHeight: 1.5
                                        }}
                                    >
                                        Verify the condition of the shipment and rate your transporter before completing the delivery.
                                    </p>

                                </div>


                                {/* DELIVERY CONDITION */}

                                <div
                                    style={{
                                        marginBottom: 24
                                    }}
                                >

                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: 700,
                                            color: '#202521',
                                            fontSize: 14,
                                            marginBottom: 9
                                        }}
                                    >
                                        Delivery Condition
                                    </label>

                                    <select
                                        value={deliveryCondition}
                                        onChange={e =>
                                            setDeliveryCondition(
                                                e.target.value
                                            )
                                        }
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            borderRadius: 9,
                                            border:
                                                '1px solid #cfd8d0',
                                            background: '#ffffff',
                                            color: '#202521',
                                            fontSize: 14,
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            cursor: 'pointer'
                                        }}
                                    >

                                        <option value="good">
                                            Good - Everything received safely
                                        </option>

                                        <option value="damaged">
                                            Damaged
                                        </option>

                                        <option value="partially_damaged">
                                            Partially Damaged
                                        </option>

                                        <option value="missing">
                                            Missing Items
                                        </option>

                                    </select>

                                </div>


                                {/* RATING */}

                                <div
                                    style={{
                                        marginBottom: 26,
                                        padding: '20px',
                                        background: '#f7faf7',
                                        border:
                                            '1px solid #e1e9e2',
                                        borderRadius: 12,
                                        textAlign: 'center'
                                    }}
                                >

                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: 700,
                                            color: '#202521',
                                            fontSize: 14,
                                            marginBottom: 12
                                        }}
                                    >
                                        Rate Transporter
                                    </label>


                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginBottom: 10
                                        }}
                                    >

                                        {[1, 2, 3, 4, 5].map(
                                            star => {

                                                const activeRating =
                                                    hoverRating ||
                                                    deliveryRating

                                                const isActive =
                                                    star <=
                                                    activeRating

                                                const isHovered =
                                                    hoverRating ===
                                                    star

                                                return (

                                                    <button
                                                        key={star}
                                                        type="button"
                                                        aria-label={`Rate ${star} out of 5`}
                                                        onMouseEnter={() =>
                                                            setHoverRating(
                                                                star
                                                            )
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoverRating(
                                                                0
                                                            )
                                                        }
                                                        onClick={() =>
                                                            setDeliveryRating(
                                                                star
                                                            )
                                                        }
                                                        style={{
                                                            border: 'none',
                                                            background:
                                                                'transparent',
                                                            padding: 2,
                                                            margin: 0,
                                                            cursor:
                                                                'pointer',
                                                            fontSize: 38,
                                                            lineHeight: 1,
                                                            color:
                                                                isActive
                                                                    ? '#d99b21'
                                                                    : '#d7ddd7',
                                                            transform:
                                                                isHovered
                                                                    ? 'translateY(-5px) scale(1.12)'
                                                                    : isActive
                                                                        ? 'translateY(0) scale(1.03)'
                                                                        : 'translateY(0) scale(1)',
                                                            transition:
                                                                'transform 0.18s ease, color 0.18s ease',
                                                            outline:
                                                                'none'
                                                        }}
                                                    >
                                                        {isActive
                                                            ? '★'
                                                            : '☆'}
                                                    </button>

                                                )

                                            }
                                        )}

                                    </div>


                                    <div
                                        style={{
                                            minHeight: 22,
                                            color: '#4f704f',
                                            fontSize: 14,
                                            fontWeight: 700
                                        }}
                                    >

                                        {
                                            hoverRating
                                                ? `${hoverRating} — ${ratingLabels[hoverRating]}`
                                                : `${deliveryRating} — ${ratingLabels[deliveryRating]}`
                                        }

                                    </div>

                                    <p
                                        style={{
                                            margin: '7px 0 0',
                                            color: '#8a958d',
                                            fontSize: 12
                                        }}
                                    >
                                        Click a star to select your rating
                                    </p>

                                </div>


                                {/* DELIVERY NOTES */}

                                <div
                                    style={{
                                        marginBottom: 22
                                    }}
                                >

                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: 700,
                                            color: '#202521',
                                            fontSize: 14,
                                            marginBottom: 9
                                        }}
                                    >
                                        Delivery Notes
                                    </label>

                                    <textarea
                                        value={deliveryNotes}
                                        onChange={e =>
                                            setDeliveryNotes(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Optional delivery notes..."
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '12px 14px',
                                            borderRadius: 9,
                                            border:
                                                '1px solid #cfd8d0',
                                            background: '#ffffff',
                                            color: '#202521',
                                            fontSize: 14,
                                            lineHeight: 1.5,
                                            resize: 'vertical',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />

                                </div>


                                {/* TRANSPORTER FEEDBACK */}

                                <div
                                    style={{
                                        marginBottom: 22
                                    }}
                                >

                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: 700,
                                            color: '#202521',
                                            fontSize: 14,
                                            marginBottom: 9
                                        }}
                                    >
                                        Transporter Feedback
                                    </label>

                                    <textarea
                                        value={deliveryComment}
                                        onChange={e =>
                                            setDeliveryComment(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Optional feedback about the transporter's service..."
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '12px 14px',
                                            borderRadius: 9,
                                            border:
                                                '1px solid #cfd8d0',
                                            background: '#ffffff',
                                            color: '#202521',
                                            fontSize: 14,
                                            lineHeight: 1.5,
                                            resize: 'vertical',
                                            outline: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                    />

                                </div>


                                {/* DELIVERY ERROR */}

                                {deliveryError && (

                                    <div
                                        style={{
                                            background: '#fef2f2',
                                            border:
                                                '1px solid #fecaca',
                                            color: '#b91c1c',
                                            borderRadius: 9,
                                            padding: '11px 13px',
                                            marginBottom: 18,
                                            fontSize: 13,
                                            fontWeight: 600
                                        }}
                                    >
                                        {deliveryError}
                                    </div>

                                )}


                                {/* CONFIRM BUTTON */}

                                <button
                                    type="button"
                                    onClick={
                                        handleCompleteDelivery
                                    }
                                    disabled={
                                        isCompletingDelivery
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '13px 20px',
                                        background:
                                            isCompletingDelivery
                                                ? '#9eb69f'
                                                : '#4f704f',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: 9,
                                        cursor:
                                            isCompletingDelivery
                                                ? 'not-allowed'
                                                : 'pointer',
                                        fontWeight: 700,
                                        fontSize: 14
                                    }}
                                >
                                    {
                                        isCompletingDelivery
                                            ? '⏳ Confirming Delivery...'
                                            : '✓ Confirm Delivery'
                                    }
                                </button>

                            </div>

                        </section>

                    )
                }


                {/* ==================================
                    TRACKING MODE
                ================================== */}

                {
                    isAssignedTransporter &&
                    (

                        <div className="tracking-mode">

                            <h3>
                                Tracking Mode
                            </h3>


                            <label>

                                <input
                                    type="radio"
                                    value="real"
                                    checked={
                                        trackingMode === 'real'
                                    }
                                    onChange={e =>
                                        setTrackingMode(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        isSharingLocation
                                    }
                                />

                                {' '}🟢 Real GPS

                            </label>


                            <br />


                            <label>

                                <input
                                    type="radio"
                                    value="simulation"
                                    checked={
                                        trackingMode ===
                                        'simulation'
                                    }
                                    onChange={e =>
                                        setTrackingMode(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        isSharingLocation
                                    }
                                />

                                {' '}🔵 Demo Simulation

                            </label>


                            <p
                                style={{
                                    fontSize: 13,
                                    color: '#777',
                                    marginTop: 10
                                }}
                            >

                                Demo Simulation travels from{' '}

                                <strong>
                                    {formatCityName(
                                        shipment.from_city
                                    )}
                                </strong>

                                {' '}to{' '}

                                <strong>
                                    {formatCityName(
                                        shipment.to_city
                                    )}
                                </strong>

                                {' '}and moves every 2 seconds.

                            </p>

                        </div>

                    )
                }


                {/* ==================================
                    LIVE TRACKING
                ================================== */}

                {
                    (
                        shipment.status === 'assigned' ||
                        shipment.status === 'in_transit'
                    ) &&
                    (

                        <section className="tracking-card">

                            <div className="section-title">

                                <div>

                                    <h2>
                                        Live Tracking
                                    </h2>

                                    <p>
                                        Real-time transporter location
                                    </p>

                                </div>

                                <span className="live-badge">
                                    ● LIVE
                                </span>

                            </div>


                            {/* TRANSPORTER CONTROLS */}

                            {
                                isAssignedTransporter &&
                                (

                                    <div className="location-controls">

                                        {
                                            !isSharingLocation
                                                ? (

                                                    <button
                                                        type="button"
                                                        className="start-location-btn"
                                                        onClick={
                                                            startSharingLocation
                                                        }
                                                    >

                                                        {
                                                            trackingMode ===
                                                            'real'
                                                                ? '📍 Start Sharing Location'
                                                                : '🚚 Start Demo Simulation'
                                                        }

                                                    </button>

                                                )
                                                : (

                                                    <div>

                                                        <div className="sharing-status">

                                                            <span className="pulse-dot"></span>

                                                            {
                                                                trackingMode ===
                                                                'real'
                                                                    ? 'Sharing real GPS location live'
                                                                    : 'Demo simulation running'
                                                            }

                                                        </div>


                                                        <button
                                                            type="button"
                                                            className="stop-location-btn"
                                                            onClick={
                                                                stopSharingLocation
                                                            }
                                                        >
                                                            Stop Sharing
                                                        </button>

                                                    </div>

                                                )
                                        }

                                    </div>

                                )
                            }


                            {/* LIVE TRUCK CARD */}

                            <div className="live-tracking-card">

                                <div className="tracking-header">

                                    <h3>
                                        🚚 LIVE TRUCK TRACKING
                                    </h3>

                                    <span className="gps-status">

                                        {
                                            truckLocation

                                                ? (

                                                    truckLocation.mode ===
                                                    'real'
                                                        ? '🟢 Live GPS'
                                                        : '🔵 Demo GPS'

                                                )

                                                : '⚪ Waiting for GPS'

                                        }

                                    </span>

                                </div>


                                {/* MAP */}

                                <div className="tracking-map">

                                    {
                                        truckLocation

                                            ? (

                                                <MapContainer
                                                    center={[
                                                        truckLocation.lat,
                                                        truckLocation.lng
                                                    ]}
                                                    zoom={8}
                                                    scrollWheelZoom={true}
                                                    style={{
                                                        height: '100%',
                                                        width: '100%'
                                                    }}
                                                >

                                                    <TileLayer
                                                        attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                                    />

                                                    <Marker
                                                        position={[
                                                            truckLocation.lat,
                                                            truckLocation.lng
                                                        ]}
                                                    >

                                                        <Popup>

                                                            <strong>
                                                                🚚 Truck Location
                                                            </strong>

                                                            <br />

                                                            Latitude:{' '}

                                                            {
                                                                truckLocation.lat.toFixed(
                                                                    6
                                                                )
                                                            }

                                                            <br />

                                                            Longitude:{' '}

                                                            {
                                                                truckLocation.lng.toFixed(
                                                                    6
                                                                )
                                                            }

                                                            <br />

                                                            Mode:{' '}

                                                            {
                                                                truckLocation.mode ===
                                                                'real'
                                                                    ? 'Real GPS'
                                                                    : 'Demo Simulation'
                                                            }

                                                        </Popup>

                                                    </Marker>


                                                    <MapFollower
                                                        truckLocation={
                                                            truckLocation
                                                        }
                                                    />

                                                </MapContainer>

                                            )

                                            : (

                                                <div className="map-loading">

                                                    <div className="truck-marker">
                                                        📍
                                                    </div>

                                                    <p>
                                                        Waiting for truck location...
                                                    </p>

                                                </div>

                                            )
                                    }

                                </div>


                                {/* TRACKING DETAILS */}

                                <div className="tracking-details">

                                    <div className="tracking-detail">

                                        <span>
                                            📍 Current Location
                                        </span>

                                        <strong>

                                            {
                                                truckLocation
                                                    ? `${truckLocation.lat.toFixed(6)}, ${truckLocation.lng.toFixed(6)}`
                                                    : 'Location unavailable'
                                            }

                                        </strong>

                                    </div>


                                    <div className="tracking-detail">

                                        <span>
                                            🎯 GPS Accuracy
                                        </span>

                                        <strong>

                                            {
                                                truckLocation?.accuracy
                                                    ? `±${Math.round(
                                                        truckLocation.accuracy
                                                    )} m`
                                                    : 'Demo / unavailable'
                                            }

                                        </strong>

                                    </div>


                                    <div className="tracking-detail">

                                        <span>
                                            🔄 Last Updated
                                        </span>

                                        <strong>

                                            {
                                                truckLocation
                                                    ? new Date(
                                                        truckLocation.updatedAt
                                                    ).toLocaleTimeString()
                                                    : 'Waiting'
                                            }

                                        </strong>

                                    </div>

                                </div>


                                {/* GOOGLE MAP */}

                                <button
                                    type="button"
                                    className="view-map-btn"
                                    disabled={!truckLocation}
                                    onClick={() => {

                                        if (!truckLocation) {
                                            return
                                        }

                                        window.open(
                                            `https://www.google.com/maps?q=${truckLocation.lat},${truckLocation.lng}`,
                                            '_blank'
                                        )

                                    }}
                                >
                                    🗺️ View Live Map
                                </button>

                            </div>

                        </section>

                    )
                }


                {/* ==================================
                    DELIVERY COMPLETED
                ================================== */}

                {
                    shipment.status === 'delivered' &&
                    (

                        <section
                            style={{
                                background: '#edf7ef',
                                border: '1px solid #b8d5bc',
                                borderRadius: 16,
                                padding: '32px 28px',
                                marginBottom: 28,
                                textAlign: 'center',
                                boxShadow:
                                    '0 4px 18px rgba(64, 93, 66, 0.08)'
                            }}
                        >

                            {/* SUCCESS ICON */}

                            <div
                                style={{
                                    width: 64,
                                    height: 64,
                                    margin: '0 auto 16px',
                                    borderRadius: '18px',
                                    background: '#dcebdc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 34,
                                    color: '#4f704f',
                                    fontWeight: 800
                                }}
                            >
                                ✓
                            </div>


                            {/* TITLE */}

                            <h2
                                style={{
                                    margin: '0 0 8px',
                                    color: '#4f704f',
                                    fontSize: 28,
                                    fontWeight: 800
                                }}
                            >
                                Your Goods Have Been Delivered
                            </h2>


                            <p
                                style={{
                                    margin: '0 auto 24px',
                                    maxWidth: 540,
                                    color: '#647069',
                                    fontSize: 15,
                                    lineHeight: 1.6
                                }}
                            >
                                The shipment has been successfully delivered and
                                confirmed. Thank you for using SmartFreight.
                            </p>


                            {/* DELIVERY SUMMARY */}

                            <div
                                style={{
                                    maxWidth: 620,
                                    margin: '0 auto',
                                    background: '#ffffff',
                                    border: '1px solid #d9e4da',
                                    borderRadius: 14,
                                    padding: '24px',
                                    textAlign: 'left'
                                }}
                            >

                                <h3
                                    style={{
                                        margin: '0 0 18px',
                                        color: '#202521',
                                        fontSize: 18,
                                        fontWeight: 800
                                    }}
                                >
                                    Delivery Summary
                                </h3>


                                {/* ROUTE */}

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 20,
                                        paddingBottom: 16,
                                        borderBottom: '1px solid #e5ebe5'
                                    }}
                                >

                                    <div>

                                        <span
                                            style={{
                                                display: 'block',
                                                color: '#8a958d',
                                                fontSize: 12,
                                                marginBottom: 5
                                            }}
                                        >
                                            Route
                                        </span>

                                        <strong
                                            style={{
                                                color: '#202521',
                                                fontSize: 15
                                            }}
                                        >
                                            {formatCityName(shipment.from_city)}
                                            {' → '}
                                            {formatCityName(shipment.to_city)}
                                        </strong>

                                    </div>


                                    <div style={{ textAlign: 'right' }}>

                                        <span
                                            style={{
                                                display: 'block',
                                                color: '#8a958d',
                                                fontSize: 12,
                                                marginBottom: 5
                                            }}
                                        >
                                            Status
                                        </span>

                                        <strong
                                            style={{
                                                color: '#4f704f',
                                                fontSize: 14
                                            }}
                                        >
                                            ✓ DELIVERED
                                        </strong>

                                    </div>

                                </div>


                                {/* CONDITION */}

                                <div
                                    style={{
                                        padding: '16px 0',
                                        borderBottom: '1px solid #e5ebe5'
                                    }}
                                >

                                    <span
                                        style={{
                                            display: 'block',
                                            color: '#8a958d',
                                            fontSize: 12,
                                            marginBottom: 5
                                        }}
                                    >
                                        Delivery Condition
                                    </span>

                                    <strong
                                        style={{
                                            color: '#202521',
                                            fontSize: 15
                                        }}
                                    >
                                        {
                                            shipment.delivery_condition === 'damaged'
                                                ? '⚠️ Damaged'
                                                : shipment.delivery_condition === 'partially_damaged'
                                                    ? '⚠️ Partially Damaged'
                                                    : shipment.delivery_condition === 'missing'
                                                        ? '❌ Missing Items'
                                                        : '✓ Good — Everything received safely'
                                        }
                                    </strong>

                                </div>


                                {/* RATING */}

                                <div
                                    style={{
                                        padding: '18px 0',
                                        borderBottom: '1px solid #e5ebe5',
                                        textAlign: 'center'
                                    }}
                                >

                                    <span
                                        style={{
                                            display: 'block',
                                            color: '#8a958d',
                                            fontSize: 12,
                                            marginBottom: 8
                                        }}
                                    >
                                        Your Rating
                                    </span>


                                    <div
                                        style={{
                                            fontSize: 30,
                                            letterSpacing: 3,
                                            color: '#d99b21',
                                            marginBottom: 6
                                        }}
                                    >

                                        {
                                            [1, 2, 3, 4, 5].map(star => (

                                                <span key={star}>

                                                    {
                                                        star <=
                                                        Number(
                                                            shipment.rating ??
                                                            shipment.delivery_rating ??
                                                            deliveryRating ??
                                                            5
                                                        )
                                                            ? '★'
                                                            : '☆'
                                                    }

                                                </span>

                                            ))
                                        }

                                    </div>


                                    <strong
                                        style={{
                                            color: '#4f704f',
                                            fontSize: 15
                                        }}
                                    >
                                        {
                                            Number(
                                                shipment.rating ??
                                                shipment.delivery_rating ??
                                                deliveryRating ??
                                                5
                                            )
                                        } / 5
                                    </strong>

                                </div>


                                {/* NOTES */}

                                {
                                    (
                                        shipment.delivery_notes ||
                                        shipment.comment ||
                                        shipment.delivery_comment
                                    ) &&
                                    (

                                        <div
                                            style={{
                                                paddingTop: 16
                                            }}
                                        >

                                            <span
                                                style={{
                                                    display: 'block',
                                                    color: '#8a958d',
                                                    fontSize: 12,
                                                    marginBottom: 5
                                                }}
                                            >
                                                Feedback
                                            </span>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    color: '#202521',
                                                    fontSize: 14,
                                                    lineHeight: 1.5
                                                }}
                                            >
                                                {
                                                    shipment.comment ||
                                                    shipment.delivery_comment ||
                                                    shipment.delivery_notes
                                                }
                                            </p>

                                        </div>

                                    )
                                }

                            </div>

                        </section>

                    )
                }


                {/* ==================================
                    BIDS
                ================================== */}

                <section className="bids-section">

                    <div className="section-title">

                        <div>

                            <h2>

                                Bids Received{' '}

                                <span className="bid-number">
                                    {bids.length}
                                </span>

                            </h2>

                            <p>
                                Transporters interested in this shipment
                            </p>

                        </div>


                        {
                            shipment.status === 'posted' &&
                            (

                                <span className="live-badge">
                                    ● LIVE
                                </span>

                            )
                        }

                    </div>


                    {
                        bids.length === 0

                            ? (

                                <div className="no-bids">

                                    <div className="no-bids-icon">
                                        🤝
                                    </div>

                                    <h3>
                                        No bids yet
                                    </h3>

                                    <p>

                                        {
                                            user.role === 'transporter'
                                                ? 'Be the first transporter to place a bid.'
                                                : 'Transporter bids will appear here.'
                                        }

                                    </p>

                                </div>

                            )

                            : (

                                <div className="bid-list">

                                    {
                                        bids.map(
                                            bid => (

                                                <BidCard

                                                    key={bid.id}

                                                    bid={bid}

                                                    isShipper={
                                                        isMyShipment
                                                    }

                                                    onAccept={
                                                        handleAcceptBid
                                                    }

                                                    onWithdraw={
                                                        handleWithdrawBid
                                                    }

                                                    currentUserId={
                                                        user.id
                                                    }

                                                    acceptingBid={
                                                        acceptingBid
                                                    }

                                                />

                                            )
                                        )
                                    }

                                </div>

                            )
                    }

                </section>


                {/* ==================================
                    TRIP COST ANALYZER
                ================================== */}

                {
                    canBid &&
                    !alreadyBid &&
                    (

                        <TripCostAnalyzer

                            shipment={shipment}

                            currentBids={bids}

                            onUseBid={
                                amount =>
                                    setBidAmount(
                                        String(amount)
                                    )
                            }

                        />

                    )
                }


                {/* ==================================
                    PLACE BID
                ================================== */}

                {
                    canBid &&
                    !alreadyBid &&
                    (

                        <section className="place-bid-card">

                            <div className="section-title">

                                <div>

                                    <h2>
                                        Place Your Bid
                                    </h2>

                                    <p>
                                        Send your offer to the shipper
                                    </p>

                                </div>

                            </div>


                            {bidError && (

                                <div className="form-error">
                                    {bidError}
                                </div>

                            )}


                            {bidSuccess && (

                                <div className="form-success">
                                    {bidSuccess}
                                </div>

                            )}


                            <form
                                onSubmit={
                                    handlePlaceBid
                                }
                            >

                                <div className="form-group">

                                    <label>
                                        Your Bid Amount (₹) *
                                    </label>

                                    <input
                                        type="number"
                                        min="100"
                                        placeholder={`Shipper budget: ₹${Number(
                                            shipment.amount || 0
                                        ).toLocaleString('en-IN')}`}
                                        value={bidAmount}
                                        onChange={e =>
                                            setBidAmount(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>

                                        Message{' '}

                                        <span>
                                            (optional)
                                        </span>

                                    </label>

                                    <textarea
                                        placeholder="Tell the shipper about your truck..."
                                        value={bidNote}
                                        onChange={e =>
                                            setBidNote(
                                                e.target.value
                                            )
                                        }
                                        rows="4"
                                    />

                                </div>


                                <button
                                    type="submit"
                                    className="place-bid-btn"
                                    disabled={isSubmitting}
                                >

                                    {
                                        isSubmitting
                                            ? 'Placing...'
                                            : 'Place Bid'
                                    }

                                </button>

                            </form>

                        </section>

                    )
                }


                {/* ==================================
                    ALREADY BID
                ================================== */}

                {
                    canBid &&
                    alreadyBid &&
                    (

                        <div className="already-bid">

                            <span>
                                ✓
                            </span>

                            <p>
                                You have already placed a bid on this shipment
                            </p>

                        </div>

                    )
                }

            </main>

        </div>

    )

}


export default ShipmentDetail