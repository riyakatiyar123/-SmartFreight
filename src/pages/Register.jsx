// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'shipper',
        phone: ''
    })

    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const response = await api.post('/auth/register', form)

            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))

            navigate('/dashboard')

        } catch (err) {
    console.log('FULL ERROR:', err)
    console.log('STATUS:', err.response?.status)
    console.log('DATA:', err.response?.data)
    console.log('MESSAGE:', err.message)

    setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed'
    )
}
    }

    return (
        <div style={{
            maxWidth: '400px',
            margin: '50px auto',
            padding: '20px'
        }}>

            <h1>SmartFreight</h1>
            <h2>Create Account</h2>

            {error && (
                <p style={{ color: 'red' }}>
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>

                    <input
                        name='name'
                        value={form.name}
                        onChange={handleChange}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px',
                            marginBottom: '10px'
                        }}
                    />
                </div>

                <div>
                    <label>Email</label>

                    <input
                        name='email'
                        type='email'
                        value={form.email}
                        onChange={handleChange}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px',
                            marginBottom: '10px'
                        }}
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        name='password'
                        type='password'
                        value={form.password}
                        onChange={handleChange}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px',
                            marginBottom: '10px'
                        }}
                    />
                </div>

                <div>
                    <label>Phone</label>

                    <input
                        name='phone'
                        value={form.phone}
                        onChange={handleChange}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px',
                            marginBottom: '10px'
                        }}
                    />
                </div>

                <div>
                    <label>I am a</label>

                    <select
                        name='role'
                        value={form.role}
                        onChange={handleChange}
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '8px',
                            marginBottom: '10px'
                        }}
                    >
                        <option value='shipper'>
                            Shipper — I need to send goods
                        </option>

                        <option value='transporter'>
                            Transporter — I have a truck
                        </option>
                    </select>
                </div>

                <button
                    type='submit'
                    style={{
                        width: '100%',
                        padding: '10px'
                    }}
                >
                    Create Account
                </button>

            </form>

            <p>
                Already registered? <Link to='/'>Login here</Link>
            </p>

        </div>
    )
}

export default Register