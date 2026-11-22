import { createHash, randomBytes } from "node:crypto";

export function generateWidgetKey(): string {
  return `wk_live_${randomBytes(32).toString("base64url")}`;
}

export function hashWidgetKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
