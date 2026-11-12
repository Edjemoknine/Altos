import { hc } from "hono/client";
import type { AppType } from "@repo/api";

import { API_BASE_URL } from "./api-url";

export const client = hc<AppType>(API_BASE_URL!, {
  init: {
    credentials: "include",
  },
});
