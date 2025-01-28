import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;

// You may use this as a boolean value for different situations
const env = {
  development: process.env.NODE_ENV === "development",
  test: process.env.NODE_ENV === "test",
  staging: process.env.NODE_ENV === "staging",
  production: process.env.NODE_ENV === "production",
};

const dbConfig = {
  client: process.env.DB_CLIENT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

const postgres = {
  url: process.env.POSTGRES_URL,
};

export { port, env, dbConfig, postgres };
