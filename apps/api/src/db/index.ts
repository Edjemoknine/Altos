import "dotenv/config";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  user,
  session,
  account,
  verification,
  organization,
  member,
  invitation,
  relations,
} from "./schema.ts";

export const authSchema = {
  user,
  session,
  account,
  verification,
  organization,
  member,
  invitation,
};
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const client = neon(databaseUrl);

export const db = drizzle({
  client,
  relations,
});
