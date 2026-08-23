const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || undefined,

    host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
    user: process.env.DATABASE_URL ? undefined : process.env.DB_USER,
    password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
    database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,
    port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT),

    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err.message);
});

const connectDB = async () => {
    try {
        const client = await pool.connect();

        console.log("PostgreSQL connected successfully");

        const result = await client.query("SELECT NOW()");
        console.log("Database time:", result.rows[0].now);

        client.release();
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
};

connectDB();

module.exports = pool;