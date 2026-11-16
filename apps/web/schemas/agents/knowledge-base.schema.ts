import { z } from "zod";

export const scrapeWebsiteSchema = z.object({
  url: z.string().trim().min(1, "Enter a website URL.").refine((value) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) && !!url.hostname;
    } catch {
      return false;
    }
  }, "Enter a valid HTTP or HTTPS website URL."),
});

export const textFileSchema = z.custom<File>(
  (value) =>
    typeof File !== "undefined" &&
    value instanceof File &&
    value.name.toLowerCase().endsWith(".txt"),
  "Only .txt files are supported.",
);
