import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import api from '../utils/api'
import Navbar from '../components/Navbar'


const CompleteDelivery = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    // ========================================
    // USER
    // ========================================

    const user = JSON.parse(
        localStorage.getItem('user')
    )

    // ========================================
    // FORM STATE
    // ========================================

    const [condition, setCondition] =
        useState('')

    const [conditionNote, setConditionNote] =
        useState('')

    const [rating, setRating] =
        useState(0)

    const [comment, setComment] =
        useState('')

    const [isLoading, setIsLoading] =
        useState(false)

    const [error, setError] =
        useState('')


    // ========================================
    // DELIVERY CONDITIONS
    // ========================================

    const conditions = [

        {
            value: 'good',
            label: '✅ No issue',
            desc: 'Goods received in perfect condition'
        },

        {
            value: 'damaged',
            label: '⚠️ Damaged',
            desc: 'Some goods were damaged'
        },

        {
            value: 'missing',
            label: '❌ Missing items',
            desc: 'Some packages are missing'
        },

        {
            value: 'other',
            label: '📝 Other issue',
            desc: 'Something else happened'
        }

    ]


    // ========================================
    // SUBMIT DELIVERY
    // ========================================

    const handleSubmit = async (e) => {

        e.preventDefault()

        setError('')


        // --------------------------------
        // Check condition
        // --------------------------------

        if (!condition) {

            setError(
                'Please select the delivery condition'
            )

            return
        }


        // --------------------------------
        // Check rating
        // --------------------------------

        if (rating === 0) {

            setError(
                'Please rate the transporter'
            )

            return
        }


        setIsLoading(true)


        try {

            // --------------------------------
            // Send confirmation to backend
            // --------------------------------

            await api.post(
                `/shipments/${id}/complete`,
                {
                    delivery_condition:
                        condition,

                    delivery_notes:
                        conditionNote,

                    rating:
                        rating,

                    comment:
                        comment
                }
            )


            // --------------------------------
            // Go back to dashboard
            // --------------------------------

            navigate('/dashboard')


        } catch (err) {

            console.error(
                'Complete delivery error:',
                err
            )

            setError(
                err.response?.data?.error ||
                'Failed to complete delivery'
            )

        } finally {

            setIsLoading(false)

        }

    }


    // ========================================
    // PAGE
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
                    maxWidth: '550px',
                    margin: '0 auto',
                    padding: '30px 20px'
                }}
            >

                {/* =================================
                    HEADER
                ================================= */}

                <div
                    style={{
                        marginBottom: '24px'
                    }}
                >

                    <button
                        onClick={() =>
                            navigate(`/shipments/${id}`)
                        }
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#475569',
                            fontSize: '14px',
                            padding: 0,
                            marginBottom: '16px'
                        }}
                    >
                        ← Back to Shipment
                    </button>


                    <h1
                        style={{
                            margin: '0 0 6px',
                            fontSize: '28px'
                        }}
                    >
                        Confirm Delivery
                    </h1>


                    <p
                        style={{
                            color: '#64748b',
                            margin: 0
                        }}
                    >
                        Confirm that the goods have been
                        received and rate the transporter.
                    </p>

                </div>


                {/* =================================
                    ERROR
                ================================= */}

                {error && (

                    <div
                        style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: '14px',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            fontSize: '14px'
                        }}
                    >

                        ⚠️ {error}

                    </div>

                )}


                <form
                    onSubmit={handleSubmit}
                >


                    {/* =================================
                        DELIVERY CONDITION
                    ================================= */}

                    <div
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}
                    >

                        <h2
                            style={{
                                margin: '0 0 6px',
                                fontSize: '18px'
                            }}
                        >
                            Delivery Condition
                        </h2>


                        <p
                            style={{
                                color: '#64748b',
                                fontSize: '13px',
                                margin: '0 0 16px'
                            }}
                        >
                            How did the goods arrive?
                        </p>


                        {conditions.map(
                            (item) => (

                                <div
                                    key={item.value}
                                    onClick={() =>
                                        setCondition(
                                            item.value
                                        )
                                    }
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',

                                        padding: '14px',

                                        border:
                                            condition ===
                                            item.value
                                                ? '2px solid #2563eb'
                                                : '1px solid #e2e8f0',

                                        borderRadius: '10px',

                                        marginBottom: '10px',

                                        cursor: 'pointer',

                                        background:
                                            condition ===
                                            item.value
                                                ? '#eff6ff'
                                                : 'white'
                                    }}
                                >

                                    {/* Radio circle */}

                                    <div
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',

                                            border:
                                                condition ===
                                                item.value
                                                    ? '5px solid #2563eb'
                                                    : '2px solid #94a3b8',

                                            background: 'white',

                                            flexShrink: 0
                                        }}
                                    />


                                    <div>

                                        <p
                                            style={{
                                                margin: 0,
                                                fontWeight: '700',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {item.label}
                                        </p>


                                        <p
                                            style={{
                                                margin: '3px 0 0',
                                                fontSize: '12px',
                                                color: '#64748b'
                                            }}
                                        >
                                            {item.desc}
                                        </p>

                                    </div>

                                </div>

                            )
                        )}


                        {/* =================================
                            ISSUE DESCRIPTION
                        ================================= */}

                        {condition &&
                            condition !== 'good' && (

                                <div
                                    style={{
                                        marginTop: '12px'
                                    }}
                                >

                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        Describe the issue
                                    </label>


                                    <textarea
                                        placeholder="Please describe what happened..."
                                        value={
                                            conditionNote
                                        }
                                        onChange={(e) =>
                                            setConditionNote(
                                                e.target.value
                                            )
                                        }
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            resize: 'vertical'
                                        }}
                                    />

                                </div>

                            )}

                    </div>


                    {/* =================================
                        RATING
                    ================================= */}

                    <div
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}
                    >

                        <h2
                            style={{
                                margin: '0 0 6px',
                                fontSize: '18px'
                            }}
                        >
                            Rate the Transporter
                        </h2>


                        <p
                            style={{
                                color: '#64748b',
                                fontSize: '13px',
                                margin: '0 0 18px'
                            }}
                        >
                            How was your delivery experience?
                        </p>


                        {/* Stars */}

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '8px',
                                marginBottom: '12px'
                            }}
                        >

                            {[1, 2, 3, 4, 5].map(
                                (star) => (

                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() =>
                                            setRating(star)
                                        }
                                        style={{
                                            background:
                                                'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '38px',
                                            opacity:
                                                star <= rating
                                                    ? 1
                                                    : 0.25,
                                            padding: 0
                                        }}
                                    >
                                        ⭐
                                    </button>

                                )
                            )}

                        </div>


                        <p
                            style={{
                                textAlign: 'center',
                                color: '#64748b',
                                margin: '0 0 18px',
                                fontSize: '14px'
                            }}
                        >

                            {rating === 0 &&
                                'Tap a star to rate'}

                            {rating === 1 &&
                                'Poor'}

                            {rating === 2 &&
                                'Below Average'}

                            {rating === 3 &&
                                'Average'}

                            {rating === 4 &&
                                'Good'}

                            {rating === 5 &&
                                'Excellent!'}

                        </p>


                        {/* Comment */}

                        <textarea
                            placeholder="Write a review (optional)..."
                            value={comment}
                            onChange={(e) =>
                                setComment(
                                    e.target.value
                                )
                            }
                            rows={4}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '14px',
                                boxSizing: 'border-box',
                                resize: 'vertical'
                            }}
                        />

                    </div>


                    {/* =================================
                        CONFIRM BUTTON
                    ================================= */}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '16px',

                            background:
                                isLoading
                                    ? '#94a3b8'
                                    : '#16a34a',

                            color: 'white',

                            border: 'none',

                            borderRadius: '10px',

                            fontSize: '16px',

                            fontWeight: '700',

                            cursor:
                                isLoading
                                    ? 'not-allowed'
                                    : 'pointer'
                        }}
                    >

                        {isLoading
                            ? 'Confirming Delivery...'
                            : '✓ Confirm Delivery & Complete Trip'
                        }

                    </button>


                    {/* =================================
                        DEMO NOTE
                    ================================= */}

                    <p
                        style={{
                            textAlign: 'center',
                            color: '#94a3b8',
                            fontSize: '12px',
                            marginTop: '12px'
                        }}
                    >
                        Delivery confirmation is completed
                        by the shipper after receiving the goods.
                    </p>

                </form>

            </div>

        </div>

    )
}

export default CompleteDelivery