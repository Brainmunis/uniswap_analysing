import { Pool } from "pg";

let conn;

if (!conn) {
  console.log("hoooost ", process.env.DB_USER_NAME)
  console.log("paass ", process.env.DB_PASSWORD)
  conn = new Pool({
    user: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });
}

export default conn ;