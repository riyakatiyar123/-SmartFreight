import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'

import api from '../utils/api'
import Navbar from '../components/Navbar'
import BidCard from '../components/BidCard'

import '../styles/ShipmentDetail.css'
import TripCostCalculator from '../components/TripCostCalculator'


const ShipmentDetail = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    const socketRef = useRef(null)
    const locationIntervalRef = useRef(null)
    const simulationIntervalRef = useRef(null)


    // ================================
    // STATE
    // ================================

    const [shipment, setShipment] = useState(null)
    const [bids, setBids] = useState([])

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')


    // ================================
    // BID FORM
    // ================================

    const [bidAmount, setBidAmount] = useState('')
    const [bidNote, setBidNote] = useState('')
    const [bidError, setBidError] = useState('')
    const [bidSuccess, setBidSuccess] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)


    // ================================
    // ACCEPT BID
    // ================================

    const [acceptingBid, setAcceptingBid] = useState(null)


    // ================================
    // GPS
    // ================================

    const [truckLocation, setTruckLocation] = useState(null)

    const [isSharingLocation, setIsSharingLocation] =
        useState(false)

    const [trackingMode, setTrackingMode] =
        useState('real')


    // ================================
    // FETCH SHIPMENT + BIDS
    // ================================

    const fetchShipmentAndBids = async () => {

        try {

            const [shipmentRes, bidsRes] =
                await Promise.all([
                    api.get(`/shipments/${id}`),
                    api.get(`/bids/${id}`)
                ])

            console.log(
                'Shipment:',
                shipmentRes.data
            )

            console.log(
                'Bids:',
                bidsRes.data
            )

            setShipment(
                shipmentRes.data
            )

            setBids(
                bidsRes.data
            )

        } catch (err) {

            console.error(
                'Failed to load shipment:',
                err
            )

            setError(
                err.response?.data?.error ||
                'Failed to load shipment details'
            )

        } finally {

            setIsLoading(false)

        }

    }


    // ================================
    // LOAD PAGE + SOCKET
    // ================================

    useEffect(() => {

        if (!user) {

            navigate('/')

            return
        }

        fetchShipmentAndBids()


        // ============================
        // CONNECT SOCKET
        // ============================

        socketRef.current =
            io('http://localhost:3000')


        // ============================
        // JOIN SHIPMENT ROOM
        // ============================

        socketRef.current.emit(
            'join-shipment',
            id
        )


        // ============================
        // NEW BID
        // ============================

        socketRef.current.on(
            'new-bid',
            (newBid) => {

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


        // ============================
        // BID ACCEPTED
        // ============================

        socketRef.current.on(
            'bid-accepted',
            ({ bidId }) => {

                console.log(
                    'Bid accepted:',
                    bidId
                )

                setBids(prev =>
                    prev.map(bid => ({

                        ...bid,

                        status:
                            String(bid.id) ===
                            String(bidId)
                                ? 'accepted'
                                : 'rejected'

                    }))
                )


                setShipment(prev =>
                    prev
                        ? {
                            ...prev,
                            status: 'assigned'
                        }
                        : prev
                )

            }
        )


        // ============================
        // TRUCK LOCATION
        // ============================

        socketRef.current.on(
            'truck-location',
            ({
                lat,
                lng,
                mode,
                accuracy
            }) => {

                console.log(
                    'Truck location received:',
                    lat,
                    lng,
                    mode
                )

                setTruckLocation({
                    lat,
                    lng,
                    mode,
                    accuracy
                })

            }
        )


        // ============================
        // CLEANUP
        // ============================

        return () => {

            if (socketRef.current) {

                socketRef.current.disconnect()

            }

            if (locationIntervalRef.current) {

                clearInterval(
                    locationIntervalRef.current
                )

                locationIntervalRef.current = null

            }

            if (simulationIntervalRef.current) {

                clearInterval(
                    simulationIntervalRef.current
                )

                simulationIntervalRef.current = null

            }

        }

    }, [id])


    // ================================
    // PLACE BID
    // ================================

    const handlePlaceBid = async (e) => {

        e.preventDefault()

        setBidError('')
        setBidSuccess('')
        setIsSubmitting(true)

        try {

            const response = await api.post(
                '/bids',
                {
                    shipment_id: id,
                    amount: parseInt(bidAmount),
                    note: bidNote
                }
            )

            console.log(
                'Bid placed:',
                response.data
            )

            setBidAmount('')
            setBidNote('')

            setBidSuccess(
                'Bid placed! The shipper will be notified.'
            )

            await fetchShipmentAndBids()

        } catch (err) {

            console.error(
                'Place bid error:',
                err
            )

            setBidError(
                err.response?.data?.error ||
                'Failed to place bid'
            )

        } finally {

            setIsSubmitting(false)

        }

    }


    // ================================
    // ACCEPT BID
    // ================================

    const handleAcceptBid = async (bidId) => {

        setError('')
        setAcceptingBid(bidId)

        try {

            console.log(
                'Accepting bid:',
                bidId
            )

            await api.put(
                `/bids/${bidId}/accept`
            )

            await fetchShipmentAndBids()

        } catch (err) {

            console.error(
                'Accept bid error:',
                err
            )

            setError(
                err.response?.data?.error ||
                'Failed to accept bid'
            )

        } finally {

            setAcceptingBid(null)

        }

    }


    // ================================
    // REAL GPS
    // ================================

    const startRealGPS = () => {

        if (!navigator.geolocation) {

            alert(
                'Geolocation is not supported on this device'
            )

            return
        }

        setIsSharingLocation(true)

        navigator.geolocation.getCurrentPosition(
            sendLocation,
            handleLocationError
        )

        locationIntervalRef.current =
            setInterval(() => {

                navigator.geolocation.getCurrentPosition(
                    sendLocation,
                    handleLocationError
                )

            }, 5000)

    }


    // ================================
    // SEND REAL GPS
    // ================================

    const sendLocation = (position) => {

        const {
            latitude: lat,
            longitude: lng,
            accuracy
        } = position.coords

        console.log(
            'Sending real GPS:',
            lat,
            lng
        )

        if (socketRef.current) {

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


    // ================================
    // DEMO SIMULATION
    // ================================

    const startSimulation = () => {

        const route = [

            {
                lat: 26.4499,
                lng: 80.3319
            },

            {
                lat: 26.8467,
                lng: 80.9462
            },

            {
                lat: 27.1767,
                lng: 78.0081
            },

            {
                lat: 27.4924,
                lng: 77.6737
            },

            {
                lat: 28.4089,
                lng: 77.3178
            },

            {
                lat: 28.4595,
                lng: 77.0266
            }

        ]


        let index = 0

        setIsSharingLocation(true)


        const sendSimulationLocation = () => {

            if (
                index >=
                route.length
            ) {

                clearInterval(
                    simulationIntervalRef.current
                )

                simulationIntervalRef.current =
                    null

                setIsSharingLocation(false)

                console.log(
                    'Simulation completed'
                )

                return
            }


            const location =
                route[index]


            console.log(
                'Simulation location:',
                location
            )


            socketRef.current?.emit(
                'location-update',
                {
                    shipmentId: id,
                    lat: location.lat,
                    lng: location.lng,
                    mode: 'simulation'
                }
            )


            index++

        }


        sendSimulationLocation()


        simulationIntervalRef.current =
            setInterval(
                sendSimulationLocation,
                3000
            )

    }


    // ================================
    // START TRACKING
    // ================================

    const startSharingLocation = () => {

        if (isSharingLocation) {

            return

        }

        if (trackingMode === 'real') {

            startRealGPS()

        } else {

            startSimulation()

        }

    }


    // ================================
    // GPS ERROR
    // ================================

    const handleLocationError = (error) => {

        console.error(
            'Location error:',
            error
        )

        if (error.code === 1) {

            alert(
                'Location permission denied. Please allow location access.'
            )

        } else if (error.code === 2) {

            alert(
                'Unable to determine your location.'
            )

        } else if (error.code === 3) {

            alert(
                'Location request timed out.'
            )

        }

    }


    // ================================
    // STOP TRACKING
    // ================================

    const stopSharingLocation = () => {

        setIsSharingLocation(false)

        if (locationIntervalRef.current) {

            clearInterval(
                locationIntervalRef.current
            )

            locationIntervalRef.current = null

        }

        if (simulationIntervalRef.current) {

            clearInterval(
                simulationIntervalRef.current
            )

            simulationIntervalRef.current = null

        }

    }


    // ================================
    // LOADING
    // ================================

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


    // ================================
    // ERROR
    // ================================

    if (error || !shipment) {

        return (

            <div className="shipment-detail-page">

                <Navbar />

                <div className="shipment-detail-container">

                    <div className="detail-error">

                        {error ||
                            'Shipment not found'}

                    </div>

                </div>

            </div>

        )

    }


    // ================================
    // USER / SHIPMENT CHECKS
    // ================================

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
                String(user.id)
        )


    const isAssignedTransporter =
        String(shipment.transporter_id) ===
        String(user.id)


    // ================================
    // DEBUG
    // ================================

    console.log(
        '========== SMARTFREIGHT DEBUG =========='
    )

    console.log(
        'USER ID:',
        user?.id
    )

    console.log(
        'USER ROLE:',
        user?.role
    )

    console.log(
        'SHIPMENT USER ID:',
        shipment?.user_id
    )

    console.log(
        'IS MY SHIPMENT:',
        isMyShipment
    )

    console.log(
        '========================================='
    )


    return (

        <div className="shipment-detail-page">

            <Navbar />


            <main className="shipment-detail-container">


                {/* BACK */}

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate('/dashboard')
                    }
                >

                    ← Back to Dashboard

                </button>


                {/* HEADER */}

                <div className="detail-header">

                    <div>

                        <p className="detail-label">

                            SHIPMENT DETAILS

                        </p>


                        <h1>

                            {shipment.from_city}

                            <span className="header-arrow">

                                →

                            </span>

                            {shipment.to_city}

                        </h1>

                    </div>


                    <span
                        className={`detail-status status-${shipment.status}`}
                    >

                        {shipment.status}

                    </span>

                </div>


                {/* SHIPMENT INFO */}

                <section className="shipment-info-card">


                    <div className="route-card">

                        <div className="location">

                            <span>
                                FROM
                            </span>

                            <strong>
                                {shipment.from_city}
                            </strong>

                        </div>


                        <div className="route-arrow">
                            →
                        </div>


                        <div className="location">

                            <span>
                                TO
                            </span>

                            <strong>
                                {shipment.to_city}
                            </strong>

                        </div>

                    </div>


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
                                    shipment.amount
                                ).toLocaleString()}

                            </strong>

                        </div>


                        <div className="info-box">

                            <span>
                                Goods
                            </span>

                            <strong>

                                {shipment.goods_type ||
                                    'General'}

                            </strong>

                        </div>

                    </div>


                    {shipment.notes && (

                        <div className="notes-box">

                            <h3>

                                Special Instructions

                            </h3>

                            <p>

                                {shipment.notes}

                            </p>

                        </div>

                    )}

                </section>


                {/* TRACKING MODE */}

                {isAssignedTransporter && (

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
                                onChange={(e) =>
                                    setTrackingMode(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    isSharingLocation
                                }
                            />

                            🟢 Real GPS

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
                                onChange={(e) =>
                                    setTrackingMode(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    isSharingLocation
                                }
                            />

                            🔵 Demo Simulation

                        </label>

                    </div>

                )}


                {/* LIVE TRACKING */}

                {(shipment.status === 'assigned' ||
                    shipment.status === 'in_transit') && (

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


                        {isAssignedTransporter && (

                            <div className="location-controls">


                                {!isSharingLocation ? (

                                    <button
                                        className="start-location-btn"
                                        onClick={
                                            startSharingLocation
                                        }
                                    >

                                        Start Sharing Location

                                    </button>

                                ) : (

                                    <div>

                                        <div className="sharing-status">

                                            <span className="pulse-dot"></span>

                                            {trackingMode === 'real'
                                                ? 'Sharing real GPS location live'
                                                : 'Demo simulation running'
                                            }

                                        </div>


                                        <button
                                            className="stop-location-btn"
                                            onClick={
                                                stopSharingLocation
                                            }
                                        >

                                            Stop Sharing

                                        </button>

                                    </div>

                                )}

                            </div>

                        )}


                        {truckLocation ? (

                            <div className="truck-location">

                                <h3>

                                    🚚 Truck Location

                                </h3>


                                <p className="coordinates">

                                    Lat:
                                    {' '}
                                    {truckLocation.lat.toFixed(
                                        6
                                    )}

                                    <br />

                                    Lng:
                                    {' '}
                                    {truckLocation.lng.toFixed(
                                        6
                                    )}

                                </p>


                                {truckLocation.mode && (

                                    <p>

                                        Mode:
                                        {' '}

                                        {truckLocation.mode === 'real'
                                            ? '🟢 Real GPS'
                                            : '🔵 Demo Simulation'
                                        }

                                    </p>

                                )}


                                {truckLocation.accuracy && (

                                    <p>

                                        GPS Accuracy:
                                        {' '}

                                        {Math.round(
                                            truckLocation.accuracy
                                        )}

                                        {' '}meters

                                    </p>

                                )}


                                <p className="updated-text">

                                    Updated just now

                                </p>

                            </div>

                        ) : (

                            <div className="waiting-location">

                                <span>
                                    📍
                                </span>

                                <p>

                                    Waiting for transporter
                                    to share location...

                                </p>

                            </div>

                        )}

                    </section>

                )}


                {/* BIDS */}

                <section className="bids-section">


                    <div className="section-title">

                        <div>

                            <h2>

                                Bids Received

                                <span className="bid-number">

                                    {bids.length}

                                </span>

                            </h2>


                            <p>

                                Transporters interested in this shipment

                            </p>

                        </div>


                        {shipment.status === 'posted' && (

                            <span className="live-badge">

                                ● LIVE

                            </span>

                        )}

                    </div>


                    {bids.length === 0 ? (

                        <div className="no-bids">

                            <div className="no-bids-icon">

                                🤝

                            </div>

                            <h3>

                                No bids yet

                            </h3>

                            <p>

                                {user.role === 'transporter'
                                    ? 'Be the first transporter to place a bid.'
                                    : 'Transporter bids will appear here.'
                                }

                            </p>

                        </div>

                    ) : (

                        <div className="bid-list">

                            {bids.map(bid => (

                                <BidCard
                                    key={bid.id}
                                    bid={bid}
                                    isShipper={
                                        isMyShipment
                                    }
                                    onAccept={
                                        handleAcceptBid
                                    }
                                    acceptingBid={
                                        acceptingBid
                                    }
                                />

                            ))}

                        </div>

                    )}

                </section>


                {/* PLACE BID */}

                {canBid && !alreadyBid && (

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
                                    placeholder={`Shipper budget: ₹${Number(
                                        shipment.amount
                                    ).toLocaleString()}`}
                                    value={
                                        bidAmount
                                    }
                                    onChange={(e) =>
                                        setBidAmount(
                                            e.target.value
                                        )
                                    }
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>

                                    Message
                                    <span>
                                        {' '}
                                        (optional)
                                    </span>

                                </label>


                                <textarea
                                    placeholder="Tell the shipper about your truck..."
                                    value={
                                        bidNote
                                    }
                                    onChange={(e) =>
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
                                disabled={
                                    isSubmitting
                                }
                            >

                                {isSubmitting
                                    ? 'Placing...'
                                    : 'Place Bid'
                                }

                            </button>

                        </form>

                    </section>

                )}


                {/* ALREADY BID */}

                {canBid && alreadyBid && (

                    <div className="already-bid">

                        <span>
                            ✓
                        </span>

                        <p>

                            You have already placed a bid on this shipment

                        </p>

                    </div>

                )}

            </main>

        </div>

    )

}


export default ShipmentDetail