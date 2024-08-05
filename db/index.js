import pg from "pg";
const { Pool } = pg;
import { postgres } from "../config/environment";

let pool;

const connectDB = async () => {
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: postgres.url,
        ssl: {
          rejectUnauthorized: false,
        },
      });

      pool.on("connect", () => {
        console.log("Connected to PostgreSQL database");
      });

      pool.on("error", (err) => {
        console.error("Unexpected error on idle client", err);
        process.exit(-1);
      });

      // Test the connection by querying all rows from test_table
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM test_table"); // Query to select all rows
        console.log("Test query result:", res.rows);
      } finally {
        client.release(); // Ensure the client is released back to the pool
      }
    } catch (err) {
      console.error("Error creating the pool", err);
      throw new Error(err);
    }
  }

  return pool;
};

export default connectDB;
