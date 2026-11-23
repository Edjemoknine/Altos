import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { R2_BUCKET, r2 } from "./r2.client.ts";

const UPLOAD_URL_EXPIRES_IN = 10 * 60; // 10 minutes

export type UploadFileOptions = {
  storageKey: string;
  contentType: string;
};

export async function createUploadUrl({
  storageKey,
  contentType,
}: UploadFileOptions) {
  return getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
      ContentType: contentType,
    }),
    { expiresIn: UPLOAD_URL_EXPIRES_IN },
  );
}

export async function getUploadedObject(storageKey: string) {
  return r2.send(
    new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
    }),
  );
}

export async function getUploadedObjectBytes(storageKey: string) {
  const result = await r2.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
    }),
  );

  if (!result.Body) {
    return null;
  }

  return result.Body.transformToByteArray();
}

export async function deleteUploadedObject(storageKey: string) {
  return r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
    }),
  );
}

export type UploadObjectOptions = {
  storageKey: string;
  contentType: string;
  body: Buffer;
};

export async function uploadObject({
  storageKey,
  contentType,
  body,
}: UploadObjectOptions) {
  return r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: storageKey,
      ContentType: contentType,
      Body: body,
    }),
  );
}
export function getPublicObjectUrl(storageKey: string) {
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!publicUrl) {
    throw new Error("Missing R2_PUBLIC_URL environment variable");
  }

  return `${publicUrl.replace(/\/+$/, "")}/${storageKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
