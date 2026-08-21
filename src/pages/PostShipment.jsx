import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'
import "../styles/PostShipment.css"

const PostShipment = () => {
    const [form, setForm] = useState({
        from_city: '',
        to_city: '',
        weight_kg: '',
        amount: '',
        goods_type: '',
        notes: '',
        pickup_date: '',
        delivery_by: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        setError('')
        setIsLoading(true)

        try {
            await api.post('/shipments', {
                ...form,
                weight_kg: parseInt(form.weight_kg),
                amount: parseInt(form.amount)
            })

            navigate('/dashboard')

        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Failed to post shipment'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="post-shipment-page">

            <Navbar />

            <div className="post-shipment-container">

                {/* Header */}
                <div className="form-header">
                    <h1>Post a Shipment</h1>

                    <p>
                        Fill in your shipment details. Transporters
                        will bid on it.
                    </p>
                </div>


                {/* Error */}
                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}


                {/* Form */}
                <form
                    className="shipment-form"
                    onSubmit={handleSubmit}
                >

                    {/* Pickup + Delivery */}
                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Pickup City *
                            </label>

                            <input
                                name="from_city"
                                type="text"
                                placeholder="e.g. Kanpur"
                                value={form.from_city}
                                onChange={handleChange}
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Delivery City *
                            </label>

                            <input
                                name="to_city"
                                type="text"
                                placeholder="e.g. Gurgaon"
                                value={form.to_city}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>


                    {/* Weight + Budget */}
                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Weight (kg) *
                            </label>

                            <input
                                name="weight_kg"
                                type="number"
                                placeholder="e.g. 500"
                                value={form.weight_kg}
                                onChange={handleChange}
                                min="1"
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Your Budget (₹) *
                            </label>

                            <input
                                name="amount"
                                type="number"
                                placeholder="e.g. 25000"
                                value={form.amount}
                                onChange={handleChange}
                                min="1"
                                required
                            />

                        </div>

                    </div>


                    {/* Goods Type */}
                    <div className="form-group">

                        <label>
                            Type of Goods
                        </label>

                        <select
                            name="goods_type"
                            value={form.goods_type}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select type...
                            </option>

                            <option value="General">
                                General
                            </option>

                            <option value="Food & Beverages">
                                Food & Beverages
                            </option>

                            <option value="Electronics">
                                Electronics
                            </option>

                            <option value="Fragile">
                                Fragile
                            </option>

                            <option value="Perishable">
                                Perishable
                            </option>

                            <option value="Chemicals">
                                Chemicals
                            </option>

                            <option value="Machinery">
                                Machinery
                            </option>

                        </select>

                    </div>


                    {/* Dates */}
                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Pickup Date
                            </label>

                            <input
                                name="pickup_date"
                                type="date"
                                value={form.pickup_date}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Deliver By
                            </label>

                            <input
                                name="delivery_by"
                                type="date"
                                value={form.delivery_by}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    {/* Notes */}
                    <div className="form-group">

                        <label>
                            Special Notes
                        </label>

                        <textarea
                            name="notes"
                            placeholder="e.g. Handle with care, keep refrigerated..."
                            value={form.notes}
                            onChange={handleChange}
                            rows="4"
                        />

                    </div>


                    {/* Submit */}
                    <button
                        type="submit"
                        className="create-shipment-btn"
                        disabled={isLoading}
                    >

                        {isLoading
                            ? 'Posting...'
                            : 'Post Shipment'
                        }

                    </button>

                </form>

            </div>

        </div>
    )
}

export default PostShipment