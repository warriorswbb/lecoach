import express from "express";
import knex from "knex";
import bodyParser from "body-parser";
import config from "./knexfile.js";
import dotenv from "dotenv";

const kx = knex(config.development);
dotenv.config();

const app = express();
app.use(bodyParser.json());

app.get("/test", async (req, res) => {
  try {
    const authors = await kx("test_table").select("*");
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Server is running on url: ${url}`);
});
