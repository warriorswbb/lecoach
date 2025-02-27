import { Pool } from "pg";

// Create a connection pool to the RDS database
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "",
  database: process.env.DB_NAME || "app",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT || "5432"),
  // Important: Configure SSL properly for AWS RDS
  ssl: {
    rejectUnauthorized: false, // This allows connecting to RDS with self-signed certs
  },
});

// Test the connection
pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully");
  }
});

export default pool;
