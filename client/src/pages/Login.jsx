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


    // ========================================
    // EMAIL VALIDATION
    // ========================================

    const isValidEmail = (email) => {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        return emailRegex.test(email)
    }


    // ========================================
    // HANDLE LOGIN
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        setError('')


        // ========================================
        // CLEAN INPUT
        // ========================================

        const cleanEmail =
            email.trim().toLowerCase()


        // ========================================
        // FRONTEND VALIDATION
        // ========================================

        if (!cleanEmail) {

            setError(
                'Email address is required.'
            )

            return
        }


        if (!isValidEmail(cleanEmail)) {

            setError(
                'Please enter a valid email address.'
            )

            return
        }


        if (!password) {

            setError(
                'Password is required.'
            )

            return
        }


        if (password.length < 6) {

            setError(
                'Password must be at least 6 characters.'
            )

            return
        }


        // ========================================
        // LOGIN REQUEST
        // ========================================

        setIsLoading(true)


        try {

            const response =
                await api.post(
                    '/auth/login',
                    {
                        email: cleanEmail,
                        password
                    }
                )


            console.log(
                'LOGIN RESPONSE:',
                response.data
            )


            // ========================================
            // SAVE TOKEN
            // ========================================

            if (response.data.token) {

                localStorage.setItem(
                    'token',
                    response.data.token
                )

            }


            // ========================================
            // SAVE USER
            // ========================================

            if (response.data.user) {

                localStorage.setItem(
                    'user',
                    JSON.stringify(
                        response.data.user
                    )
                )

            }


            // ========================================
            // GO TO DASHBOARD
            // ========================================

            navigate('/dashboard')


        } catch (err) {

            console.error(
                'LOGIN ERROR:',
                err
            )


            const status =
                err.response?.status

            const serverError =
                err.response?.data?.error


            // ========================================
            // BACKEND ERROR MESSAGE
            // ========================================

            if (serverError) {

                setError(serverError)

            }


            // ========================================
            // SERVER ERROR
            // ========================================

            else if (status >= 500) {

                setError(
                    'Server error. Please try again later.'
                )

            }


            // ========================================
            // CONNECTION ERROR
            // ========================================

            else if (err.request) {

                setError(
                    'Unable to connect to the server. Please check your connection.'
                )

            }


            // ========================================
            // UNKNOWN ERROR
            // ========================================

            else {

                setError(
                    'Login failed. Please try again.'
                )

            }

        } finally {

            setIsLoading(false)

        }

    }


    return (

        <div className="auth-page-wrapper">

            <Navbar />

            <section className="auth-page">

                <div className="auth-box">


                    {/* ========================================
                        HEADER
                    ======================================== */}

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


                    {/* ========================================
                        ERROR
                    ======================================== */}

                    {error && (

                        <div
                            className="auth-error"
                            role="alert"
                        >
                            {error}
                        </div>

                    )}


                    {/* ========================================
                        FORM
                    ======================================== */}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >


                        {/* ====================================
                            EMAIL
                        ==================================== */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => {

                                    setEmail(
                                        e.target.value
                                    )

                                    if (error) {
                                        setError('')
                                    }

                                }}
                            />

                        </div>


                        {/* ====================================
                            PASSWORD
                        ==================================== */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {

                                    setPassword(
                                        e.target.value
                                    )

                                    if (error) {
                                        setError('')
                                    }

                                }}
                            />

                        </div>


                        {/* ====================================
                            LOGIN BUTTON
                        ==================================== */}

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
                                <span>
                                    →
                                </span>
                            )}

                        </button>


                    </form>


                    {/* ========================================
                        REGISTER
                    ======================================== */}

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