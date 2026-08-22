import { useState, useRef, useEffect } from 'react'

const TrackingMode = ({ shipmentId, socket, onLocationUpdate }) => {
    const [mode, setMode] = useState('real')
    const [isTracking, setIsTracking] = useState(false)
    const intervalRef = useRef(null)
    const simIndexRef = useRef(0)

    // Simulated route Kanpur → Gurgaon
    const simulatedRoute = [
        { lat: 26.4499, lng: 80.3319, label: 'Kanpur' },
        { lat: 26.5910, lng: 80.1850, label: 'Unnao' },
        { lat: 26.7606, lng: 79.9042, label: 'Fatehpur' },
        { lat: 27.1767, lng: 78.0081, label: 'Agra' },
        { lat: 27.4924, lng: 77.6737, label: 'Mathura' },
        { lat: 28.0229, lng: 77.3236, label: 'Palwal' },
        { lat: 28.4595, lng: 77.0266, label: 'Gurgaon' }
    ]

    const startTracking = () => {
        setIsTracking(true)

        if (mode === 'real') {
            // Real GPS
            intervalRef.current = setInterval(() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const location = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    }
                    socket.emit('location-update', { shipmentId, ...location })
                    onLocationUpdate(location)
                })
            }, 5000)
        } else {
            // Demo simulation
            simIndexRef.current = 0
            intervalRef.current = setInterval(() => {
                if (simIndexRef.current < simulatedRoute.length) {
                    const location = simulatedRoute[simIndexRef.current]
                    socket.emit('location-update', {
                        shipmentId,
                        lat: location.lat,
                        lng: location.lng
                    })
                    onLocationUpdate(location)
                    simIndexRef.current++
                } else {
                    stopTracking()
                }
            }, 4000)
        }
    }

    const stopTracking = () => {
        setIsTracking(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
    }

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [])

    return (
        <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px'
        }}>
            <p style={{ margin: '0 0 12px', fontWeight: '700', fontSize: '14px' }}>
                Tracking Mode
            </p>

            {/* Mode selection */}
            {!isTracking && (
                <div style={{ marginBottom: '12px' }}>
                    {[
                        { value: 'real', label: '● Real GPS', desc: 'Uses your device location' },
                        { value: 'demo', label: '○ Demo Simulation', desc: 'Simulates Kanpur → Gurgaon route' }
                    ].map(m => (
                        <div
                            key={m.value}
                            onClick={() => setMode(m.value)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px',
                                border: `2px solid ${mode === m.value ? '#2563eb' : '#e2e8f0'}`,
                                borderRadius: '8px',
                                marginBottom: '8px',
                                cursor: 'pointer',
                                background: mode === m.value ? '#eff6ff' : 'white'
                            }}
                        >
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: `2px solid ${mode === m.value ? '#2563eb' : '#94a3b8'}`,
                                background: mode === m.value ? '#2563eb' : 'white',
                                flexShrink: 0
                            }} />
                            <div>
                                <p style={{ margin: 0, fontWeight: '600', fontSize: '13px' }}>
                                    {m.label}
                                </p>
                                <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
                                    {m.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tracking button */}
            {!isTracking ? (
                <button
                    onClick={startTracking}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}
                >
                    {mode === 'real' ? '📍 Start Real GPS Tracking' : '🎬 Start Demo Simulation'}
                </button>
            ) : (
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '10px',
                        padding: '8px 12px',
                        background: '#f0fdf4',
                        borderRadius: '8px'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#16a34a'
                        }} />
                        <span style={{ fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                            {mode === 'real' ? 'Sharing real location...' : 'Demo simulation running...'}
                        </span>
                    </div>
                    <button
                        onClick={stopTracking}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        Stop Tracking
                    </button>
                </div>
            )}
        </div>
    )
}

export default TrackingMode