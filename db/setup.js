const pool = require('./connection')

const setupDatabase = async () => {
    try {

        console.log('======================================')
        console.log('STARTING DATABASE SETUP')
        console.log('======================================')


        // ========================================
        // CHECK DATABASE CONNECTION
        // ========================================

        const dbInfo = await pool.query(`
            SELECT
                current_database() AS database,
                current_schema() AS schema
        `)

        console.log(
            `Connected to database: ${dbInfo.rows[0].database}`
        )

        console.log(
            `Schema: ${dbInfo.rows[0].schema}`
        )


        // ========================================
        // USERS TABLE
        // ========================================

        console.log('')
        console.log('Updating users table...')

        await pool.query(`
            ALTER TABLE users

            ADD COLUMN IF NOT EXISTS phone VARCHAR(15),

            ADD COLUMN IF NOT EXISTS city VARCHAR(100),

            ADD COLUMN IF NOT EXISTS state VARCHAR(100),

            ADD COLUMN IF NOT EXISTS profile_photo TEXT,

            ADD COLUMN IF NOT EXISTS truck_number VARCHAR(20),

            ADD COLUMN IF NOT EXISTS truck_capacity_kg INTEGER,

            ADD COLUMN IF NOT EXISTS truck_type VARCHAR(50),

            ADD COLUMN IF NOT EXISTS mileage_kmpl DECIMAL(4,1)
                DEFAULT 4.0,

            ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(20)
                DEFAULT 'diesel',

            ADD COLUMN IF NOT EXISTS years_experience INTEGER
                DEFAULT 0,

            ADD COLUMN IF NOT EXISTS operating_regions TEXT,

            ADD COLUMN IF NOT EXISTS aadhaar_verified BOOLEAN
                DEFAULT false,

            ADD COLUMN IF NOT EXISTS rating DECIMAL(3,1)
                DEFAULT 0,

            ADD COLUMN IF NOT EXISTS total_trips INTEGER
                DEFAULT 0,

            ADD COLUMN IF NOT EXISTS on_time_deliveries INTEGER
                DEFAULT 0,

            ADD COLUMN IF NOT EXISTS cancellations INTEGER
                DEFAULT 0,

            ADD COLUMN IF NOT EXISTS avg_response_minutes INTEGER
                DEFAULT 0,

            ADD COLUMN IF NOT EXISTS total_distance_km INTEGER
                DEFAULT 0
        `)

        console.log('Users table updated successfully!')


        // ========================================
        // SHIPMENTS TABLE
        // ========================================

        console.log('')
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

            ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP,

            ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMP
        `)

        console.log(
            'Shipments table updated successfully!'
        )


        // ========================================
        // VERIFY ARRIVED_AT COLUMN
        // ========================================

        console.log('')
        console.log(
            'Checking arrived_at column...'
        )

        const arrivedColumn = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'shipments'
              AND column_name = 'arrived_at'
        `)

        if (arrivedColumn.rows.length === 0) {

            console.error(
                '❌ arrived_at column was NOT created!'
            )

        } else {

            console.log(
                '✅ arrived_at column exists!'
            )

        }


        // ========================================
        // VERIFY OTHER SHIPMENT COLUMNS
        // ========================================

        const shipmentColumns = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'shipments'
            ORDER BY ordinal_position
        `)

        console.log('')
        console.log(
            'Current shipments columns:'
        )

        shipmentColumns.rows.forEach(row => {

            console.log(
                `  ✓ ${row.column_name}`
            )

        })


        // ========================================
        // RATINGS TABLE
        // ========================================

        console.log('')
        console.log('Creating ratings table...')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS ratings (

                id UUID
                    DEFAULT gen_random_uuid()
                    PRIMARY KEY,

                shipment_id UUID
                    REFERENCES shipments(id)
                    ON DELETE CASCADE,

                shipper_id UUID
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                transporter_id UUID
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                rating INTEGER
                    CHECK (rating BETWEEN 1 AND 5),

                comment TEXT,

                created_at TIMESTAMP
                    DEFAULT NOW()
            )
        `)

        console.log(
            'Ratings table ready!'
        )


        // ========================================
        // LOCATION HISTORY TABLE
        // ========================================

        console.log('')
        console.log(
            'Creating location_history table...'
        )

        await pool.query(`
            CREATE TABLE IF NOT EXISTS location_history (

                id UUID
                    DEFAULT gen_random_uuid()
                    PRIMARY KEY,

                shipment_id UUID
                    REFERENCES shipments(id)
                    ON DELETE CASCADE,

                lat DECIMAL(10,6)
                    NOT NULL,

                lng DECIMAL(10,6)
                    NOT NULL,

                recorded_at TIMESTAMP
                    DEFAULT NOW()
            )
        `)

        console.log(
            'Location history table ready!'
        )


        // ========================================
        // FINAL VERIFICATION
        // ========================================

        console.log('')
        console.log('======================================')
        console.log('FINAL DATABASE CHECK')
        console.log('======================================')

        const finalCheck = await pool.query(`
            SELECT
                current_database() AS database,
                EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'shipments'
                    AND column_name = 'arrived_at'
                ) AS arrived_at_exists
        `)

        console.log(
            `Database: ${finalCheck.rows[0].database}`
        )

        console.log(
            `arrived_at exists: ${finalCheck.rows[0].arrived_at_exists}`
        )


        if (
            finalCheck.rows[0].arrived_at_exists
        ) {

            console.log('')
            console.log(
                '✅ DATABASE SETUP COMPLETED SUCCESSFULLY'
            )

            console.log(
                '✅ shipments.arrived_at is ready'
            )

        } else {

            console.error('')
            console.error(
                '❌ DATABASE SETUP FAILED'
            )

            console.error(
                '❌ shipments.arrived_at is still missing'
            )

        }


        console.log('======================================')


    } catch (error) {

        console.error('')
        console.error(
            '❌ DATABASE SETUP FAILED'
        )

        console.error(
            error.message
        )

        console.error('')
        console.error(
            'Full error:'
        )

        console.error(error)

    } finally {

        await pool.end()

        console.log('')
        console.log(
            'Database connection closed.'
        )

    }
}


setupDatabase()