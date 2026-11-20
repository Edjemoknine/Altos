import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { randomUUID } from "node:crypto";

import { CheerioCrawler } from "@crawlee/cheerio";
import { RequestQueue } from "@crawlee/core";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

export type CrawledPage = {
  url: string;
  title: string;
  content: string;
  metadata: {
    description?: string;
    contentType: "text/html";
    crawledAt: string;
  };
};

export type WebsiteCrawlerOptions = {
  maxPages?: number;
  maxDepth?: number;
};

export type WebsiteCrawlResult = {
  pages: CrawledPage[];
  failedUrls: string[];
};

const DEFAULT_MAX_PAGES = 50;
const DEFAULT_MAX_DEPTH = 3;

const MAX_PAGE_CONTENT_LENGTH = 1_000_000;

const IGNORED_EXTENSIONS =
  /\.(?:avif|css|gif|ico|jpe?g|js|json|map|mp[34]|pdf|png|svg|webp|woff2?|zip)$/i;

function normalizeUrl(value: string): string | null {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    url.hash = "";

    // Remove common tracking parameters.
    for (const key of [...url.searchParams.keys()]) {
      if (
        key.startsWith("utm_") ||
        ["gclid", "fbclid", "mc_cid", "mc_eid"].includes(key)
      ) {
        url.searchParams.delete(key);
      }
    }

    return url.toString();
  } catch {
    return null;
  }
}

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => part < 0 || part > 255)) {
    return true;
  }

  const [a, b, c] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateIp(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    return isPrivateIpv4(address);
  }

  if (version === 6) {
    const normalized = address.toLowerCase();

    // Unspecified, loopback, unique-local, link-local and multicast.
    if (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      /^fe[89ab]/.test(normalized) ||
      normalized.startsWith("ff")
    ) {
      return true;
    }

    // IPv4-mapped IPv6 addresses.
    if (normalized.startsWith("::ffff:")) {
      const mappedAddress = normalized.slice("::ffff:".length);

      if (isIP(mappedAddress) === 4) {
        return isPrivateIpv4(mappedAddress);
      }
    }

    return false;
  }

  return true;
}

async function assertPublicHttpUrl(value: string): Promise<URL> {
  const url = new URL(value);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are allowed.");
  }

  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not allowed.");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname === "metadata.google.internal"
  ) {
    throw new Error("Private or local network URLs are not allowed.");
  }

  const ipVersion = isIP(hostname);

  if (ipVersion) {
    if (isPrivateIp(hostname)) {
      throw new Error("Private or reserved IP addresses are not allowed.");
    }

    return url;
  }

  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateIp(address))
  ) {
    throw new Error("The hostname resolves to a private or reserved IP.");
  }

  return url;
}

function extractPage(html: string, url: string): CrawledPage | null {
  const dom = new JSDOM(html, { url });

  try {
    const document = dom.window.document;

    const description =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content")
        ?.trim() || undefined;

    const article = new Readability(document).parse();

    let title = article?.title?.trim() || "";
    let content = article?.textContent?.trim() || "";

    // Readability works best for article-like pages.
    // Fall back to the body text for ordinary business pages.
    if (!content) {
      const fallbackDom = new JSDOM(html, { url });

      try {
        const fallbackDocument = fallbackDom.window.document;

        fallbackDocument
          .querySelectorAll(
            "script, style, noscript, svg, nav, footer, header, iframe",
          )
          .forEach((element) => element.remove());

        content =
          fallbackDocument.body?.textContent?.replace(/\s+/g, " ").trim() ?? "";

        if (!title) {
          title = fallbackDocument.title.trim();
        }
      } finally {
        fallbackDom.window.close();
      }
    }

    if (!content) {
      return null;
    }

    return {
      url,
      title: title || new URL(url).hostname,
      content: content.slice(0, MAX_PAGE_CONTENT_LENGTH),
      metadata: {
        ...(description ? { description } : {}),
        contentType: "text/html",
        crawledAt: new Date().toISOString(),
      },
    };
  } finally {
    dom.window.close();
  }
}

