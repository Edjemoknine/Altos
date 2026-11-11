import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import {
  user,
  session,
  account,
  verification,
  relations,
} from "./auth-schema.ts";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const client = neon(databaseUrl);

// Explicitly register the tables.
export const authSchema = {
  user,
  session,
  account,
  verification,
};

export const db = drizzle({
  client,
  relations,
});
