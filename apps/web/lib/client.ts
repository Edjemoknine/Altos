import { hc } from "hono/client";
import type { AppType } from "api"; // Imports types directly from your Hono app workspace!
import { API_BASE_URL } from "./api-url";

export const client = hc<AppType>(API_BASE_URL);
