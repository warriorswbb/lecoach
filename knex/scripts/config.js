import dotenv from "dotenv";
import knex from "knex";
import config from "../knexfile.js";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const kx = knex(config.development);

export default kx;
