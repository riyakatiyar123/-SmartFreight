DROP TABLE IF EXISTS location_history;
DROP TABLE IF EXISTS bid_history;
DROP TABLE IF EXISTS bids;
DROP TABLE IF EXISTS shipments;
DROP TABLE IF EXISTS users;


-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('shipper', 'transporter')),

    phone VARCHAR(15),

    -- Transporter details
    aadhaar_verified BOOLEAN DEFAULT false,

    truck_number VARCHAR(20),

    truck_capacity_kg INTEGER,

    truck_type VARCHAR(50),

    mileage_kmpl DECIMAL(4,1) DEFAULT 4.0,

    -- Transporter performance
    rating DECIMAL(3,1) DEFAULT 0,

    total_trips INTEGER DEFAULT 0,

    on_time_deliveries INTEGER DEFAULT 0,

    cancellations INTEGER DEFAULT 0,

    avg_response_minutes INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW()
);


-- ==========================================
-- SHIPMENTS
-- ==========================================

CREATE TABLE shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    from_city VARCHAR(100) NOT NULL,

    to_city VARCHAR(100) NOT NULL,

    weight_kg INTEGER NOT NULL,

    amount INTEGER NOT NULL,

    goods_type VARCHAR(100),

    notes TEXT,

    status VARCHAR(20) DEFAULT 'posted'
        CHECK (
            status IN (
                'posted',
                'assigned',
                'in_transit',
                'delivered',
                'cancelled'
            )
        ),

    user_id UUID REFERENCES users(id),

    transporter_id UUID REFERENCES users(id),

    pickup_date DATE,

    delivery_by DATE,

    created_at TIMESTAMP DEFAULT NOW()
);


-- ==========================================
-- BIDS
-- ==========================================

CREATE TABLE bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    shipment_id UUID
        REFERENCES shipments(id)
        ON DELETE CASCADE,

    transporter_id UUID
        REFERENCES users(id),

    amount INTEGER NOT NULL,

    note TEXT,

    status VARCHAR(20) DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'rejected'
            )
        ),

    created_at TIMESTAMP DEFAULT NOW()
);


-- ==========================================
-- BID HISTORY
-- ==========================================

CREATE TABLE bid_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    bid_id UUID
        REFERENCES bids(id)
        ON DELETE CASCADE,

    transporter_id UUID
        REFERENCES users(id),

    shipment_id UUID
        REFERENCES shipments(id),

    old_amount INTEGER,

    new_amount INTEGER,

    changed_at TIMESTAMP DEFAULT NOW()
);


-- ==========================================
-- LOCATION HISTORY
-- ==========================================

CREATE TABLE location_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    shipment_id UUID
        REFERENCES shipments(id)
        ON DELETE CASCADE,

    lat DECIMAL(10,6),

    lng DECIMAL(10,6),

    recorded_at TIMESTAMP DEFAULT NOW()
);