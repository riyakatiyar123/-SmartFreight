import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'

const TransporterProfile = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/users/${id}`)
                setProfile(response.data)
            } catch (err) {
                console.log(err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchProfile()
    }, [id])

    if (isLoading) return <div><Navbar /><p style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</p></div>
    if (!profile) return <div><Navbar /><p style={{ textAlign: 'center', marginTop: '100px' }}>Profile not found</p></div>

    const onTimePercent = profile.total_trips > 0
        ? Math.round((profile.on_time_deliveries / profile.total_trips) * 100)
        : 0

    const cancellationRate = profile.total_trips > 0
        ? ((profile.cancellations / profile.total_trips) * 100).toFixed(1)
        : 0

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Navbar />
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>

                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '16px', marginBottom: '20px', padding: 0 }}
                >
                    ← Back
                </button>

                {/* Profile Header */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: '700'
                        }}>
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 4px' }}>{profile.name}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {profile.rating > 0 && (
                                    <span style={{ color: '#d97706', fontWeight: '700' }}>
                                        ⭐ {Number(profile.rating).toFixed(1)} / 5
                                    </span>
                                )}
                                {profile.aadhaar_verified && (
                                    <span style={{
                                        background: '#f0fdf4',
                                        color: '#16a34a',
                                        padding: '2px 8px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        ✓ Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px'
                    }}>
                        {[
                            { label: 'Completed trips', value: profile.total_trips || 0 },
                            { label: 'On-time delivery', value: `${onTimePercent}%` },
                            { label: 'Cancellation rate', value: `${cancellationRate}%` }
                        ].map(stat => (
                            <div key={stat.label} style={{
                                background: '#f8fafc',
                                borderRadius: '8px',
                                padding: '12px',
                                textAlign: 'center'
                            }}>
                                <p style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800' }}>
                                    {stat.value}
                                </p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Truck Details */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0'
                }}>
                    <p style={{ margin: '0 0 16px', fontWeight: '700' }}>🚛 Truck Details</p>
                    {[
                        ['Registration Number', profile.truck_number],
                        ['Truck Type', profile.truck_type],
                        ['Capacity', profile.truck_capacity_kg ? `${profile.truck_capacity_kg} kg` : null],
                        ['Fuel Type', profile.fuel_type],
                        ['Mileage', profile.mileage_kmpl ? `${profile.mileage_kmpl} km/L` : null],
                        ['Experience', profile.years_experience ? `${profile.years_experience} years` : null]
                    ].filter(([, val]) => val).map(([label, value]) => (
                        <div key={label} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '8px 0',
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '14px'
                        }}>
                            <span style={{ color: '#666' }}>{label}</span>
                            <span style={{ fontWeight: '600' }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Contact */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <p style={{ margin: '0 0 16px', fontWeight: '700' }}>📞 Contact</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        Phone: <strong>{profile.phone || 'Not provided'}</strong>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default TransporterProfile