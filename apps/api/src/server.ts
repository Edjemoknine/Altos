import { serve } from "@hono/node-server";
import app from "./index.ts";

const port = Number(process.env.PORT) || 3000;

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on port ${port}`);
