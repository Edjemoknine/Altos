# Scraping workflow

This is the recommended way to ingest a website without blocking the user request.

Suppose a customer submits the following URL:

```bash
https://example.com
```

The API should not perform the scrape inline during the request. Instead, it should enqueue a background job and return immediately.

## Recommended flow

1. Receive the source URL.
2. Create the source record in the database.
3. Add a queue job for background processing.
4. Return a fast success response to the user.
5. A worker processes the job asynchronously.
6. Firecrawl fetches and extracts the website content.
7. The content is cleaned into markdown.
8. The markdown is chunked and embedded.
9. The vectors are stored in pgvector for retrieval.

```bash
POST /agents/:id/sources

             │
             ▼

        Create Source
             │
             ▼
       Add Queue Job
             │
             ▼
       Return immediately
             │
             │
             ▼
      ┌─────────────┐
      │    Redis    │
      │    Queue    │
      └──────┬──────┘
             │
             ▼
        Worker picks job
             │
             ▼
        Firecrawl
             │
             ▼
       Website pages
             │
             ▼
       Clean Markdown
             │
             ▼
           Chunk
             │
             ▼
         Embeddings
             │
             ▼
          pgvector
```

## Why this matters

- Keeps the API responsive.
- Prevents long-running scraping work from blocking user requests.
- Makes ingestion more reliable and easier to scale.
- Allows retries, rate limiting, and monitoring in the background worker layer.
