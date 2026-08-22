import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import '../styles/Auth.css'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setIsLoading(true)

        try {
            const response = await api.post('/auth/login', {
                email,
                password
            })

            console.log('LOGIN RESPONSE:', response.data)

            localStorage.setItem('token', response.data.token)
            localStorage.setItem(
                'user',
                JSON.stringify(response.data.user)
            )

            navigate('/dashboard')

        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Login failed. Please check your email and password.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-page-wrapper">

            <Navbar />

            <section className="auth-page">

                <div className="auth-box">

                    {/* HEADER */}

                    <div className="auth-header">

                        <p className="page-label">
                            WELCOME BACK
                        </p>

                        <h1>
                            Login to
                            <br />
                            <span>SmartFreight.</span>
                        </h1>

                        

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    {/* FORM */}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isLoading}
                        >
                            {isLoading
                                ? 'Logging in...'
                                : 'Login'
                            }

                            {!isLoading && (
                                <span>→</span>
                            )}
                        </button>

                    </form>


                    {/* REGISTER */}

                    <p className="auth-switch">

                        Don't have an account?

                        <Link to="/register">
                            Create one
                        </Link>

                    </p>

                </div>

            </section>

        </div>
    )
}

export default Login