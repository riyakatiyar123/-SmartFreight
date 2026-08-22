

const BidCard = ({
    bid,
    isShipper,
    onAccept,
    estimatedCost,
    currentUserId,
    onWithdraw
}) => {

    const statusColors = {
        pending: '#d97706',
        accepted: '#16a34a',
        rejected: '#6b7280',
        withdrawn: '#6b7280'
    }


    const profit =
        estimatedCost
            ? bid.amount - estimatedCost
            : null


    const margin =
        profit
            ? ((profit / bid.amount) * 100).toFixed(1)
            : null


    // ========================================
    // CHECK IF THIS BID BELONGS TO USER
    // ========================================

    const isMyBid =
        currentUserId &&
        String(bid.transporter_id) ===
        String(currentUserId)


    // ========================================
    // WITHDRAW BID
    // ========================================

    const handleWithdraw = async () => {

        if (!onWithdraw) {
            return
        }

        onWithdraw(bid.id)
    }


    return (

        <div
            style={{
                border:
                    `1px solid ${
                        bid.status === 'accepted'
                            ? '#86efac'
                            : '#e2e8f0'
                    }`,

                borderRadius: '12px',

                padding: '16px',

                marginBottom: '12px',

                background:
                    bid.status === 'accepted'
                        ? '#f0fdf4'
                        : 'white'
            }}
        >

            {/* ========================================
                TOP SECTION
            ======================================== */}

            <div
                style={{
                    display: 'flex',

                    justifyContent:
                        'space-between',

                    alignItems:
                        'flex-start'
                }}
            >

                {/* ========================================
                    TRANSPORTER INFORMATION
                ======================================== */}

                <div
                    style={{
                        flex: 1
                    }}
                >

                    <div
                        style={{
                            display: 'flex',

                            alignItems:
                                'center',

                            gap: '8px',

                            marginBottom:
                                '4px'
                        }}
                    >

                        <h3
                            style={{
                                margin: 0,

                                fontSize:
                                    '16px'
                            }}
                        >
                            {bid.transporter_name}
                        </h3>


                        {/* RATING */}

                        {bid.rating > 0 && (

                            <span
                                style={{
                                    background:
                                        '#fef3c7',

                                    color:
                                        '#d97706',

                                    padding:
                                        '2px 8px',

                                    borderRadius:
                                        '20px',

                                    fontSize:
                                        '12px',

                                    fontWeight:
                                        '600'
                                }}
                            >
                                ⭐ {Number(
                                    bid.rating
                                ).toFixed(1)}
                            </span>

                        )}


                        {/* STATUS */}

                        <span
                            style={{
                                background:
                                    `${statusColors[
                                        bid.status
                                    ] || '#6b7280'}20`,

                                color:
                                    statusColors[
                                        bid.status
                                    ] || '#6b7280',

                                padding:
                                    '2px 8px',

                                borderRadius:
                                    '20px',

                                fontSize:
                                    '11px',

                                fontWeight:
                                    '600',

                                textTransform:
                                    'uppercase'
                            }}
                        >
                            {bid.status}
                        </span>

                    </div>


                    {/* ========================================
                        TRANSPORTER STATS
                    ======================================== */}

                    <div
                        style={{
                            display:
                                'flex',

                            gap:
                                '16px',

                            marginBottom:
                                '6px',

                            flexWrap:
                                'wrap'
                        }}
                    >

                        {bid.total_trips > 0 && (

                            <span
                                style={{
                                    fontSize:
                                        '13px',

                                    color:
                                        '#666'
                                }}
                            >
                                ✅ {bid.total_trips} trips
                            </span>

                        )}


                        {bid.on_time_deliveries > 0 &&
                            bid.total_trips > 0 && (

                            <span
                                style={{
                                    fontSize:
                                        '13px',

                                    color:
                                        '#666'
                                }}
                            >
                                🕐 {
                                    Math.round(
                                        (
                                            bid.on_time_deliveries /
                                            bid.total_trips
                                        ) * 100
                                    )
                                }% on-time
                            </span>

                        )}


                        {bid.truck_type && (

                            <span
                                style={{
                                    fontSize:
                                        '13px',

                                    color:
                                        '#666'
                                }}
                            >
                                🚛 {bid.truck_type}
                            </span>

                        )}

                    </div>


                    {/* NOTE */}

                    {bid.note && (

                        <p
                            style={{
                                margin:
                                    0,

                                color:
                                    '#666',

                                fontSize:
                                    '13px',

                                fontStyle:
                                    'italic'
                            }}
                        >
                            "{bid.note}"
                        </p>

                    )}

                </div>


                {/* ========================================
                    PRICE
                ======================================== */}

                <div
                    style={{
                        textAlign:
                            'right',

                        marginLeft:
                            '16px'
                    }}
                >

                    <p
                        style={{
                            margin:
                                '0 0 2px',

                            fontSize:
                                '24px',

                            fontWeight:
                                '800',

                            color:
                                '#1e293b'
                        }}
                    >
                        ₹{Number(
                            bid.amount
                        ).toLocaleString('en-IN')}
                    </p>


                    {profit !== null && (

                        <p
                            style={{
                                margin:
                                    0,

                                fontSize:
                                    '12px',

                                color:
                                    '#16a34a'
                            }}
                        >
                            Profit: ₹{
                                profit.toLocaleString(
                                    'en-IN'
                                )
                            } ({margin}%)
                        </p>

                    )}


                    <p
                        style={{
                            margin:
                                '2px 0 0',

                            fontSize:
                                '12px',

                            color:
                                '#666'
                        }}
                    >
                        {
                            new Date(
                                bid.created_at
                            ).toLocaleTimeString(
                                'en-IN',
                                {
                                    hour:
                                        '2-digit',

                                    minute:
                                        '2-digit'
                                }
                            )
                        }
                    </p>

                </div>

            </div>


            {/* ========================================
                SHIPPER → ACCEPT BID
            ======================================== */}

            {isShipper &&
                bid.status === 'pending' && (

                <button
                    type="button"
                    onClick={() =>
                        onAccept(bid.id)
                    }
                    style={{
                        marginTop:
                            '12px',

                        width:
                            '100%',

                        padding:
                            '10px',

                        background:
                            '#4f704f',

                        color:
                            'white',

                        border:
                            'none',

                        borderRadius:
                            '8px',

                        cursor:
                            'pointer',

                        fontWeight:
                            '600',

                        fontSize:
                            '14px'
                    }}
                >
                    ✓ Accept This Bid
                </button>

            )}


            {/* ========================================
                TRANSPORTER → WITHDRAW BID
            ======================================== */}

            {!isShipper &&
                isMyBid &&
                bid.status === 'pending' && (

                <button
                    type="button"
                    onClick={handleWithdraw}
                    style={{
                        marginTop:
                            '12px',

                        width:
                            '100%',

                        padding:
                            '10px',

                        background:
                            '#ffffff',

                        color:
                            '#b91c1c',

                        border:
                            '1px solid #fecaca',

                        borderRadius:
                            '8px',

                        cursor:
                            'pointer',

                        fontWeight:
                            '600',

                        fontSize:
                            '14px',

                        transition:
                            'all 0.2s ease'
                    }}

                    onMouseEnter={
                        e => {

                            e.currentTarget.style.background =
                                '#fef2f2'

                        }
                    }

                    onMouseLeave={
                        e => {

                            e.currentTarget.style.background =
                                '#ffffff'

                        }
                    }
                >
                    ↩ Withdraw Bid
                </button>

            )}

        </div>
    )
}


export default BidCard