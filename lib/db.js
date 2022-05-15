import { Pool } from "pg";

let conn;

if (!conn) {
  conn = new Pool({
    user: "user1",
    password: "user1",
    host: "localhost",
    port: 5432,
    database: "test",
  });
}

export default conn ;