export async function crawlWebsite(
  startUrl: string,
  options: WebsiteCrawlerOptions = {},
): Promise<WebsiteCrawlResult> {
  const maxPages = Math.min(
    Math.max(options.maxPages ?? DEFAULT_MAX_PAGES, 1),
    200,
  );

  const maxDepth = Math.min(
    Math.max(options.maxDepth ?? DEFAULT_MAX_DEPTH, 0),
    5,
  );

  const normalizedStartUrl = normalizeUrl(startUrl);

  if (!normalizedStartUrl) {
    throw new Error("A valid HTTP or HTTPS website URL is required.");
  }

  const start = await assertPublicHttpUrl(normalizedStartUrl);
  const pages: CrawledPage[] = [];
  const failedUrls: string[] = [];
  const visitedUrls = new Set<string>();

  const requestQueue = await RequestQueue.open(`website-crawl-${randomUUID()}`);

  const crawler = new CheerioCrawler({
    requestQueue,

    maxRequestsPerCrawl: maxPages,
    maxCrawlDepth: maxDepth,
    maxRequestRetries: 2,

    maxConcurrency: 1,
    maxRequestsPerMinute: 30,
    sameDomainDelaySecs: 1,

    navigationTimeoutSecs: 30,
    requestHandlerTimeoutSecs: 45,

    respectRobotsTxtFile: true,

    preNavigationHooks: [
      async ({ request }, gotOptions) => {
        // Validate every queued URL immediately before requesting it.
        await assertPublicHttpUrl(request.url);
        // Do not automatically follow redirects to another URL.
        gotOptions.followRedirect = false;
      },
    ],

    postNavigationHooks: [
      async ({ request }) => {
        // Do not persist a page that ended up outside the submitted origin.
        const loadedUrl = request.loadedUrl;

        if (loadedUrl && new URL(loadedUrl).origin !== start.origin) {
          throw new Error("Cross-origin redirects are not allowed.");
        }
      },
    ],

    async requestHandler({ $, request, enqueueLinks, log }) {
      const currentUrl = normalizeUrl(request.loadedUrl ?? request.url);

      if (!currentUrl || visitedUrls.has(currentUrl)) {
        return;
      }

      visitedUrls.add(currentUrl);

      const contentType = request.headers?.["content-type"];

      // CheerioCrawler normally handles HTML, but keep the check explicit.
      if (
        typeof contentType === "string" &&
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml+xml")
      ) {
        return;
      }

      const page = extractPage($.html(), currentUrl);

      if (page) {
        pages.push(page);
        log.info(`Extracted page: ${currentUrl}`);
      }

      const currentDepth = Number(request.userData.depth ?? 0);

      if (currentDepth >= maxDepth || pages.length >= maxPages) {
        return;
      }

      await enqueueLinks({
        strategy: "same-domain",

        transformRequestFunction: (nextRequest) => {
          const nextUrl = normalizeUrl(nextRequest.url);

          if (!nextUrl) {
            return null;
          }

          const parsedNextUrl = new URL(nextUrl);

          // Keep the crawl on the exact origin, not just the same domain.
          if (parsedNextUrl.origin !== start.origin) {
            return null;
          }

          if (IGNORED_EXTENSIONS.test(parsedNextUrl.pathname)) {
            return null;
          }

          nextRequest.url = nextUrl;
          nextRequest.userData = {
            ...nextRequest.userData,
            depth: currentDepth + 1,
          };

          return nextRequest;
        },
      });
    },

    failedRequestHandler({ request, log }) {
      failedUrls.push(request.url);
      log.warning(`Failed to crawl: ${request.url}`);
    },
  });

  try {
    await crawler.run([
      {
        url: start.toString(),
        userData: { depth: 0 },
      },
    ]);
  } finally {
    await requestQueue.drop();
  }

  return {
    pages,
    failedUrls,
  };
}
