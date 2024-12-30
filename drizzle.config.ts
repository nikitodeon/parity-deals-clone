import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
  path: "./.env",
});
if (typeof process.env.XATA_DATABASE_URL !== "string") {
  throw new Error("Please set your XATA_DATABASE_URL");
}

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.XATA_DATABASE_URL,
  },
});
