import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

const {
  S3_ENDPOINT_URL,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
} = process.env;

if (
  !S3_ENDPOINT_URL ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  throw new Error("Missing required Cloudflare R2 environment variables");
}

export const R2_BUCKET = R2_BUCKET_NAME;

export const r2 = new S3Client({
  region: "auto",
  endpoint: S3_ENDPOINT_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
