# Tech stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query

## Backend

- Hono API
- PostgreSQL
- Drizzle ORM
- Neon
- Authentication: Better Auth + Clerk
- Stripe

## AI and data

- OpenAI Embeddings or HuggingFace inference
- pgvector
- PostgreSQL

## Scraping and background jobs

- Firecrawl
- Redis
- BullMQ
- Worker
- Inngest (alternative/background orchestration option)

## Summary

This stack is designed for a modern AI SaaS product with:

- a dashboard and landing page,
- a secure backend API,
- RAG-powered document retrieval,
- web crawling and source ingestion,
- asynchronous jobs and queue processing.

```bash
                 FRONTEND
                    │
             Next.js + TS
                    │
             Tailwind/shadcn
                    │
              TanStack Query
                    │
                    ▼
              Hono API
                    │
        ┌───────────┼────────────┐
        │           │            │
        ▼           ▼            ▼
   PostgreSQL     Redis       OpenAI
   + pgvector    BullMQ
        │           │
        │           ▼
        │         Workers
        │           │
        │      ┌────┴────┐
        │      │         │
        │  Firecrawl   Embeddings
        │
        ▼
     Knowledge
       Base
```

and

```bash
Authentication → Clerk
Payments       → Stripe
Deployment     → Vercel + worker hosting
Database       → Neon
Redis          → Upstash
Scraping       → Firecrawl
AI             → OpenAI
```
