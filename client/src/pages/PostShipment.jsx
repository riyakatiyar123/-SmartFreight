import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Navbar from '../components/Navbar'

const PostShipment = () => {

    const [form, setForm] = useState({
        from_city: '',
        to_city: '',
        pickup_address: '',
        delivery_address: '',
        weight_kg: '',
        amount: '',
        goods_type: '',
        vehicle_type: '',
        num_packages: '',
        description: '',
        notes: '',
        pickup_date: '',
        pickup_time: '',
        delivery_by: '',
        special_handling: []
    })

    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    // ========================================
    // SPECIAL HANDLING OPTIONS
    // ========================================

    const handlingOptions = [
        'Fragile',
        'Temperature controlled',
        'Hazardous',
        'Keep dry',
        'Handle with care',
        'Do not stack'
    ]

    // ========================================
    // VEHICLE / TRUCK TYPE OPTIONS
    // ========================================

    const vehicleOptions = [
        'Open Body Truck (14ft / 19ft / 22ft)',
        'Closed Container (20ft / 32ft SXL/MXL)',
        'Trailer / Flatbed',
        'LCV / Mini Truck (Tata Ace / Bolero Pickup)',
        'Any Suitable Truck'
    ]

    // ========================================
    // GET TODAY'S DATE
    // ========================================

    const getTodayDate = () => {

        const today = new Date()

        const year = today.getFullYear()

        const month = String(
            today.getMonth() + 1
        ).padStart(2, '0')

        const day = String(
            today.getDate()
        ).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    // ========================================
    // HANDLE INPUT CHANGE
    // ========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target

        const numericFields = [
            'weight_kg',
            'amount',
            'num_packages'
        ]

        // Prevent negative numbers
        if (
            numericFields.includes(name) &&
            value !== '' &&
            Number(value) < 0
        ) {
            return
        }

        setForm(previous => ({
            ...previous,
            [name]: value
        }))

        // ====================================
        // DELIVERY DATE VALIDATION
        // ====================================

        if (
            name === 'delivery_by' &&
            value &&
            form.pickup_date &&
            value < form.pickup_date
        ) {

            setError(
                'Delivery date cannot be before the pickup date.'
            )

            return
        }

        if (
            name === 'pickup_date' &&
            value &&
            form.delivery_by &&
            form.delivery_by < value
        ) {

            setError(
                'Delivery date cannot be before the pickup date.'
            )

            return
        }

        // Clear previous error when
        // user starts correcting the form
        if (error) {
            setError('')
        }
    }

    // ========================================
    // DELIVERY DATE ERROR
    // ========================================

    const deliveryDateInvalid =
        Boolean(
            form.pickup_date &&
            form.delivery_by &&
            form.delivery_by < form.pickup_date
        )

    // ========================================
    // SPECIAL HANDLING
    // ========================================

    const handleHandling = (option) => {

        const current =
            form.special_handling

        if (current.includes(option)) {

            setForm(previous => ({
                ...previous,

                special_handling:
                    current.filter(
                        item => item !== option
                    )
            }))

        } else {

            setForm(previous => ({
                ...previous,

                special_handling: [
                    ...current,
                    option
                ]
            }))
        }
    }

    // ========================================
    // FORM VALIDATION
    // ========================================

    const validateForm = () => {

        // Pickup city
        if (!form.from_city.trim()) {
            return 'Please enter the pickup city.'
        }

        // Delivery city
        if (!form.to_city.trim()) {
            return 'Please enter the delivery city.'
        }

        // Pickup address
        if (!form.pickup_address.trim()) {
            return 'Please enter the pickup address.'
        }

        // Delivery address
        if (!form.delivery_address.trim()) {
            return 'Please enter the delivery address.'
        }

        // Goods type
        if (!form.goods_type) {
            return 'Please select a goods type.'
        }

        // Preferred vehicle
        if (!form.vehicle_type) {
            return 'Please select a preferred vehicle / truck type.'
        }

        // Weight
        const weight =
            Number(form.weight_kg)

        if (
            !Number.isFinite(weight) ||
            weight <= 0
        ) {
            return 'Weight must be greater than 0 kg.'
        }

        // Packages
        if (form.num_packages !== '') {

            const packages =
                Number(form.num_packages)

            if (
                !Number.isInteger(packages) ||
                packages <= 0
            ) {
                return 'Number of packages must be greater than 0.'
            }
        }

        // Budget
        const amount =
            Number(form.amount)

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return 'Maximum budget must be greater than 0.'
        }

        // Pickup date
        if (!form.pickup_date) {
            return 'Please select a pickup date.'
        }

        // Pickup date cannot be past
        if (
            form.pickup_date < getTodayDate()
        ) {
            return 'Pickup date cannot be in the past.'
        }

        // Delivery date
        if (!form.delivery_by) {
            return 'Please select a delivery date.'
        }

        // Delivery cannot be before pickup
        if (
            form.delivery_by < form.pickup_date
        ) {
            return 'Delivery date cannot be before the pickup date.'
        }

        // Pickup time
        if (!form.pickup_time) {
            return 'Please select a pickup time.'
        }

        return null
    }

    // ========================================
    // SUBMIT FORM
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        console.log(
            '🚀 POST SHIPMENT BUTTON CLICKED'
        )

        setError('')

        // ====================================
        // VALIDATE FORM
        // ====================================

        const validationError =
            validateForm()

        console.log(
            'Validation result:',
            validationError
        )

        if (validationError) {

            setError(
                validationError
            )

            // Scroll to top so the user
            // immediately sees the error
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            })

            return
        }

        setIsLoading(true)

        // ====================================
        // PREPARE DATA
        // ====================================

        const shipmentData = {

            ...form,

            weight_kg:
                Number(form.weight_kg),

            amount:
                Number(form.amount),

            num_packages:
                form.num_packages
                    ? Number(form.num_packages)
                    : null
        }

        console.log(
            '📦 Sending shipment data:',
            shipmentData
        )

        // ====================================
        // POST TO BACKEND
        // ====================================

        try {

            const response =
                await api.post(
                    '/shipments',
                    shipmentData
                )

            console.log(
                '✅ Shipment created:',
                response.data
            )

            // Success
            navigate('/dashboard')

        } catch (err) {

            console.error(
                '❌ POST SHIPMENT ERROR:',
                err
            )

            console.error(
                'Response:',
                err.response?.data
            )

            console.error(
                'Status:',
                err.response?.status
            )

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                'Failed to post shipment.'
            )

            // Scroll to error
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            })

        } finally {

            setIsLoading(false)
        }
    }

    // ========================================
    // STYLES
    // ========================================

    const inputStyle = {

        display: 'block',

        width: '100%',

        padding: '10px 12px',

        marginBottom: '16px',

        border: '1px solid #e2e8f0',

        borderRadius: '8px',

        fontSize: '15px',

        boxSizing: 'border-box',

        background: '#ffffff',

        color: '#111827',

        outline: 'none'
    }

    const labelStyle = {

        display: 'block',

        marginBottom: '6px',

        fontWeight: '600',

        fontSize: '14px',

        color: '#374151'
    }

    const sectionStyle = {

        background: '#f8fafc',

        border: '1px solid #e2e8f0',

        borderRadius: '12px',

        padding: '20px',

        marginBottom: '20px'
    }

    // ========================================
    // RENDER
    // ========================================

    return (

        <div
            style={{
                background: '#f8fafc',
                minHeight: '100vh'
            }}
        >

            <Navbar />

            <div
                style={{
                    maxWidth: '680px',
                    margin: '0 auto',
                    padding: '30px 20px'
                }}
            >

                {/* ========================================
                    PAGE HEADER
                ======================================== */}

                <h1
                    style={{
                        margin: '0 0 4px',
                        color: '#202521'
                    }}
                >
                    Post a Shipment
                </h1>

                <p
                    style={{
                        color: '#64748b',
                        margin: '0 0 24px'
                    }}
                >
                    Fill in the details. Transporters will place competitive bids.
                </p>

                {/* ========================================
                    ERROR MESSAGE
                ======================================== */}

                {error && (

                    <div
                        role="alert"
                        style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fca5a5',
                            padding: '13px 16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >

                        <span
                            style={{
                                color: '#dc2626',
                                fontSize: '16px'
                            }}
                        >
                            ⚠️
                        </span>

                        <span
                            style={{
                                color: '#dc2626'
                            }}
                        >
                            {error}
                        </span>

                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    noValidate
                >

                    {/* ========================================
                        ROUTE DETAILS
                    ======================================== */}

                    <div style={sectionStyle}>

                        <p
                            style={{
                                margin: '0 0 16px',
                                fontWeight: '700',
                                fontSize: '15px',
                                color: '#202521'
                            }}
                        >
                            📍 Route Details
                        </p>

                        {/* CITIES */}

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px'
                            }}
                        >

                            <div>

                                <label style={labelStyle}>
                                    Pickup City *
                                </label>

                                <input
                                    name="from_city"
                                    placeholder="Kanpur"
                                    value={form.from_city}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />

                            </div>

                            <div>

                                <label style={labelStyle}>
                                    Delivery City *
                                </label>

                                <input
                                    name="to_city"
                                    placeholder="Jaipur"
                                    value={form.to_city}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />

                            </div>

                        </div>

                        {/* PICKUP ADDRESS */}

                        <label style={labelStyle}>
                            Pickup Full Address *
                        </label>

                        <input
                            name="pickup_address"
                            placeholder="Plot 12, Industrial Area, Kanpur - 208001"
                            value={form.pickup_address}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        {/* DELIVERY ADDRESS */}

                        <label style={labelStyle}>
                            Delivery Full Address *
                        </label>

                        <input
                            name="delivery_address"
                            placeholder="Sector 18, Jaipur - 302001"
                            value={form.delivery_address}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        {/* DATE + TIME */}

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr 1fr',
                                gap: '12px'
                            }}
                        >

                            {/* PICKUP DATE */}

                            <div>

                                <label style={labelStyle}>
                                    Pickup Date *
                                </label>

                                <input
                                    name="pickup_date"
                                    type="date"
                                    value={form.pickup_date}
                                    onChange={handleChange}
                                    min={getTodayDate()}
                                    style={inputStyle}
                                />

                            </div>

                            {/* PICKUP TIME */}

                            <div>

                                <label style={labelStyle}>
                                    Pickup Time *
                                </label>

                                <input
                                    name="pickup_time"
                                    type="time"
                                    value={form.pickup_time}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />

                            </div>

                            {/* DELIVERY DATE */}

                            <div>

                                <label style={labelStyle}>
                                    Deliver By *
                                </label>

                                <input
                                    name="delivery_by"
                                    type="date"
                                    value={form.delivery_by}
                                    onChange={handleChange}
                                    min={
                                        form.pickup_date ||
                                        getTodayDate()
                                    }
                                    style={{
                                        ...inputStyle,

                                        border:
                                            deliveryDateInvalid
                                                ? '1px solid #dc2626'
                                                : '1px solid #e2e8f0',

                                        background:
                                            deliveryDateInvalid
                                                ? '#fef2f2'
                                                : '#ffffff'
                                    }}
                                />

                                {deliveryDateInvalid && (

                                    <p
                                        style={{
                                            color: '#dc2626',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            margin: '-10px 0 16px'
                                        }}
                                    >
                                        Delivery date cannot be before pickup date.
                                    </p>

                                )}

                            </div>

                        </div>

                    </div>

                    {/* ========================================
                        CARGO INFORMATION
                    ======================================== */}

                    <div style={sectionStyle}>

                        <p
                            style={{
                                margin: '0 0 16px',
                                fontWeight: '700',
                                fontSize: '15px',
                                color: '#202521'
                            }}
                        >
                            📦 Cargo Information
                        </p>

                        {/* GOODS + VEHICLE TYPE */}

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px'
                            }}
                        >

                            {/* GOODS TYPE */}

                            <div>

                                <label style={labelStyle}>
                                    Goods Type *
                                </label>

                                <select
                                    name="goods_type"
                                    value={form.goods_type}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >

                                    <option value="">
                                        Select type...
                                    </option>

                                    <option>
                                        Electronics
                                    </option>

                                    <option>
                                        Food & Beverages
                                    </option>

                                    <option>
                                        Textiles & Garments
                                    </option>

                                    <option>
                                        Machinery & Equipment
                                    </option>

                                    <option>
                                        Chemicals
                                    </option>

                                    <option>
                                        Pharmaceuticals
                                    </option>

                                    <option>
                                        Furniture
                                    </option>

                                    <option>
                                        Construction Materials
                                    </option>

                                    <option>
                                        General Goods
                                    </option>

                                    <option>
                                        Other
                                    </option>

                                </select>

                            </div>

                            {/* PREFERRED VEHICLE */}

                            <div>

                                <label style={labelStyle}>
                                    Preferred Vehicle / Truck Type *
                                </label>

                                <select
                                    name="vehicle_type"
                                    value={form.vehicle_type}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >

                                    <option value="">
                                        Select vehicle type...
                                    </option>

                                    {vehicleOptions.map(
                                        option => (
                                            <option
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                        {/* WEIGHT + PACKAGES */}

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px'
                            }}
                        >

                            {/* WEIGHT */}

                            <div>

                                <label style={labelStyle}>
                                    Weight (kg) *
                                </label>

                                <input
                                    name="weight_kg"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="8000"
                                    value={form.weight_kg}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />

                            </div>

                            {/* PACKAGES */}

                            <div>

                                <label style={labelStyle}>
                                    Number of Packages
                                </label>

                                <input
                                    name="num_packages"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="120"
                                    value={form.num_packages}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />

                            </div>

                        </div>

                        {/* DESCRIPTION */}

                        <label style={labelStyle}>
                            Description
                        </label>

                        <textarea
                            name="description"
                            placeholder="Electronic components, fragile items..."
                            value={form.description}
                            onChange={handleChange}
                            rows={2}
                            style={{
                                ...inputStyle,
                                resize: 'vertical'
                            }}
                        />

                        {/* SPECIAL HANDLING */}

                        <label style={labelStyle}>
                            Special Handling Requirements
                        </label>

                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '8px',
                                marginBottom: '16px'
                            }}
                        >

                            {handlingOptions.map(option => {

                                const selected =
                                    form.special_handling.includes(
                                        option
                                    )

                                return (

                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() =>
                                            handleHandling(option)
                                        }
                                        style={{
                                            padding: '6px 14px',

                                            border:
                                                `2px solid ${
                                                    selected
                                                        ? '#4f704f'
                                                        : '#e2e8f0'
                                                }`,

                                            borderRadius: '20px',

                                            cursor: 'pointer',

                                            fontSize: '13px',

                                            fontWeight: '500',

                                            background:
                                                selected
                                                    ? '#edf3ed'
                                                    : '#ffffff',

                                            color:
                                                selected
                                                    ? '#4f704f'
                                                    : '#374151'
                                        }}
                                    >

                                        {selected ? '✓ ' : ''}

                                        {option}

                                    </button>
                                )
                            })}

                        </div>

                    </div>

                    {/* ========================================
                        BUDGET & NOTES
                    ======================================== */}

                    <div style={sectionStyle}>

                        <p
                            style={{
                                margin: '0 0 16px',
                                fontWeight: '700',
                                fontSize: '15px',
                                color: '#202521'
                            }}
                        >
                            💰 Budget & Notes
                        </p>

                        <label style={labelStyle}>
                            Maximum Budget (₹) *
                        </label>

                        <input
                            name="amount"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="25000"
                            value={form.amount}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        <p
                            style={{
                                margin: '-10px 0 16px',
                                fontSize: '12px',
                                color: '#64748b'
                            }}
                        >
                            Transporters will bid at or below this amount.
                        </p>

                        <label style={labelStyle}>
                            Special Instructions for Transporter
                        </label>

                        <textarea
                            name="notes"
                            placeholder="Keep refrigerated, do not stack, contact before arrival..."
                            value={form.notes}
                            onChange={handleChange}
                            rows={3}
                            style={{
                                ...inputStyle,
                                resize: 'vertical'
                            }}
                        />

                    </div>

                    {/* ========================================
                        SUBMIT BUTTON
                    ======================================== */}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '16px',

                            background:
                                isLoading
                                    ? '#94a3b8'
                                    : '#4f704f',

                            color: '#ffffff',

                            border: 'none',

                            borderRadius: '10px',

                            fontSize: '16px',

                            fontWeight: '700',

                            cursor:
                                isLoading
                                    ? 'not-allowed'
                                    : 'pointer',

                            transition:
                                'background 0.2s ease'
                        }}

                        onMouseEnter={e => {

                            if (!isLoading) {

                                e.currentTarget.style.background =
                                    '#3f5d40'
                            }
                        }}

                        onMouseLeave={e => {

                            if (!isLoading) {

                                e.currentTarget.style.background =
                                    '#4f704f'
                            }
                        }}
                    >

                        {isLoading
                            ? 'Posting shipment...'
                            : 'Post Shipment →'
                        }

                    </button>

                </form>

            </div>

        </div>
    )
}

export default PostShipment