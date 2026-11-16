import { Client } from "@upstash/qstash";

const token = process.env.QSTASH_TOKEN!;
const workerUrl = process.env.INGESTION_WORKER_URL!;

if (!token) {
  throw new Error("QSTASH_TOKEN is not configured");
}

if (!workerUrl) {
  throw new Error("INGESTION_WORKER_URL is not configured");
}

const qstash = new Client({ token });

export async function publishIngestionJob(jobId: string) {
  const result = await qstash.publishJSON({
    url: workerUrl,
    body: { jobId },
    retries: 5,
  });

  return result.messageId;
}
