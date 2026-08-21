import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import "../styles/Dashboard.css"

const Dashboard = () => {
    const [shipments, setShipments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user'))

    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }

        fetchShipments()
    }, [])

    const fetchShipments = async () => {
        try {
            const response = await api.get('/shipments')
            console.log('Shipments:', response.data)
            setShipments(response.data)
        } catch (err) {
            console.error('Shipment error:', err)

            setError(
                err.response?.data?.error ||
                err.message ||
                'Failed to load shipments'
            )
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) {
        return null
    }

    if (isLoading) {
        return (
            <div>
                <Navbar />

                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading shipments...</p>
                </div>
            </div>
        )
    }

    // Calculate some dashboard statistics
    const totalShipments = shipments.length

    const activeShipments = shipments.filter(
        shipment =>
            shipment.status === 'open' ||
            shipment.status === 'active'
    ).length

    const completedShipments = shipments.filter(
        shipment =>
            shipment.status === 'completed' ||
            shipment.status === 'delivered'
    ).length

    return (
        <div className="dashboard">

            {/* Existing Navbar */}
            <Navbar />

            <main className="dashboard-main">

                {/* Welcome Section */}
                <section className="welcome-section">

                    <div>
                        <h1>
                            Welcome back, {user.name || 'there'} 👋
                        </h1>

                        <p>
                            Manage your shipments and bids
                        </p>
                    </div>

                </section>


                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <strong>Something went wrong</strong>
                        <p>{error}</p>
                    </div>
                )}


                {/* Statistics */}
                <section className="stats-grid">

                    <div className="stat-card">
                        <div className="stat-number">
                            {totalShipments}
                        </div>

                        <div className="stat-title">
                            Shipments
                        </div>
                    </div>


                    <div className="stat-card">
                        <div className="stat-number">
                            {activeShipments}
                        </div>

                        <div className="stat-title">
                            Active
                        </div>
                    </div>


                    <div className="stat-card">
                        <div className="stat-number">
                            0
                        </div>

                        <div className="stat-title">
                            Bids
                        </div>
                    </div>


                    <div className="stat-card">
                        <div className="stat-number">
                            {completedShipments}
                        </div>

                        <div className="stat-title">
                            Completed
                        </div>
                    </div>

                </section>


                {/* Shipments */}
                <section className="shipments-section">

                    <div className="shipments-header">

                        <div>
                            <h2>
                                {user.role === 'shipper'
                                    ? 'My Shipments'
                                    : 'Available Shipments'
                                }
                            </h2>

                            <p>
                                {shipments.length === 0
                                    ? 'You have no shipments yet'
                                    : `${shipments.length} shipment${shipments.length !== 1 ? 's' : ''} available`
                                }
                            </p>
                        </div>


                        {/* Only shipper should post shipment */}
                        {user.role === 'shipper' && (
                            <button
                                className="post-btn"
                                onClick={() => navigate('/shipments/new')}
                            >
                                + Post Shipment
                            </button>
                        )}

                    </div>


                    {/* Empty State */}
                    {shipments.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📦
                            </div>

                            <h3>
                                No shipments yet
                            </h3>

                            <p>
                                Create your first shipment to get started
                            </p>

                            {user.role === 'shipper' && (
                                <button
                                    className="empty-post-btn"
                                    onClick={() => navigate('/shipments/new')}
                                >
                                    + Post Shipment
                                </button>
                            )}

                        </div>

                    ) : (

                        /* Shipment Cards */
                        <div className="shipment-list">

                            {shipments.map(shipment => (

                                <div
                                    className="shipment-card"
                                    key={shipment.id}
                                >

                                    <div className="shipment-route">

                                        <div>
                                            <span className="location-label">
                                                FROM
                                            </span>

                                            <strong>
                                                {shipment.from_city}
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
                                                {shipment.to_city}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="shipment-details">

                                        <div>
                                            <span>Weight</span>
                                            <strong>
                                                {shipment.weight_kg} kg
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Amount</span>
                                            <strong>
                                                ₹{shipment.amount}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Status</span>

                                            <span
                                                className={`shipment-status ${
                                                    shipment.status === 'completed'
                                                        ? 'completed'
                                                        : 'open'
                                                }`}
                                            >
                                                {shipment.status || 'Open'}
                                            </span>
                                        </div>

                                    </div>


                                    <button
                                        className="view-btn"
                                        onClick={() =>
                                            navigate(`/shipments/${shipment.id}`)
                                        }
                                    >
                                        View →
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    )
}

export default Dashboard