import { hc } from "hono/client";
import type { AppType } from "api"; // Imports types directly from your Hono app workspace!

// Point to your backend development port (e.g., 3001)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const client = hc<AppType>(BACKEND_URL);
