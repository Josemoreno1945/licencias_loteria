import pg from "pg";

import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
} from "./config.js";

const { Pool } = pg;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

pool.on("connect", () => {
  console.log("Base de datos conectada correctamente");
});

pool.on("error", (err) => {
  console.error("Error inesperado en la base de datos", err);
});

export { pool };
