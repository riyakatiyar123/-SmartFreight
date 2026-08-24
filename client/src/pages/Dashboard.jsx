import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../utils/api'
import Navbar from '../components/Navbar'

import "../styles/dashboard.css"


// ========================================
// FORMAT LOCATION
// ========================================

const formatLocation = (location) => {

    if (!location) {
        return ''
    }

    return String(location)
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(' ')

}


// ========================================
// DASHBOARD
// ========================================

const Dashboard = () => {

    const navigate = useNavigate()


    // ========================================
    // USER
    // ========================================

    const [user, setUser] = useState(null)


    // ========================================
    // STATE
    // ========================================

    const [shipments, setShipments] = useState([])

    const [bids, setBids] = useState([])

    const [isLoading, setIsLoading] = useState(true)

    const [isLoadingBids, setIsLoadingBids] = useState(false)

    const [error, setError] = useState('')

    const [activeFilter, setActiveFilter] = useState('all')


    // ========================================
    // CANCEL MODAL
    // ========================================

    const [shipmentToCancel, setShipmentToCancel] =
        useState(null)

    const [isCancelling, setIsCancelling] =
        useState(false)


    // ========================================
    // LOAD USER
    // ========================================

    useEffect(() => {

        try {

            const storedUser =
                localStorage.getItem('user')


            if (!storedUser) {

                navigate('/login')

                return

            }


            const parsedUser =
                JSON.parse(storedUser)


            if (
                !parsedUser ||
                !parsedUser.id
            ) {

                localStorage.removeItem('user')

                localStorage.removeItem('token')

                navigate('/login')

                return

            }


            setUser(parsedUser)

        } catch (err) {

            console.error(
                'Invalid user data:',
                err
            )


            localStorage.removeItem('user')

            localStorage.removeItem('token')

            navigate('/login')

        }

    }, [navigate])


    // ========================================
    // FETCH SHIPMENTS AFTER USER LOADS
    // ========================================

    useEffect(() => {

        if (!user) {
            return
        }

        fetchShipments()

    }, [user])


    // ========================================
    // FETCH SHIPMENTS
    // ========================================

    const fetchShipments = async () => {

        try {

            setIsLoading(true)

            setError('')


            const response =
                await api.get('/shipments')


            const data =
                Array.isArray(response.data)
                    ? response.data
                    : []


            console.log(
                '📦 Shipments:',
                data
            )


            setShipments(data)


            await fetchBidsForDashboard(data)

        } catch (err) {

            console.error(
                '❌ Shipment error:',
                err
            )


            setError(
                err.response?.data?.error ||
                err.message ||
                'Failed to load shipments'
            )

        } finally {

            setIsLoading(false)

        }

    }


    // ========================================
    // FETCH BIDS
    // ========================================

    const fetchBidsForDashboard =
        async (shipmentList) => {

            try {

                setIsLoadingBids(true)


                if (
                    !Array.isArray(shipmentList) ||
                    shipmentList.length === 0
                ) {

                    setBids([])

                    return

                }


                const responses =
                    await Promise.all(

                        shipmentList.map(
                            async (shipment) => {

                                try {

                                    const response =
                                        await api.get(
                                            `/bids/${shipment.id}`
                                        )


                                    const shipmentBids =
                                        Array.isArray(
                                            response.data
                                        )
                                            ? response.data
                                            : []


                                    return shipmentBids.map(
                                        (bid) => ({

                                            ...bid,

                                            from_city:
                                                shipment.from_city,

                                            to_city:
                                                shipment.to_city,

                                            shipment_amount:
                                                shipment.amount,

                                            shipment_status:
                                                shipment.status

                                        })
                                    )

                                } catch (err) {

                                    console.error(
                                        `Failed to fetch bids for shipment ${shipment.id}:`,
                                        err
                                    )

                                    return []

                                }

                            }
                        )

                    )


                let allBids =
                    responses.flat()


                // ==================================
                // TRANSPORTER
                // ==================================

                if (
                    user?.role ===
                    'transporter'
                ) {

                    allBids =
                        allBids.filter(
                            (bid) =>
                                String(
                                    bid.transporter_id
                                ) ===
                                String(
                                    user.id
                                )
                        )

                }


                console.log(
                    '💰 Dashboard bids:',
                    allBids
                )


                setBids(allBids)

            } catch (err) {

                console.error(
                    '❌ Bid loading error:',
                    err
                )


                setError(
                    err.response?.data?.error ||
                    err.message ||
                    'Failed to load bids'
                )

            } finally {

                setIsLoadingBids(false)

            }

        }


    // ========================================
    // REFRESH BIDS
    // ========================================

    const fetchBids = async () => {

        await fetchBidsForDashboard(
            shipments
        )

    }


    // ========================================
    // STAT CARD CLICK
    // ========================================

    const handleFilterClick =
        async (filter) => {

            setError('')


            if (
                activeFilter === filter
            ) {

                setActiveFilter('all')

                return

            }


            setActiveFilter(filter)


            if (
                filter === 'bids'
            ) {

                await fetchBids()

            }

        }


    // ========================================
    // OPEN CANCEL MODAL
    // ========================================

    const handleDeleteShipment = (shipment) => {

        setError('')

        setShipmentToCancel(shipment)

    }


    // ========================================
    // CONFIRM CANCEL / DELETE
    // ========================================

    const confirmDeleteShipment = async () => {

        if (!shipmentToCancel) {
            return
        }


        try {

            setIsCancelling(true)

            setError('')


            await api.delete(
                `/shipments/${shipmentToCancel.id}`
            )


            setShipmentToCancel(null)


            await fetchShipments()

        } catch (err) {

            console.error(
                'Delete shipment error:',
                err
            )


            setError(
                err.response?.data?.error ||
                'Failed to cancel shipment'
            )

        } finally {

            setIsCancelling(false)

        }

    }


    // ========================================
    // CLOSE CANCEL MODAL
    // ========================================

    const closeCancelModal = () => {

        if (isCancelling) {
            return
        }

        setShipmentToCancel(null)

    }


    // ========================================
    // WAIT FOR USER
    // ========================================

    if (!user) {

        return (

            <div>

                <Navbar />

                <div className="dashboard-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading dashboard...
                    </p>

                </div>

            </div>

        )

    }


    // ========================================
    // LOADING
    // ========================================

    if (isLoading) {

        return (

            <div>

                <Navbar />

                <div className="dashboard-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading dashboard...
                    </p>

                </div>

            </div>

        )

    }


    // ========================================
    // STATISTICS
    // ========================================

    const totalShipments =
        shipments.length


    // ========================================
    // SHIPPER STATISTICS
    // ========================================

    const inTransitShipments =
        shipments.filter(
            (shipment) =>
                shipment.status ===
                'in_transit'
        ).length


    const deliveredShipments =
        shipments.filter(
            (shipment) =>
                shipment.status ===
                'delivered'
        ).length


    // ========================================
    // TRANSPORTER STATISTICS
    // ========================================

    const availableShipments =
        shipments.filter(
            (shipment) =>
                shipment.status ===
                'posted'
        ).length


    const activeDeliveries =
        shipments.filter(
            (shipment) =>

                [
                    'assigned',
                    'in_transit'
                ].includes(
                    shipment.status
                )

                &&

                String(
                    shipment.transporter_id
                ) ===
                String(
                    user.id
                )

        ).length


    const completedDeliveries =
        shipments.filter(
            (shipment) =>

                shipment.status ===
                'delivered'

                &&

                String(
                    shipment.transporter_id
                ) ===
                String(
                    user.id
                )

        ).length


    const totalBids =
        bids.length


    // ========================================
    // FILTER SHIPMENTS
    // ========================================

    const filteredShipments =
        shipments.filter(
            (shipment) => {

                if (
                    activeFilter ===
                    'all'
                ) {

                    return true

                }


                if (
                    activeFilter ===
                    'in-transit'
                ) {

                    return (
                        shipment.status ===
                        'in_transit'
                    )

                }


                if (
                    activeFilter ===
                    'delivered'
                ) {

                    return (
                        shipment.status ===
                        'delivered'
                    )

                }


                if (
                    activeFilter ===
                    'available'
                ) {

                    return (
                        shipment.status ===
                        'posted'
                    )

                }


                if (
                    activeFilter ===
                    'my-active'
                ) {

                    return (

                        [
                            'assigned',
                            'in_transit'
                        ].includes(
                            shipment.status
                        )

                        &&

                        String(
                            shipment.transporter_id
                        ) ===
                        String(
                            user.id
                        )

                    )

                }


                if (
                    activeFilter ===
                    'my-completed'
                ) {

                    return (

                        shipment.status ===
                        'delivered'

                        &&

                        String(
                            shipment.transporter_id
                        ) ===
                        String(
                            user.id
                        )

                    )

                }


                return false

            }
        )


    // ========================================
    // STATUS CLASS
    // ========================================

    const getStatusClass =
        (status) => {

            switch (status) {

                case 'posted':
                    return 'open'

                case 'assigned':
                    return 'assigned'

                case 'in_transit':
                    return 'in-transit'

                case 'delivered':
                    return 'completed'

                case 'cancelled':
                    return 'cancelled'

                default:
                    return 'open'

            }

        }


    // ========================================
    // STATUS LABEL
    // ========================================

    const getStatusLabel =
        (status) => {

            switch (status) {

                case 'posted':
                    return 'Posted'

                case 'assigned':
                    return 'Assigned'

                case 'in_transit':
                    return 'In Transit'

                case 'delivered':
                    return 'Delivered'

                case 'cancelled':
                    return 'Cancelled'

                default:
                    return status || 'Unknown'

            }

        }


    // ========================================
    // SECTION TITLE
    // ========================================

    const getSectionTitle =
        () => {

            switch (activeFilter) {

                case 'in-transit':
                    return 'In Transit'

                case 'delivered':
                    return 'Delivered Shipments'

                case 'available':
                    return 'Available Shipments'

                case 'my-active':
                    return 'My Active Deliveries'

                case 'my-completed':
                    return 'Completed Deliveries'

                case 'bids':
                    return 'Bids Received'

                default:

                    return user.role ===
                        'shipper'

                        ? 'My Shipments'

                        : 'Available Shipments'

            }

        }


    // ========================================
    // SECTION DESCRIPTION
    // ========================================

    const getSectionDescription =
        () => {

            switch (activeFilter) {

                case 'in-transit':

                    return `${inTransitShipments} shipment${inTransitShipments !== 1 ? 's' : ''} currently in transit`


                case 'delivered':

                    return `${deliveredShipments} shipment${deliveredShipments !== 1 ? 's' : ''} delivered`


                case 'available':

                    return `${availableShipments} shipment${availableShipments !== 1 ? 's' : ''} available`


                case 'my-active':

                    return `${activeDeliveries} active deliver${activeDeliveries !== 1 ? 'ies' : 'y'}`


                case 'my-completed':

                    return `${completedDeliveries} completed deliver${completedDeliveries !== 1 ? 'ies' : 'y'}`


                case 'bids':

                    return `${totalBids} bid${totalBids !== 1 ? 's' : ''} received`


                default:

                    return user.role ===
                        'shipper'

                        ? `You have posted ${totalShipments} shipment${totalShipments !== 1 ? 's' : ''} in total.`

                        : `${availableShipments} shipment${availableShipments !== 1 ? 's are' : ' is'} currently available.`

            }

        }


    // ========================================
    // RENDER
    // ========================================

    return (

        <div className="dashboard">

            <Navbar />


            <main className="dashboard-main">


                {/* ====================================
                    WELCOME
                ==================================== */}

                <section className="welcome-section">

                    <div>

                        <h1>
                            Welcome back,{' '}

                            {user.name
                                ? user.name.charAt(0).toUpperCase() +
                                  user.name.slice(1).toLowerCase()
                                : 'there'}
                        </h1>


                        <p>

                            {user.role ===
                                'shipper'

                                ? 'Manage your shipments and bids'

                                : 'Find shipments and manage your bids'

                            }

                        </p>

                    </div>

                </section>


                {/* ====================================
                    ERROR
                ==================================== */}

                {error && (

                    <div className="error-message">

                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                )}


                {/* ====================================
                    STATISTICS
                ==================================== */}

                <section className="stats-grid">


                    {user.role ===
                    'shipper' ? (

                        <>

                            {/* BIDS */}

                            <button
                                type="button"
                                className={
                                    `stat-card ${
                                        activeFilter ===
                                        'bids'
                                            ? 'stat-card-active'
                                            : ''
                                    }`
                                }
                                onClick={() =>
                                    handleFilterClick(
                                        'bids'
                                    )
                                }
                            >

                                <div className="stat-number">

                                    {isLoadingBids
                                        ? '...'
                                        : totalBids
                                    }

                                </div>

                                <div className="stat-title">
                                    Bids Received
                                </div>

                            </button>


                            {/* IN TRANSIT */}

                            <button
                                type="button"
                                className={
                                    `stat-card ${
                                        activeFilter ===
                                        'in-transit'
                                            ? 'stat-card-active'
                                            : ''
                                    }`
                                }
                                onClick={() =>
                                    handleFilterClick(
                                        'in-transit'
                                    )
                                }
                            >

                                <div className="stat-number">
                                    {inTransitShipments}
                                </div>

                                <div className="stat-title">
                                    In Transit
                                </div>

                            </button>


                            {/* DELIVERED */}

                            <button
                                type="button"
                                className={
                                    `stat-card ${
                                        activeFilter ===
                                        'delivered'
                                            ? 'stat-card-active'
                                            : ''
                                    }`
                                }
                                onClick={() =>
                                    handleFilterClick(
                                        'delivered'
                                    )
                                }
                            >

                                <div className="stat-number">
                                    {deliveredShipments}
                                </div>

                                <div className="stat-title">
                                    Delivered
                                </div>

                            </button>

                        </>

                    ) : (

                        <>

                            {/* AVAILABLE */}

                            <button
                                type="button"
                                className={
                                    `stat-card ${
                                        activeFilter ===
                                        'available'
                                            ? 'stat-card-active'
                                            : ''
                                    }`
                                }
                                onClick={() =>
                                    handleFilterClick(
                                        'available'
                                    )
                                }
                            >

                                <div className="stat-number">
                                    {availableShipments}
                                </div>

                                <div className="stat-title">
                                    Available Shipments
                                </div>

                            </button>


                            {/* ACTIVE */}

                            <button
                                type="button"
                                className={
                                    `stat-card ${
                                        activeFilter ===
                                        'my-active'
                                            ? 'stat-card-active'
                                            : ''
                                    }`
                                }
                                onClick={() =>
                                    handleFilterClick(
                                        'my-active'
                                    )
                                }
                            >

                                <div className="stat-number">
                                    {activeDeliveries}
                                </div>

                                <div className="stat-title">
                                    My Active Deliveries
                                </div>

                            </button>


                            {/* BIDS */}

                            <button
                                type="button"
                                className={
                                    `stat-card ${
                                        activeFilter ===
                                        'bids'
                                            ? 'stat-card-active'
                                            : ''
                                    }`
                                }
                                onClick={() =>
                                    handleFilterClick(
                                        'bids'
                                    )
                                }
                            >

                                <div className="stat-number">

                                    {isLoadingBids
                                        ? '...'
                                        : totalBids
                                    }

                                </div>

                                <div className="stat-title">
                                    Bids Placed
                                </div>

                            </button>


                            {/* COMPLETED */}

                            <button
                                type="button"
                                className={
                                    `stat-card ${
                                        activeFilter ===
                                        'my-completed'
                                            ? 'stat-card-active'
                                            : ''
                                    }`
                                }
                                onClick={() =>
                                    handleFilterClick(
                                        'my-completed'
                                    )
                                }
                            >

                                <div className="stat-number">
                                    {completedDeliveries}
                                </div>

                                <div className="stat-title">
                                    Completed Deliveries
                                </div>

                            </button>

                        </>

                    )}

                </section>


                {/* ====================================
                    SHIPMENTS
                ==================================== */}

                <section className="shipments-section">

                    <div className="shipments-header">

                        <div>

                            <h2>
                                {getSectionTitle()}
                            </h2>

                            <p>
                                {getSectionDescription()}
                            </p>

                        </div>

                    </div>


                    {/* ====================================
                        BIDS VIEW
                    ==================================== */}

                    {activeFilter ===
                    'bids' ? (

                        <div>

                            {isLoadingBids ? (

                                <div className="empty-state">

                                    <div className="empty-icon">
                                        ⏳
                                    </div>

                                    <h3>
                                        Loading bids...
                                    </h3>

                                    <p>
                                        Fetching bid information
                                    </p>

                                </div>

                            ) : bids.length ===
                              0 ? (

                                <div className="empty-state">

                                    <div className="empty-icon">
                                        🤝
                                    </div>

                                    <h3>
                                        No bids yet
                                    </h3>

                                    <p>

                                        {user.role ===
                                            'shipper'

                                            ? 'No transporters have bid on your shipments yet.'

                                            : 'You have not placed any bids yet.'

                                        }

                                    </p>

                                </div>

                            ) : (

                                <div className="bid-list">

                                    {bids.map(
                                        (bid) => (

                                            <div
                                                className="shipment-card"
                                                key={
                                                    `${bid.id}-${bid.shipment_id}`
                                                }
                                            >

                                                <div className="shipment-route">

                                                    <div>

                                                        <span className="location-label">
                                                            FROM
                                                        </span>

                                                        <strong>
                                                            {formatLocation(
                                                                bid.from_city
                                                            )}
                                                        </strong>

                                                    </div>


                                                    <span className="route-arrow">
                                                        →
                                                    </span>


                                                    <div>

                                                        <span className="location-label">
                                                            TO
                                                        </span>

                                                        <strong>
                                                            {formatLocation(
                                                                bid.to_city
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div className="shipment-details">

                                                    <div>

                                                        <span>
                                                            Bid Amount
                                                        </span>

                                                        <strong>

                                                            ₹
                                                            {Number(
                                                                bid.amount ||
                                                                0
                                                            ).toLocaleString(
                                                                'en-IN'
                                                            )}

                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            {
                                                                user.role ===
                                                                'shipper'

                                                                    ? 'Transporter'
                                                                    : 'Bidder'
                                                            }
                                                        </span>

                                                        <strong>
                                                            {
                                                                bid.transporter_name ||
                                                                'Transporter'
                                                            }
                                                        </strong>

                                                    </div>


                                                    <div>

                                                        <span>
                                                            Status
                                                        </span>

                                                        <span
                                                            className={
                                                                `shipment-status ${
                                                                    bid.status ===
                                                                    'accepted'

                                                                        ? 'completed'

                                                                        : bid.status ===
                                                                          'rejected'

                                                                            ? 'open'

                                                                            : 'assigned'
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                bid.status ||
                                                                'Pending'
                                                            }

                                                        </span>

                                                    </div>

                                                </div>


                                                {bid.note && (

                                                    <div
                                                        style={{
                                                            padding:
                                                                '12px 0',

                                                            color:
                                                                '#64748b',

                                                            fontSize:
                                                                '14px'
                                                        }}
                                                    >

                                                        <strong>
                                                            Message:
                                                        </strong>

                                                        {' '}

                                                        {bid.note}

                                                    </div>

                                                )}


                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/shipments/${bid.shipment_id}`
                                                        )
                                                    }
                                                >

                                                    View Shipment →

                                                </button>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    ) : (

                        /* ====================================
                            SHIPMENT VIEW
                        ==================================== */

                        filteredShipments.length ===
                        0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">

                                    {
                                        activeFilter ===
                                        'delivered'

                                            ? '✅'

                                            : activeFilter ===
                                              'in-transit'

                                                ? '🚚'

                                                : activeFilter ===
                                                  'available'

                                                    ? '📦'

                                                    : '📦'
                                    }

                                </div>


                                <h3>

                                    {
                                        activeFilter ===
                                        'in-transit'

                                            ? 'No shipments in transit'

                                            : activeFilter ===
                                              'delivered'

                                                ? 'No delivered shipments'

                                                : activeFilter ===
                                                  'available'

                                                    ? 'No shipments available'

                                                    : 'No shipments yet'
                                    }

                                </h3>


                                <p>

                                    {
                                        activeFilter ===
                                        'in-transit'

                                            ? 'You currently have no shipments in transit.'

                                            : activeFilter ===
                                              'delivered'

                                                ? 'You have no delivered shipments yet.'

                                                : activeFilter ===
                                                  'available'

                                                    ? 'There are no shipments available right now.'

                                                    : 'Create your first shipment to get started.'
                                    }

                                </p>


                                {user.role ===
                                    'shipper' &&
                                    activeFilter ===
                                    'all' && (

                                    <button
                                        className="empty-post-btn"
                                        onClick={() =>
                                            navigate(
                                                '/shipments/new'
                                            )
                                        }
                                    >

                                        + Post Shipment

                                    </button>

                                )}

                            </div>

                        ) : (

                            <div className="shipment-list">

                                {filteredShipments.map(
                                    (shipment) => (

                                        <div
                                            className="shipment-card"
                                            key={
                                                shipment.id
                                            }
                                        >

                                            {/* ROUTE */}

                                            <div className="shipment-route">

                                                <div>

                                                    <span className="location-label">
                                                        FROM
                                                    </span>

                                                    <strong>
                                                        {formatLocation(
                                                            shipment.from_city
                                                        )}
                                                    </strong>

                                                </div>


                                                <span className="route-arrow">
                                                    →
                                                </span>


                                                <div>

                                                    <span className="location-label">
                                                        TO
                                                    </span>

                                                    <strong>
                                                        {formatLocation(
                                                            shipment.to_city
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* DETAILS */}

                                            <div className="shipment-details">

                                                {/* WEIGHT */}

                                                <div>

                                                    <span>
                                                        Weight
                                                    </span>

                                                    <strong>
                                                        {
                                                            shipment.weight_kg
                                                        } kg
                                                    </strong>

                                                </div>


                                                {/* AMOUNT */}

                                                <div>

                                                    <span>
                                                        Amount
                                                    </span>

                                                    <strong>

                                                        ₹
                                                        {Number(
                                                            shipment.amount ||
                                                            0
                                                        ).toLocaleString(
                                                            'en-IN'
                                                        )}

                                                    </strong>

                                                </div>


                                                {/* STATUS + CANCEL */}

                                                <div className="status-container">

                                                    <span className="status-label">
                                                        Status
                                                    </span>


                                                    <div className="status-actions">

                                                        <span
                                                            className={
                                                                `shipment-status ${
                                                                    getStatusClass(
                                                                        shipment.status
                                                                    )
                                                                }`
                                                            }
                                                        >

                                                            {
                                                                getStatusLabel(
                                                                    shipment.status
                                                                )
                                                            }

                                                        </span>


                                                        {/* CANCEL ONLY POSTED SHIPMENTS */}

                                                        {user.role ===
                                                            'shipper' &&

                                                            shipment.status ===
                                                            'posted' && (

                                                            <button
                                                                type="button"
                                                                className="cancel-btn"
                                                                onClick={() =>
                                                                    handleDeleteShipment(
                                                                        shipment
                                                                    )
                                                                }
                                                            >

                                                                Cancel

                                                            </button>

                                                        )}

                                                    </div>

                                                </div>

                                            </div>


                                            {/* VIEW */}

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    navigate(
                                                        `/shipments/${shipment.id}`
                                                    )
                                                }
                                            >

                                                View →

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )

                    )}

                </section>

            </main>


            {/* =========================================
                CANCEL CONFIRMATION MODAL
            ========================================= */}

            {shipmentToCancel && (

                <div
                    className="modal-overlay"
                    onClick={closeCancelModal}
                >

                    <div
                        className="cancel-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* WARNING ICON */}

                        <div className="cancel-icon">
                            !
                        </div>


                        {/* HEADING */}

                        <h3>
                            Cancel shipment?
                        </h3>


                        {/* DESCRIPTION */}

                        <p>

                            Are you sure you want to cancel
                            this shipment from{' '}

                            <strong>
                                {formatLocation(
                                    shipmentToCancel.from_city
                                )}
                            </strong>

                            {' '}to{' '}

                            <strong>
                                {formatLocation(
                                    shipmentToCancel.to_city
                                )}
                            </strong>
                            ?

                        </p>


                        {/* WARNING */}

                        <span className="cancel-warning">
                            This action cannot be undone.
                        </span>


                        {/* ACTIONS */}

                        <div className="modal-actions">

                            <button
                                type="button"
                                className="keep-shipment-btn"
                                onClick={
                                    closeCancelModal
                                }
                                disabled={
                                    isCancelling
                                }
                            >

                                Keep Shipment

                            </button>


                            <button
                                type="button"
                                className="confirm-cancel-btn"
                                onClick={
                                    confirmDeleteShipment
                                }
                                disabled={
                                    isCancelling
                                }
                            >

                                {isCancelling
                                    ? 'Cancelling...'
                                    : 'Cancel Shipment'
                                }

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )

}


export default Dashboard