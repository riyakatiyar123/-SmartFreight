const pool = require('./connection')

const setupDatabase = async () => {
    try {

        console.log('Updating users table...')

        // ==========================================
        // USERS TABLE
        // ==========================================

        await pool.query(`
            ALTER TABLE users

            ADD COLUMN IF NOT EXISTS phone VARCHAR(15),

            ADD COLUMN IF NOT EXISTS city VARCHAR(100),

            ADD COLUMN IF NOT EXISTS state VARCHAR(100),

            ADD COLUMN IF NOT EXISTS profile_photo TEXT,

            -- Transporter details
            ADD COLUMN IF NOT EXISTS truck_number VARCHAR(20),

            ADD COLUMN IF NOT EXISTS truck_capacity_kg INTEGER,

            ADD COLUMN IF NOT EXISTS truck_type VARCHAR(50),

            ADD COLUMN IF NOT EXISTS mileage_kmpl DECIMAL(4,1) DEFAULT 4.0,

            ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(20) DEFAULT 'diesel',

            ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,

            ADD COLUMN IF NOT EXISTS operating_regions TEXT,

            ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN DEFAULT false,

            -- Transporter statistics
            ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1) DEFAULT 0,

            ADD COLUMN IF NOT EXISTS total_trips INTEGER DEFAULT 0,

            ADD COLUMN IF NOT EXISTS on_time_deliveries INTEGER DEFAULT 0,

            ADD COLUMN IF NOT EXISTS cancellations INTEGER DEFAULT 0,

            ADD COLUMN IF NOT EXISTS avg_response_minutes INTEGER DEFAULT 0,

            ADD COLUMN IF NOT EXISTS total_distance_km INTEGER DEFAULT 0;
        `)

        console.log('Users table updated successfully!')


        // ==========================================
        // SHIPMENTS TABLE
        // ==========================================

        console.log('Updating shipments table...')

        await pool.query(`
            ALTER TABLE shipments

            ADD COLUMN IF NOT EXISTS pickup_address TEXT,

            ADD COLUMN IF NOT EXISTS delivery_address TEXT,

            ADD COLUMN IF NOT EXISTS cargo_value INTEGER,

            ADD COLUMN IF NOT EXISTS num_packages INTEGER,

            ADD COLUMN IF NOT EXISTS special_handling TEXT[],

            ADD COLUMN IF NOT EXISTS description TEXT,

            ADD COLUMN IF NOT EXISTS pickup_time TIME,

            ADD COLUMN IF NOT EXISTS delivery_condition VARCHAR(50),

            ADD COLUMN IF NOT EXISTS delivery_notes TEXT,

            ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP;
        `)

        console.log('Shipments table updated successfully!')


        // ==========================================
        // RATINGS TABLE
        // ==========================================

        console.log('Creating ratings table...')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ratings (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

                shipment_id UUID REFERENCES shipments(id),

                shipper_id UUID REFERENCES users(id),

                transporter_id UUID REFERENCES users(id),

                rating INTEGER CHECK (rating BETWEEN 1 AND 5),

                comment TEXT,

                created_at TIMESTAMP DEFAULT NOW()
            );
        `)

        console.log('Ratings table ready!')


        // ==========================================
        // LOCATION HISTORY
        // ==========================================

        console.log('Creating location history table...')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS location_history (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

                shipment_id UUID REFERENCES shipments(id),

                lat DECIMAL(10,6) NOT NULL,

                lng DECIMAL(10,6) NOT NULL,

                recorded_at TIMESTAMP DEFAULT NOW()
            );
        `)

        console.log('Location history table ready!')


        console.log('')
        console.log('======================================')
        console.log('DATABASE SETUP COMPLETED SUCCESSFULLY')
        console.log('======================================')


    } catch (error) {

        console.error('Database update failed:')
        console.error(error)

    } finally {

        await pool.end()

    }
}

setupDatabase()