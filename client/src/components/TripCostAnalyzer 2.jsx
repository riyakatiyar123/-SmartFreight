import { useState } from 'react'

const TripCostAnalyzer = ({
    shipment,
    currentBids = [],
    onUseBid
}) => {

    // ========================================
    // USER
    // ========================================

    let user = null

    try {
        const raw = localStorage.getItem('user')

        user = raw
            ? JSON.parse(raw)
            : null

    } catch (err) {

        console.error(
            'Failed to read user:',
            err
        )

    }


    // ========================================
    // CITY COORDINATES
    // ========================================

    const cityCoordinates = {

        kanpur: {
            lat: 26.4499,
            lng: 80.3319
        },

        noida: {
            lat: 28.5355,
            lng: 77.3910
        },

        delhi: {
            lat: 28.6139,
            lng: 77.2090
        },

        newdelhi: {
            lat: 28.6139,
            lng: 77.2090
        },

        lucknow: {
            lat: 26.8467,
            lng: 80.9462
        },

        agra: {
            lat: 27.1767,
            lng: 78.0081
        },

        ghaziabad: {
            lat: 28.6692,
            lng: 77.4538
        },

        meerut: {
            lat: 28.9845,
            lng: 77.7064
        },

        jaipur: {
            lat: 26.9124,
            lng: 75.7873
        },

        gurugram: {
            lat: 28.4595,
            lng: 77.0266
        },

        gurgaon: {
            lat: 28.4595,
            lng: 77.0266
        },

        chandigarh: {
            lat: 30.7333,
            lng: 76.7794
        },

        varanasi: {
            lat: 25.3176,
            lng: 82.9739
        },

        prayagraj: {
            lat: 25.4358,
            lng: 81.8463
        },

        allahabad: {
            lat: 25.4358,
            lng: 81.8463
        },

        patna: {
            lat: 25.5941,
            lng: 85.1376
        },

        bhopal: {
            lat: 23.2599,
            lng: 77.4126
        },

        indore: {
            lat: 22.7196,
            lng: 75.8577
        },

        mumbai: {
            lat: 19.0760,
            lng: 72.8777
        },

        pune: {
            lat: 18.5204,
            lng: 73.8567
        },

        ahmedabad: {
            lat: 23.0225,
            lng: 72.5714
        },

        surat: {
            lat: 21.1702,
            lng: 72.8311
        },

        bengaluru: {
            lat: 12.9716,
            lng: 77.5946
        },

        bangalore: {
            lat: 12.9716,
            lng: 77.5946
        },

        hyderabad: {
            lat: 17.3850,
            lng: 78.4867
        },

        chennai: {
            lat: 13.0827,
            lng: 80.2707
        },

        kolkata: {
            lat: 22.5726,
            lng: 88.3639
        },

        nagpur: {
            lat: 21.1458,
            lng: 79.0882
        },

        nashik: {
            lat: 19.9975,
            lng: 73.7898
        },

        vadodara: {
            lat: 22.3072,
            lng: 73.1812
        },

        rajkot: {
            lat: 22.3039,
            lng: 70.8022
        },

        dehradun: {
            lat: 30.3165,
            lng: 78.0322
        },

        haridwar: {
            lat: 29.9457,
            lng: 78.1642
        },

        amritsar: {
            lat: 31.6340,
            lng: 74.8723
        },

        ludhiana: {
            lat: 30.9010,
            lng: 75.8573
        },

        jodhpur: {
            lat: 26.2389,
            lng: 73.0243
        },

        udaipur: {
            lat: 24.5854,
            lng: 73.7125
        },

        ajmer: {
            lat: 26.4499,
            lng: 74.6399
        },

        kota: {
            lat: 25.2138,
            lng: 75.8648
        }

    }


    // ========================================
    // NORMALIZE CITY
    // ========================================

    const normalizeCity = city => {

        return String(city || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '')
            .replace(/-/g, '')

    }


    // ========================================
    // CALCULATE DISTANCE
    // ========================================

    const calculateDistance = () => {

        const from =
            normalizeCity(
                shipment?.from_city
            )

        const to =
            normalizeCity(
                shipment?.to_city
            )


        const start =
            cityCoordinates[from]

        const end =
            cityCoordinates[to]


        // If both cities are known,
        // calculate actual distance.

        if (start && end) {

            const R = 6371


            const lat1 =
                start.lat *
                Math.PI /
                180


            const lat2 =
                end.lat *
                Math.PI /
                180


            const deltaLat =
                (
                    end.lat -
                    start.lat
                ) *
                Math.PI /
                180


            const deltaLng =
                (
                    end.lng -
                    start.lng
                ) *
                Math.PI /
                180


            const a =
                Math.sin(
                    deltaLat / 2
                ) ** 2 +

                Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(
                    deltaLng / 2
                ) ** 2


            const c =
                2 *
                Math.atan2(
                    Math.sqrt(a),
                    Math.sqrt(1 - a)
                )


            const straightLineDistance =
                R * c


            // Roads are usually longer
            // than straight-line distance.

            return Math.max(
                50,
                Math.round(
                    straightLineDistance *
                    1.20
                )
            )

        }


        // Safe fallback.

        return 490

    }


    const distance =
        calculateDistance()


    // ========================================
    // COST STATE
    // ========================================

    const [costs, setCosts] =
        useState({

            fuelPrice:
                96,

            mileage:
                Number(
                    user?.mileage_kmpl
                ) > 0
                    ? Number(
                        user.mileage_kmpl
                    )
                    : 4,

            driverWage:
                1000,

            tripDays:
                2,

            toll:
                800,

            loading:
                500,

            unloading:
                300,

            maintenance:
                600,

            parking:
                200,

            misc:
                200

        })


    // ========================================
    // SAFE POSITIVE NUMBER
    // ========================================

    const safePositive = value => {

        const number =
            Number(value)


        return Number.isFinite(number) &&
            number > 0
            ? number
            : 0

    }


    // ========================================
    // COST VALUES
    // ========================================

    const fuelPrice =
        safePositive(
            costs.fuelPrice
        )


    const mileage =
        safePositive(
            costs.mileage
        ) || 4


    const driverWage =
        safePositive(
            costs.driverWage
        )


    const tripDays =
        safePositive(
            costs.tripDays
        ) || 1


    const toll =
        safePositive(
            costs.toll
        )


    const loading =
        safePositive(
            costs.loading
        )


    const unloading =
        safePositive(
            costs.unloading
        )


    const maintenance =
        safePositive(
            costs.maintenance
        )


    const parking =
        safePositive(
            costs.parking
        )


    const misc =
        safePositive(
            costs.misc
        )


    // ========================================
    // COST CALCULATIONS
    // ========================================

    const fuelCost =
        Math.round(
            (
                distance /
                mileage
            ) *
            fuelPrice
        )


    const driverCost =
        Math.round(
            driverWage *
            tripDays
        )


    const totalCost =
        fuelCost +
        driverCost +
        toll +
        loading +
        unloading +
        maintenance +
        parking +
        misc


    // ========================================
    // WEIGHT
    // ========================================

    const weightKg =
        Math.max(
            0,
            Number(
                shipment?.weight_kg
            ) || 0
        )


    // ========================================
    // WEIGHT MULTIPLIER
    // ========================================

    const weightMultiplier =
        weightKg > 5000
            ? 1.15
            : weightKg > 2000
                ? 1.08
                : 1


    const adjustedCost =
        Math.round(
            totalCost *
            weightMultiplier
        )


    // ========================================
    // SHIPMENT BUDGET
    // ========================================

    const maximumBudget =
        Math.max(
            0,
            Number(
                shipment?.amount
            ) || 0
        )


    // ========================================
    // CARGO VALUE
    //
    // PostShipment uses cargo_value.
    // ========================================

    const cargoPrice =
        Math.max(
            0,
            Number(
                shipment?.cargo_value ??
                shipment?.cargo_price ??
                shipment?.goods_value ??
                0
            ) || 0
        )


    // ========================================
    // BID RECOMMENDATION
    //
    // IMPORTANT:
    // Never recommend a bid above
    // the shipper's maximum budget.
    // ========================================

    const budgetCap =
        maximumBudget > 0
            ? maximumBudget
            : Infinity


    const rawCompetitive =
        Math.round(
            adjustedCost *
            1.10
        )


    const rawRecommended =
        Math.round(
            adjustedCost *
            1.20
        )


    const rawHighProfit =
        Math.round(
            adjustedCost *
            1.35
        )


    const competitive =
        Math.max(
            100,
            Math.min(
                rawCompetitive,
                budgetCap
            )
        )


    const recommended =
        Math.max(
            100,
            Math.min(
                rawRecommended,
                budgetCap
            )
        )


    const highProfit =
        Math.max(
            100,
            Math.min(
                rawHighProfit,
                budgetCap
            )
        )


    // ========================================
    // MARKET DATA
    // ========================================

    const bidAmounts =
        Array.isArray(
            currentBids
        )
            ? currentBids
                .map(
                    bid =>
                        Number(
                            bid?.amount
                        )
                )
                .filter(
                    amount =>
                        Number.isFinite(
                            amount
                        ) &&
                        amount > 0
                )
            : []


    const lowestBid =
        bidAmounts.length > 0
            ? Math.min(
                ...bidAmounts
            )
            : null


    const avgBid =
        bidAmounts.length > 0
            ? Math.round(
                bidAmounts.reduce(
                    (
                        total,
                        amount
                    ) =>
                        total +
                        amount,
                    0
                ) /
                bidAmounts.length
            )
            : null


    // ========================================
    // WIN PROBABILITY
    //
    // More realistic calculation.
    //
    // Main factors:
    //
    // 1. Bid compared to lowest bid
    // 2. Bid compared to maximum budget
    // 3. Bid compared to operating cost
    // 4. Number of competitors
    // ========================================

    const getWinChance =
        bidAmount => {

            const bid =
                Number(
                    bidAmount
                )


            if (
                !Number.isFinite(
                    bid
                ) ||
                bid <= 0
            ) {

                return 0

            }


            // ====================================
            // BID ABOVE MAXIMUM BUDGET
            // ====================================

            if (
                maximumBudget > 0 &&
                bid > maximumBudget
            ) {

                return 5

            }


            let chance = 50


            // ====================================
            // NO COMPETITORS
            // ====================================

            if (
                lowestBid === null
            ) {

                // There are no competing bids.
                // Probability depends mainly on
                // how reasonable the bid is.

                if (
                    maximumBudget > 0
                ) {

                    const budgetRatio =
                        bid /
                        maximumBudget


                    if (
                        budgetRatio <= 0.70
                    ) {

                        chance = 90

                    } else if (
                        budgetRatio <= 0.80
                    ) {

                        chance = 86

                    } else if (
                        budgetRatio <= 0.90
                    ) {

                        chance = 80

                    } else if (
                        budgetRatio <= 1.00
                    ) {

                        chance = 72

                    } else {

                        chance = 10

                    }

                } else {

                    const costRatio =
                        bid /
                        Math.max(
                            adjustedCost,
                            1
                        )


                    if (
                        costRatio <= 1.05
                    ) {

                        chance = 88

                    } else if (
                        costRatio <= 1.15
                    ) {

                        chance = 82

                    } else if (
                        costRatio <= 1.25
                    ) {

                        chance = 74

                    } else if (
                        costRatio <= 1.35
                    ) {

                        chance = 64

                    } else {

                        chance = 50

                    }

                }

            }


            // ====================================
            // COMPETING BIDS
            // ====================================

            else {

                const difference =
                    (
                        bid -
                        lowestBid
                    ) /
                    Math.max(
                        lowestBid,
                        1
                    )


                if (
                    bid < lowestBid
                ) {

                    chance = 94

                } else if (
                    bid === lowestBid
                ) {

                    chance = 88

                } else if (
                    difference <= 0.03
                ) {

                    chance = 82

                } else if (
                    difference <= 0.05
                ) {

                    chance = 76

                } else if (
                    difference <= 0.10
                ) {

                    chance = 65

                } else if (
                    difference <= 0.15
                ) {

                    chance = 52

                } else if (
                    difference <= 0.20
                ) {

                    chance = 38

                } else {

                    chance = 22

                }

            }


            // ====================================
            // BUDGET FACTOR
            // ====================================

            if (
                maximumBudget > 0
            ) {

                const budgetRatio =
                    bid /
                    maximumBudget


                if (
                    budgetRatio <= 0.75
                ) {

                    chance += 5

                } else if (
                    budgetRatio <= 0.90
                ) {

                    chance += 2

                } else if (
                    budgetRatio > 0.98
                ) {

                    chance -= 5

                }

            }


            // ====================================
            // COST FACTOR
            // ====================================

            const costRatio =
                bid /
                Math.max(
                    adjustedCost,
                    1
                )


            // Very low bids may be
            // less attractive to the
            // transporter but could
            // still win.

            if (
                costRatio < 0.90
            ) {

                chance -= 8

            } else if (
                costRatio >= 1.10 &&
                costRatio <= 1.30
            ) {

                chance += 4

            }


            // ====================================
            // COMPETITION COUNT
            // ====================================

            if (
                bidAmounts.length >= 8
            ) {

                chance -= 8

            } else if (
                bidAmounts.length >= 5
            ) {

                chance -= 5

            } else if (
                bidAmounts.length >= 3
            ) {

                chance -= 2

            } else if (
                bidAmounts.length === 0
            ) {

                chance += 3

            }


            // ====================================
            // LIMIT
            // ========================================

            return Math.max(
                8,
                Math.min(
                    95,
                    Math.round(
                        chance
                    )
                )
            )

        }


    // ========================================
    // MILEAGE WARNING
    // ========================================

    const mileageWarning =
        mileage < 3 ||
        mileage > 6


    // ========================================
    // UPDATE COST
    // ========================================

    const updateCost =
        (
            field,
            value
        ) => {

            const number =
                Number(
                    value
                )


            setCosts(
                previous => ({

                    ...previous,

                    [field]:
                        Number.isFinite(
                            number
                        ) &&
                        number > 0
                            ? number
                            : 0

                })
            )

        }


    // ========================================
    // STYLES
    // ========================================

    const inputStyle = {

        width:
            '100%',

        padding:
            '10px 12px',

        border:
            '1px solid #cfd8d0',

        borderRadius:
            '8px',

        fontSize:
            '14px',

        boxSizing:
            'border-box',

        background:
            '#ffffff',

        color:
            '#202521',

        outline:
            'none'

    }


    const sectionStyle = {

        borderBottom:
            '1px solid #dfe4df',

        paddingBottom:
            '20px',

        marginBottom:
            '20px'

    }


    const labelStyle = {

        fontSize:
            '13px',

        color:
            '#647069',

        display:
            'block',

        marginBottom:
            '6px'

    }


    // ========================================
    // RENDER
    // ========================================

    return (

        <div
            style={{
                border:
                    '1px solid #cfd8d0',

                borderRadius:
                    '14px',

                overflow:
                    'hidden',

                background:
                    '#ffffff',

                marginBottom:
                    '28px',

                boxShadow:
                    '0 3px 12px rgba(64, 93, 66, 0.06)'
            }}
        >

            {/* ========================================
                HEADER
            ======================================== */}

            <div
                style={{
                    background:
                        '#f3f5f3',

                    borderBottom:
                        '1px solid #dfe4df',

                    padding:
                        '22px 24px',

                    textAlign:
                        'center'
                }}
            >

                <div
                    style={{
                        display:
                            'inline-flex',

                        alignItems:
                            'center',

                        gap:
                            '8px',

                        marginBottom:
                            '5px'
                    }}
                >

                    <span
                        style={{
                            width:
                                '8px',

                            height:
                                '8px',

                            borderRadius:
                                '50%',

                            background:
                                '#4f704f'
                        }}
                    />

                    <h3
                        style={{
                            margin:
                                0,

                            fontSize:
                                '17px',

                            letterSpacing:
                                '0.5px',

                            color:
                                '#202521',

                            fontWeight:
                                700
                        }}
                    >
                        Trip Cost Analyzer
                    </h3>

                </div>


                <p
                    style={{
                        margin:
                            '7px 0 0',

                        color:
                            '#647069',

                        fontSize:
                            '14px'
                    }}
                >

                    {shipment?.from_city}
                    {' → '}
                    {shipment?.to_city}

                </p>

            </div>


            <div
                style={{
                    padding:
                        '24px'
                }}
            >

                {/* ========================================
                    ROUTE SUMMARY
                ======================================== */}

                <div
                    style={{
                        ...sectionStyle,

                        display:
                            'grid',

                        gridTemplateColumns:
                            'repeat(4, 1fr)',

                        gap:
                            '12px',

                        textAlign:
                            'center'
                    }}
                >

                    <div>

                        <p
                            style={{
                                margin:
                                    0,

                                color:
                                    '#8a958d',

                                fontSize:
                                    '12px'
                            }}
                        >
                            Distance
                        </p>

                        <p
                            style={{
                                margin:
                                    '5px 0 0',

                                fontWeight:
                                    700,

                                color:
                                    '#202521',

                                fontSize:
                                    '18px'
                            }}
                        >
                            {distance} km
                        </p>

                    </div>


                    <div>

                        <p
                            style={{
                                margin:
                                    0,

                                color:
                                    '#8a958d',

                                fontSize:
                                    '12px'
                            }}
                        >
                            Cargo Weight
                        </p>

                        <p
                            style={{
                                margin:
                                    '5px 0 0',

                                fontWeight:
                                    700,

                                color:
                                    '#202521',

                                fontSize:
                                    '18px'
                            }}
                        >

                            {weightKg.toLocaleString(
                                'en-IN'
                            )}

                            {' '}kg

                        </p>

                    </div>


                    <div>

                        <p
                            style={{
                                margin:
                                    0,

                                color:
                                    '#8a958d',

                                fontSize:
                                    '12px'
                            }}
                        >
                            Cargo Value
                        </p>

                        <p
                            style={{
                                margin:
                                    '5px 0 0',

                                fontWeight:
                                    700,

                                color:
                                    '#202521',

                                fontSize:
                                    '18px'
                            }}
                        >

                            ₹
                            {cargoPrice.toLocaleString(
                                'en-IN'
                            )}

                        </p>

                    </div>


                    <div>

                        <p
                            style={{
                                margin:
                                    0,

                                color:
                                    '#8a958d',

                                fontSize:
                                    '12px'
                            }}
                        >
                            Max Budget
                        </p>

                        <p
                            style={{
                                margin:
                                    '5px 0 0',

                                fontWeight:
                                    700,

                                color:
                                    '#202521',

                                fontSize:
                                    '18px'
                            }}
                        >

                            ₹
                            {maximumBudget.toLocaleString(
                                'en-IN'
                            )}

                        </p>

                    </div>

                </div>


                {/* ========================================
                    CARGO INFORMATION
                ======================================== */}

                <div
                    style={{
                        ...sectionStyle,

                        background:
                            '#f8faf8',

                        padding:
                            '14px 16px',

                        borderRadius:
                            '10px',

                        border:
                            '1px solid #e0e8e0'
                    }}
                >

                    <p
                        style={{
                            margin:
                                '0 0 10px',

                            fontWeight:
                                700,

                            fontSize:
                                '14px',

                            color:
                                '#202521'
                        }}
                    >
                        📦 Shipment Information
                    </p>


                    <div
                        style={{
                            display:
                                'grid',

                            gridTemplateColumns:
                                '1fr 1fr',

                            gap:
                                '8px 20px',

                            fontSize:
                                '13px'
                        }}
                    >

                        <div>

                            <span
                                style={{
                                    color:
                                        '#647069'
                                }}
                            >
                                Goods Type
                            </span>

                            <strong
                                style={{
                                    display:
                                        'block',

                                    marginTop:
                                        '2px',

                                    color:
                                        '#202521'
                                }}
                            >
                                {
                                    shipment?.goods_type ||
                                    'General Goods'
                                }
                            </strong>

                        </div>


                        <div>

                            <span
                                style={{
                                    color:
                                        '#647069'
                                }}
                            >
                                Packages
                            </span>

                            <strong
                                style={{
                                    display:
                                        'block',

                                    marginTop:
                                        '2px',

                                    color:
                                        '#202521'
                                }}
                            >

                                {
                                    shipment?.num_packages
                                        ? Number(
                                            shipment.num_packages
                                        ).toLocaleString(
                                            'en-IN'
                                        )
                                        : 'Not specified'
                                }

                            </strong>

                        </div>


                        <div>

                            <span
                                style={{
                                    color:
                                        '#647069'
                                }}
                            >
                                Cargo Value
                            </span>

                            <strong
                                style={{
                                    display:
                                        'block',

                                    marginTop:
                                        '2px',

                                    color:
                                        '#202521'
                                }}
                            >

                                ₹
                                {cargoPrice.toLocaleString(
                                    'en-IN'
                                )}

                            </strong>

                        </div>


                        <div>

                            <span
                                style={{
                                    color:
                                        '#647069'
                                }}
                            >
                                Maximum Budget
                            </span>

                            <strong
                                style={{
                                    display:
                                        'block',

                                    marginTop:
                                        '2px',

                                    color:
                                        '#202521'
                                }}
                            >

                                ₹
                                {maximumBudget.toLocaleString(
                                    'en-IN'
                                )}

                            </strong>

                        </div>

                    </div>

                </div>


                {/* ========================================
                    TRUCK DETAILS
                ======================================== */}

                <div
                    style={
                        sectionStyle
                    }
                >

                    <p
                        style={{
                            margin:
                                '0 0 14px',

                            fontWeight:
                                700,

                            fontSize:
                                '15px',

                            color:
                                '#202521'
                        }}
                    >
                        🚛 Your Truck Details
                    </p>


                    <div
                        style={{
                            display:
                                'grid',

                            gridTemplateColumns:
                                '1fr 1fr',

                            gap:
                                '14px',

                            marginBottom:
                                '14px'
                        }}
                    >

                        <div>

                            <label
                                style={
                                    labelStyle
                                }
                            >
                                Fuel price (₹/L)
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="0.1"
                                value={
                                    costs.fuelPrice
                                }
                                onChange={
                                    e =>
                                        updateCost(
                                            'fuelPrice',
                                            e.target.value
                                        )
                                }
                                style={
                                    inputStyle
                                }
                            />

                        </div>


                        <div>

                            <label
                                style={
                                    labelStyle
                                }
                            >

                                Mileage (km/L)

                                {mileageWarning && (

                                    <span
                                        style={{
                                            color:
                                                '#b91c1c',

                                            marginLeft:
                                                '5px'
                                        }}
                                    >
                                        ⚠️
                                    </span>

                                )}

                            </label>

                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={
                                    costs.mileage
                                }
                                onChange={
                                    e =>
                                        updateCost(
                                            'mileage',
                                            e.target.value
                                        )
                                }
                                style={{
                                    ...inputStyle,

                                    borderColor:
                                        mileageWarning
                                            ? '#dc2626'
                                            : '#cfd8d0'
                                }}
                            />

                            {mileageWarning && (

                                <p
                                    style={{
                                        margin:
                                            '4px 0 0',

                                        fontSize:
                                            '11px',

                                        color:
                                            '#b91c1c'
                                    }}
                                >
                                    Typical range:
                                    3–6 km/L
                                </p>

                            )}

                        </div>

                    </div>


                    <div
                        style={{
                            display:
                                'grid',

                            gridTemplateColumns:
                                '1fr 1fr',

                            gap:
                                '14px'
                        }}
                    >

                        <div>

                            <label
                                style={
                                    labelStyle
                                }
                            >
                                Driver daily wage (₹)
                            </label>

                            <input
                                type="number"
                                min="1"
                                value={
                                    costs.driverWage
                                }
                                onChange={
                                    e =>
                                        updateCost(
                                            'driverWage',
                                            e.target.value
                                        )
                                }
                                style={
                                    inputStyle
                                }
                            />

                        </div>


                        <div>

                            <label
                                style={
                                    labelStyle
                                }
                            >
                                Trip duration (days)
                            </label>

                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={
                                    costs.tripDays
                                }
                                onChange={
                                    e =>
                                        updateCost(
                                            'tripDays',
                                            e.target.value
                                        )
                                }
                                style={
                                    inputStyle
                                }
                            />

                        </div>

                    </div>

                </div>


                {/* ========================================
                    COST BREAKDOWN
                ======================================== */}

                <div
                    style={
                        sectionStyle
                    }
                >

                    <p
                        style={{
                            margin:
                                '0 0 14px',

                            fontWeight:
                                700,

                            fontSize:
                                '15px',

                            color:
                                '#202521'
                        }}
                    >
                        Cost Breakdown
                    </p>


                    {[
                        [
                            'Fuel',
                            fuelCost
                        ],

                        [
                            'Driver',
                            driverCost
                        ],

                        [
                            'Toll',
                            toll
                        ],

                        [
                            'Loading',
                            loading
                        ],

                        [
                            'Unloading',
                            unloading
                        ],

                        [
                            'Maintenance',
                            maintenance
                        ],

                        [
                            'Parking',
                            parking
                        ],

                        [
                            'Miscellaneous',
                            misc
                        ]

                    ].map(
                        (
                            [
                                label,
                                value
                            ]
                        ) => (

                            <div
                                key={
                                    label
                                }
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    marginBottom:
                                        '7px',

                                    fontSize:
                                        '14px'
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            '#647069'
                                    }}
                                >
                                    {label}
                                </span>

                                <span
                                    style={{
                                        color:
                                            '#202521'
                                    }}
                                >

                                    ₹
                                    {value.toLocaleString(
                                        'en-IN'
                                    )}

                                </span>

                            </div>

                        )
                    )}


                    {weightMultiplier > 1 && (

                        <div
                            style={{
                                display:
                                    'flex',

                                justifyContent:
                                    'space-between',

                                marginBottom:
                                    '7px',

                                fontSize:
                                    '13px',

                                color:
                                    '#8a6d22'
                            }}
                        >

                            <span>

                                Heavy load adjustment (
                                {
                                    (
                                        (
                                            weightMultiplier -
                                            1
                                        ) *
                                        100
                                    ).toFixed(
                                        0
                                    )
                                }
                                %)

                            </span>


                            <span>

                                +₹
                                {
                                    (
                                        adjustedCost -
                                        totalCost
                                    ).toLocaleString(
                                        'en-IN'
                                    )
                                }

                            </span>

                        </div>

                    )}


                    <div
                        style={{
                            display:
                                'flex',

                            justifyContent:
                                'space-between',

                            marginTop:
                                '12px',

                            paddingTop:
                                '12px',

                            borderTop:
                                '2px solid #4f704f',

                            fontWeight:
                                700,

                            fontSize:
                                '17px',

                            color:
                                '#202521'
                        }}
                    >

                        <span>
                            Estimated Cost
                        </span>


                        <span>

                            ₹
                            {adjustedCost.toLocaleString(
                                'en-IN'
                            )}

                        </span>

                    </div>

                </div>


                {/* ========================================
                    MARKET INSIGHTS
                ======================================== */}

                <div
                    style={
                        sectionStyle
                    }
                >

                    <p
                        style={{
                            margin:
                                '0 0 14px',

                            fontWeight:
                                700,

                            fontSize:
                                '15px',

                            color:
                                '#202521'
                        }}
                    >
                        Market Insights
                    </p>


                    <div
                        style={{
                            display:
                                'flex',

                            justifyContent:
                                'space-between',

                            marginBottom:
                                '7px',

                            fontSize:
                                '14px'
                        }}
                    >

                        <span
                            style={{
                                color:
                                    '#647069'
                            }}
                        >
                            Current lowest bid
                        </span>


                        <span
                            style={{
                                color:
                                    '#4f704f',

                                fontWeight:
                                    700
                            }}
                        >

                            {
                                lowestBid !== null
                                    ? `₹${lowestBid.toLocaleString(
                                        'en-IN'
                                    )}`
                                    : 'No bids yet'
                            }

                        </span>

                    </div>


                    <div
                        style={{
                            display:
                                'flex',

                            justifyContent:
                                'space-between',

                            marginBottom:
                                '7px',

                            fontSize:
                                '14px'
                        }}
                    >

                        <span
                            style={{
                                color:
                                    '#647069'
                            }}
                        >
                            Average bid
                        </span>


                        <span>

                            {
                                avgBid !== null
                                    ? `₹${avgBid.toLocaleString(
                                        'en-IN'
                                    )}`
                                    : 'No bids yet'
                            }

                        </span>

                    </div>


                    <div
                        style={{
                            display:
                                'flex',

                            justifyContent:
                                'space-between',

                            fontSize:
                                '14px'
                        }}
                    >

                        <span
                            style={{
                                color:
                                    '#647069'
                            }}
                        >
                            Total bids placed
                        </span>


                        <span>
                            {bidAmounts.length}
                        </span>

                    </div>


                    {/* ====================================
                        MARKET POSITION
                    ==================================== */}

                    <div
                        style={{
                            marginTop:
                                '14px',

                            padding:
                                '12px',

                            background:
                                '#f8faf8',

                            borderRadius:
                                '8px',

                            fontSize:
                                '13px'
                        }}
                    >

                        <strong>
                            💡 Pricing Insight
                        </strong>


                        <p
                            style={{
                                margin:
                                    '5px 0 0',

                                color:
                                    '#647069',

                                lineHeight:
                                    1.5
                            }}
                        >

                            Your estimated operating cost is{' '}

                            <strong>
                                ₹
                                {adjustedCost.toLocaleString(
                                    'en-IN'
                                )}
                            </strong>

                            {maximumBudget > 0 && (
                                <>
                                    {' '}and the shipper's maximum budget is{' '}

                                    <strong>
                                        ₹
                                        {maximumBudget.toLocaleString(
                                            'en-IN'
                                        )}
                                    </strong>.
                                </>
                            )}

                        </p>

                    </div>

                </div>


                {/* ========================================
                    BID RECOMMENDATION
                ======================================== */}

                <div>

                    <p
                        style={{
                            margin:
                                '0 0 14px',

                            fontWeight:
                                700,

                            fontSize:
                                '15px',

                            color:
                                '#202521'
                        }}
                    >
                        Bid Recommendation
                    </p>


                    {[
                        {
                            label:
                                '🟢 Competitive',

                            amount:
                                competitive,

                            desc:
                                'Lower price with a higher chance of winning',

                            color:
                                '#4f704f',

                            bg:
                                '#edf3ed',

                            border:
                                '#c9dcc9'
                        },

                        {
                            label:
                                '⭐ Recommended',

                            amount:
                                recommended,

                            desc:
                                'Balanced profit and winning probability',

                            color:
                                '#4f704f',

                            bg:
                                '#f3f7f3',

                            border:
                                '#4f704f',

                            highlight:
                                true
                        },

                        {
                            label:
                                '📈 High Profit',

                            amount:
                                highProfit,

                            desc:
                                'Higher profit but lower chance of winning',

                            color:
                                '#405d42',

                            bg:
                                '#f7f9f7',

                            border:
                                '#b8c9b9'
                        }

                    ].map(
                        strategy => {

                            const profit =
                                strategy.amount -
                                adjustedCost


                            const margin =
                                strategy.amount >
                                    0

                                    ? (
                                        (
                                            profit /
                                            strategy.amount
                                        ) *
                                        100
                                    ).toFixed(
                                        1
                                    )

                                    : '0.0'


                            const winChance =
                                getWinChance(
                                    strategy.amount
                                )


                            const overBudget =
                                maximumBudget > 0 &&
                                strategy.amount >
                                maximumBudget


                            const negativeProfit =
                                profit < 0


                            return (

                                <div
                                    key={
                                        strategy.label
                                    }
                                    style={{
                                        border:
                                            `${strategy.highlight ? '2px' : '1px'} solid ${strategy.border}`,

                                        borderRadius:
                                            '10px',

                                        padding:
                                            '15px',

                                        marginBottom:
                                            '10px',

                                        background:
                                            strategy.bg
                                    }}
                                >

                                    <div
                                        style={{
                                            display:
                                                'flex',

                                            justifyContent:
                                                'space-between',

                                            alignItems:
                                                'flex-start',

                                            gap:
                                                '20px'
                                        }}
                                    >

                                        <div>

                                            <p
                                                style={{
                                                    margin:
                                                        '0 0 3px',

                                                    fontWeight:
                                                        700,

                                                    color:
                                                        strategy.color,

                                                    fontSize:
                                                        '14px'
                                                }}
                                            >
                                                {
                                                    strategy.label
                                                }
                                            </p>


                                            <p
                                                style={{
                                                    margin:
                                                        0,

                                                    fontSize:
                                                        '22px',

                                                    fontWeight:
                                                        800,

                                                    color:
                                                        '#202521'
                                                }}
                                            >

                                                ₹
                                                {strategy.amount.toLocaleString(
                                                    'en-IN'
                                                )}

                                            </p>


                                            <p
                                                style={{
                                                    margin:
                                                        '3px 0 0',

                                                    fontSize:
                                                        '12px',

                                                    color:
                                                        '#647069'
                                                }}
                                            >
                                                {
                                                    strategy.desc
                                                }
                                            </p>


                                            {overBudget && (

                                                <p
                                                    style={{
                                                        margin:
                                                            '7px 0 0',

                                                        fontSize:
                                                            '12px',

                                                        color:
                                                            '#b91c1c',

                                                        fontWeight:
                                                            700
                                                    }}
                                                >

                                                    ⚠️ Above shipper's
                                                    maximum budget

                                                </p>

                                            )}


                                            {negativeProfit && (

                                                <p
                                                    style={{
                                                        margin:
                                                            '7px 0 0',

                                                        fontSize:
                                                            '12px',

                                                        color:
                                                            '#b91c1c',

                                                        fontWeight:
                                                            700
                                                    }}
                                                >

                                                    ⚠️ This bid is below
                                                    your estimated cost

                                                </p>

                                            )}

                                        </div>


                                        <div
                                            style={{
                                                textAlign:
                                                    'right'
                                            }}
                                        >

                                            <p
                                                style={{
                                                    margin:
                                                        '0 0 3px',

                                                    fontSize:
                                                        '13px',

                                                    color:
                                                        profit >= 0
                                                            ? '#4f704f'
                                                            : '#b91c1c',

                                                    fontWeight:
                                                        700
                                                }}
                                            >

                                                Profit: ₹
                                                {profit.toLocaleString(
                                                    'en-IN'
                                                )}

                                            </p>


                                            <p
                                                style={{
                                                    margin:
                                                        '0 0 3px',

                                                    fontSize:
                                                        '12px',

                                                    color:
                                                        '#647069'
                                                }}
                                            >

                                                Margin:
                                                {' '}
                                                {margin}%

                                            </p>


                                            <p
                                                style={{
                                                    margin:
                                                        0,

                                                    fontSize:
                                                        '12px',

                                                    color:
                                                        winChance > 70
                                                            ? '#4f704f'
                                                            : winChance > 50
                                                                ? '#8a6d22'
                                                                : '#b91c1c',

                                                    fontWeight:
                                                        700
                                                }}
                                            >

                                                Win chance:
                                                {' '}
                                                ~{winChance}%

                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            onUseBid(
                                                strategy.amount
                                            )
                                        }
                                        style={{
                                            marginTop:
                                                '12px',

                                            width:
                                                '100%',

                                            padding:
                                                '9px',

                                            background:
                                                '#4f704f',

                                            color:
                                                '#ffffff',

                                            border:
                                                'none',

                                            borderRadius:
                                                '7px',

                                            cursor:
                                                'pointer',

                                            fontWeight:
                                                600,

                                            fontSize:
                                                '13px'
                                        }}
                                    >

                                        Use ₹
                                        {strategy.amount.toLocaleString(
                                            'en-IN'
                                        )}

                                    </button>

                                </div>

                            )

                        }
                    )}

                </div>

            </div>

        </div>

    )

}


export default TripCostAnalyzer