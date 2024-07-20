import { dbConfig } from "../config/environment/index";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const knex = require("knex")({
  client: dbConfig.client,
  connection: {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  },
});

export default knex;
