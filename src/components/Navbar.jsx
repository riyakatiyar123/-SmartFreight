import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem('user'))

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/')
    }

    return (
        <nav style={{
            background: '#1e293b',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '60px'
        }}>
            <h2
                style={{ color: 'white', margin: 0, cursor: 'pointer' }}
                onClick={() => navigate('/dashboard')}
            >
                SmartFreight
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ color: '#94a3b8' }}>
                    {user?.name} ({user?.role})
                </span>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        color: '#94a3b8',
                        border: '1px solid #94a3b8',
                        padding: '6px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    )
}

export default Navbar