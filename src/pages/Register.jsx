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


    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        })

    }


    const handleRoleChange = (role) => {

        setForm({
            ...form,
            role
        })

    }


    const handleSubmit = async (e) => {

        e.preventDefault()

        setError('')
        setIsLoading(true)

        try {

            const response = await api.post(
                '/auth/register',
                form
            )

            console.log(
                'REGISTER RESPONSE:',
                response.data
            )

            localStorage.setItem(
                'token',
                response.data.token
            )

            localStorage.setItem(
                'user',
                JSON.stringify(response.data.user)
            )

            navigate('/dashboard')

        } catch (err) {

            setError(
                err.response?.data?.error ||
                'Registration failed. Please try again.'
            )

        } finally {

            setIsLoading(false)

        }

    }


    return (
        <div className="auth-page-wrapper">

            <Navbar />

            <section className="auth-page register-page">

                <div className="auth-box register-box">

                    {/* HEADER */}

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


                    {/* ERROR */}

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >

                        {/* ROLE */}

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


                        {/* NAME */}

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
                                required
                            />

                        </div>


                        {/* EMAIL */}

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
                                required
                            />

                        </div>


                        {/* PASSWORD */}

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
                                minLength={6}
                                required
                            />

                        </div>


                        {/* PHONE */}

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
                                required
                            />

                        </div>


                        {/* TRANSPORTER DETAILS */}

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
                                        required
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
                                        required
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
                                        value={
                                            form.truck_capacity_kg
                                        }
                                        onChange={handleChange}
                                        required
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
                                        required
                                    />

                                </div>


                                {/* MILEAGE WARNING */}

                                <div className="truck-warning">

                                    <span>⚠️</span>

                                    <p>
                                        Please enter realistic mileage.
                                        Heavy trucks typically get
                                        3–4 km/L. We verify this against
                                        your trip history.
                                    </p>

                                </div>

                            </div>

                        )}


                        {/* SUBMIT */}

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
                                <span>→</span>
                            )}

                        </button>

                    </form>


                    {/* LOGIN */}

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