/// <reference types="node" />
import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schemas/*.ts",
  out: "./drizzle",
  dialect: "postgresql",

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
