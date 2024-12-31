import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
// import { Customers, Invoices } from "@/db/schema";
import * as schema from "./schema";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.XATA_DATABASE_URL,
  max: 20,
});
// export const db = drizzle(pool, {
//   schema: {
//     // Invoices,
//   },
// });
export const db = drizzle(pool, {
  schema,
});
