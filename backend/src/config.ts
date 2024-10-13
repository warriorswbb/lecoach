import dotenv from "dotenv";
import knex from "knex";
// @ts-ignore
import config from "./knexfile.ts";

dotenv.config();

const kx = knex(config.development);

export default kx;
