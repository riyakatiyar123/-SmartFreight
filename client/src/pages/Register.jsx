import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import '../styles/Auth.css'

const Register = () => {

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'shipper',
        phone: '',
        truck_number: '',
        truck_type: 'medium',
        truck_capacity_kg: '',
        mileage_kmpl: '4.0'
    })

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()


    // ========================================
    // HANDLE INPUT CHANGE
    // ========================================

    const handleChange = (e) => {

        const { name, value } = e.target

        setForm({
            ...form,
            [name]: value
        })

        // Remove old error while user is correcting input
        if (error) {
            setError('')
        }
    }


    // ========================================
    // HANDLE ROLE CHANGE
    // ========================================

    const handleRoleChange = (role) => {

        setForm({
            ...form,
            role
        })

        setError('')
    }


    // ========================================
    // FRONTEND VALIDATION
    // ========================================

    const validateForm = () => {

        const name = form.name.trim()
        const email = form.email.trim()
        const password = form.password
        const phone = form.phone.trim()


        // NAME
        if (!name) {
            return 'Full name is required.'
        }

        if (name.length < 2) {
            return 'Full name must contain at least 2 characters.'
        }


        // EMAIL
        if (!email) {
            return 'Email address is required.'
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
            return 'Please enter a valid email address.'
        }


        // PASSWORD
        if (!password) {
            return 'Password is required.'
        }

        if (password.length < 6) {
            return 'Password must be at least 6 characters.'
        }


        // PHONE
        if (!phone) {
            return 'Phone number is required.'
        }

        // Remove spaces, +91, hyphens etc.
        const cleanedPhone =
            phone.replace(/\D/g, '')

        if (cleanedPhone.length !== 10) {
            return 'Phone number must be exactly 10 digits.'
        }


        // ========================================
        // TRANSPORTER VALIDATION
        // ========================================

        if (form.role === 'transporter') {

            const truckNumber =
                form.truck_number.trim()

            if (!truckNumber) {
                return 'Truck registration number is required.'
            }


            // Basic Indian vehicle registration format
            const truckRegex =
                /^[A-Z]{2}[- ]?\d{1,2}[- ]?[A-Z]{1,3}[- ]?\d{1,4}$/i

            if (!truckRegex.test(truckNumber)) {
                return 'Please enter a valid truck registration number, e.g. KA-01-AB-1234.'
            }


            // TRUCK CAPACITY

            if (!form.truck_capacity_kg) {
                return 'Truck carrying capacity is required.'
            }

            const capacity =
                Number(form.truck_capacity_kg)

            if (!Number.isFinite(capacity) || capacity <= 0) {
                return 'Truck capacity must be greater than 0 kg.'
            }


            // MILEAGE

            if (!form.mileage_kmpl) {
                return 'Fuel mileage is required.'
            }

            const mileage =
                Number(form.mileage_kmpl)

            if (
                !Number.isFinite(mileage) ||
                mileage < 2 ||
                mileage > 10
            ) {
                return 'Fuel mileage must be between 2 and 10 km/L.'
            }

        }


        return null
    }


    // ========================================
    // HANDLE SUBMIT
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        setError('')


        // ========================================
        // VALIDATE BEFORE API REQUEST
        // ========================================

        const validationError =
            validateForm()

        if (validationError) {

            setError(validationError)

            return
        }


        setIsLoading(true)


        try {

            const response = await api.post(
                '/auth/register',
                {
                    ...form,
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    phone: form.phone.replace(/\D/g, '')
                }
            )


            console.log(
                'REGISTER RESPONSE:',
                response.data
            )


            // ========================================
            // SAVE LOGIN INFORMATION
            // ========================================

            if (response.data.token) {

                localStorage.setItem(
                    'token',
                    response.data.token
                )
            }


            if (response.data.user) {

                localStorage.setItem(
                    'user',
                    JSON.stringify(
                        response.data.user
                    )
                )
            }


            // ========================================
            // REDIRECT
            // ========================================

            navigate('/dashboard')


        } catch (err) {

            console.error(
                'REGISTRATION ERROR:',
                err
            )


            // ========================================
            // SERVER ERROR
            // ========================================

            const status =
                err.response?.status

            const serverError =
                err.response?.data?.error


            if (serverError) {

                // Handle common backend messages
                const message =
                    serverError.toLowerCase()


                if (
                    message.includes('duplicate') ||
                    message.includes('already exists') ||
                    message.includes('already registered') ||
                    message.includes('unique')
                ) {

                    setError(
                        'This email is already registered.'
                    )

                } else if (
                    message.includes('email')
                ) {

                    setError(
                        'Please enter a valid email address.'
                    )

                } else if (
                    message.includes('password')
                ) {

                    setError(
                        'Password must be at least 6 characters.'
                    )

                } else if (
                    message.includes('phone')
                ) {

                    setError(
                        'Please enter a valid 10-digit phone number.'
                    )

                } else {

                    // If backend already gives a useful
                    // message, display it.
                    setError(serverError)
                }


            } else if (status === 400) {

                setError(
                    'Please check your information and try again.'
                )


            } else if (status === 401) {

                setError(
                    'Registration request was not authorized.'
                )


            } else if (status === 409) {

                setError(
                    'This email is already registered.'
                )


            } else if (status >= 500) {

                setError(
                    'Server error during registration. Please try again.'
                )


            } else if (err.request) {

                setError(
                    'Unable to connect to the server. Please check your internet connection.'
                )


            } else {

                setError(
                    'Something went wrong. Please try again.'
                )
            }


        } finally {

            setIsLoading(false)
        }

    }


    return (
        <div className="auth-page-wrapper">

            <Navbar />

            <section className="auth-page register-page">

                <div className="auth-box register-box">

                    {/* ========================================
                        HEADER
                    ======================================== */}

                    <div className="auth-header">

                        <p className="page-label">
                            GET STARTED
                        </p>

                        <h1>
                            Join
                            <br />
                            <span>SmartFreight.</span>
                        </h1>

                        <p className="auth-description">
                            Create your account and become part
                            of a smarter logistics network.
                        </p>

                    </div>


                    {/* ========================================
                        ERROR MESSAGE
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
                            ROLE
                        ==================================== */}

                        <div className="form-group">

                            <label>
                                I am a
                            </label>

                            <div className="role-selection">

                                {/* SHIPPER */}

                                <button
                                    type="button"
                                    className={
                                        form.role === 'shipper'
                                            ? 'role-card selected'
                                            : 'role-card'
                                    }
                                    onClick={() =>
                                        handleRoleChange('shipper')
                                    }
                                >

                                    <span className="role-icon">
                                        📦
                                    </span>

                                    <strong>
                                        Shipper
                                    </strong>

                                    <small>
                                        I need to send goods
                                    </small>

                                </button>


                                {/* TRANSPORTER */}

                                <button
                                    type="button"
                                    className={
                                        form.role === 'transporter'
                                            ? 'role-card selected'
                                            : 'role-card'
                                    }
                                    onClick={() =>
                                        handleRoleChange('transporter')
                                    }
                                >

                                    <span className="role-icon">
                                        🚛
                                    </span>

                                    <strong>
                                        Transporter
                                    </strong>

                                    <small>
                                        I have a truck
                                    </small>

                                </button>

                            </div>

                        </div>


                        {/* ====================================
                            NAME
                        ==================================== */}

                        <div className="form-group">

                            <label htmlFor="name">
                                Full Name *
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Rahul Sharma"
                                value={form.name}
                                onChange={handleChange}
                            />

                        </div>


                        {/* ====================================
                            EMAIL
                        ==================================== */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email Address *
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="rahul@gmail.com"
                                value={form.email}
                                onChange={handleChange}
                            />

                        </div>


                        {/* ====================================
                            PASSWORD
                        ==================================== */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password *
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={form.password}
                                onChange={handleChange}
                            />

                        </div>


                        {/* ====================================
                            PHONE
                        ==================================== */}

                        <div className="form-group">

                            <label htmlFor="phone">
                                Phone Number *
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="9876543210"
                                value={form.phone}
                                onChange={handleChange}
                            />

                        </div>


                        {/* ====================================
                            TRANSPORTER DETAILS
                        ==================================== */}

                        {form.role === 'transporter' && (

                            <div className="truck-details">

                                <div className="truck-details-header">

                                    <span>
                                        🚛
                                    </span>

                                    <div>

                                        <strong>
                                            Truck Details
                                        </strong>

                                        <p>
                                            Tell us about your vehicle
                                        </p>

                                    </div>

                                </div>


                                {/* TRUCK NUMBER */}

                                <div className="form-group">

                                    <label htmlFor="truck_number">
                                        Truck Registration Number *
                                    </label>

                                    <input
                                        id="truck_number"
                                        name="truck_number"
                                        type="text"
                                        placeholder="KA-01-AB-1234"
                                        value={form.truck_number}
                                        onChange={handleChange}
                                    />

                                </div>


                                {/* TRUCK TYPE */}

                                <div className="form-group">

                                    <label htmlFor="truck_type">
                                        Truck Type *
                                    </label>

                                    <select
                                        id="truck_type"
                                        name="truck_type"
                                        value={form.truck_type}
                                        onChange={handleChange}
                                    >

                                        <option value="mini">
                                            Mini Truck — up to 1 tonne
                                        </option>

                                        <option value="medium">
                                            Medium Truck — 1–5 tonnes
                                        </option>

                                        <option value="heavy">
                                            Heavy Truck — 5–15 tonnes
                                        </option>

                                        <option value="trailer">
                                            Trailer — 15+ tonnes
                                        </option>

                                    </select>

                                </div>


                                {/* CAPACITY */}

                                <div className="form-group">

                                    <label htmlFor="truck_capacity_kg">
                                        Carrying Capacity (kg) *
                                    </label>

                                    <input
                                        id="truck_capacity_kg"
                                        name="truck_capacity_kg"
                                        type="number"
                                        min="1"
                                        placeholder="e.g. 8000"
                                        value={form.truck_capacity_kg}
                                        onChange={handleChange}
                                    />

                                </div>


                                {/* MILEAGE */}

                                <div className="form-group">

                                    <label htmlFor="mileage_kmpl">

                                        Fuel Mileage

                                        <span className="label-hint">
                                            Typical: 3–6 km/L
                                        </span>

                                    </label>

                                    <input
                                        id="mileage_kmpl"
                                        name="mileage_kmpl"
                                        type="number"
                                        step="0.1"
                                        min="2"
                                        max="10"
                                        placeholder="4.0"
                                        value={form.mileage_kmpl}
                                        onChange={handleChange}
                                    />

                                </div>


                                {/* WARNING */}

                                <div className="truck-warning">

                                    <span>
                                        ⚠️
                                    </span>

                                    <p>
                                        Please enter realistic mileage.
                                        Heavy trucks typically get
                                        3–4 km/L. We verify this against
                                        your trip history.
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* ====================================
                            SUBMIT
                        ==================================== */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={isLoading}
                        >

                            {isLoading
                                ? 'Creating account...'
                                : 'Create Account'
                            }

                            {!isLoading && (
                                <span>
                                    →
                                </span>
                            )}

                        </button>

                    </form>


                    {/* ========================================
                        LOGIN
                    ======================================== */}

                    <p className="auth-switch">

                        Already have an account?

                        <Link to="/login">
                            Login here
                        </Link>

                    </p>

                </div>

            </section>

        </div>
    )
}

export default Register