import { createAuthClient } from "better-auth/react";
import { API_BASE_URL } from "@/lib/api-url";

export const authClient = createAuthClient({
  baseURL: "https://altos-ten.vercel.app",
  fetchOptions: {
    credentials: "include",
  },
});
