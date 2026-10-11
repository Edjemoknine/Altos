# Altos

Altos is an AI support SaaS platform that helps businesses deploy intelligent customer support agents powered by retrieval-augmented generation (RAG), website knowledge ingestion, and embeddable chat widgets.

The product combines a modern SaaS dashboard, backend AI services, a customer-facing widget, and a scalable ingestion pipeline for website content and documents.

## Why this project matters

This project demonstrates a production-style architecture for building AI-powered customer support systems with:

- Multi-tenant SaaS foundations
- Authentication and authorization
- Subscription and billing flows
- Web crawling and document ingestion
- RAG-powered search and answer generation
- Vector similarity search with PostgreSQL + pgvector
- Embeddings and LLM interaction
- Background jobs and Redis-based queue workers
- Usage metering and rate limiting
- Embeddable JavaScript widget integration
- Job progress tracking and analytics

## Core features

- Create and manage AI agents per customer or tenant
- Connect website URLs and document sources such as PDF, DOCX, and text files
- Crawl and process website content asynchronously
- Clean and chunk documents before embedding
- Store and retrieve context using vector search
- Answer customer questions with grounded LLM responses
- Provide a widget that can be embedded on any website
- Give teams a dashboard to manage sources, conversations, and analytics

## Tech stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query

### Backend

- Hono API
- PostgreSQL
- Drizzle ORM
- Neon
- Better Auth + Clerk

### AI and data

- OpenAI Embeddings or HuggingFace inference
- pgvector
- PostgreSQL

### Scraping and background jobs

- Firecrawl
- Redis
- BullMQ
- Worker
- Inngest

## Architecture overview

```bash
                     ┌─────────────────────┐
                     │   Your SaaS App     │
                     │                     │
                     │ Sign up / Billing   │
                     │ Create AI Agent     │
                     │ Manage Knowledge    │
                     │ Customize Widget    │
                     └──────────┬──────────┘
                                │
                         Create Agent
                                │
                    ┌───────────▼──────────┐
                    │    Knowledge Base    │
                    │                      │
                    │ Website URL           │
                    │ PDF / DOCX / TXT      │
                    │ Manual text           │
                    └───────────┬──────────┘
                                │
                          Background Job
                                │
                    ┌───────────▼──────────┐
                    │       Worker         │
                    │                      │
                    │ Crawl website        │
                    │ Clean content        │
                    │ Chunk documents      │
                    │ Generate embeddings  │
                    │ Store vectors        │
                    └───────────┬──────────┘
                                │
                         Knowledge Base
                                │
          ┌─────────────────────┴────────────────────┐
          │                                          │
┌─────────▼─────────┐                      ┌─────────▼─────────┐
│   Dashboard       │                      │ Customer Website  │
│                   │                      │                   │
│ Test chatbot      │                      │ <script> widget   │
│ Sources           │                      │                   │
│ Conversations     │                      │                   │
│ Analytics         │                      │                   │
└───────────────────┘                      └─────────┬─────────┘
                                                     │
                                              User asks question
                                                     │
                                            ┌────────▼────────┐
                                            │ Your Chat API   │
                                            │                 │
                                            │ Retrieve docs   │
                                            │ → LLM           │
                                            │ → Answer        │
                                            └─────────────────┘
```

## Project structure

```bash
Altos/
├── apps/
│   ├── api/          # Hono.js backend API
│   ├── web/          # Next.js SaaS dashboard
│   └── widget/       # Embeddable chat widget
├── packages/
│   ├── auth/         # Auth utilities and configuration
│   ├── db/           # Drizzle + Neon database layer
│   ├── ui/           # Shared UI primitives
│   └── typescript-config/
├── docs/
│   ├── scraping.md
│   ├── stacks.md
│   ├── structure.md
│   └── workflow.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
└── README.md
```

## Documentation

The repository includes detailed project documentation in the docs directory:

- [docs/scraping.md](./docs/scraping.md) — website ingestion and scraping workflow
- [docs/stacks.md](./docs/stacks.md) — technologies used across the platform
- [docs/structure.md](./docs/structure.md) — product and architecture overview
- [docs/workflow.md](./docs/workflow.md) — end-to-end product workflow

## Getting started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL with pgvector support
- Redis
- Access to an AI provider such as OpenAI or Hugging Face

### Install dependencies

```bash
pnpm install
```

### Run the monorepo in development mode

```bash
pnpm dev
```

### Build the project

```bash
pnpm build
```

### Lint and type-check

```bash
pnpm lint
pnpm check-types
```

## Typical product workflow

1. A user creates an AI support agent.
2. The system ingests website or document knowledge.
3. Background workers process and embed the content.
4. A widget is generated for the customer website.
5. Visitors ask questions in the widget.
6. The app retrieves relevant context and responds with an LLM-backed answer.

## License

This project is a portfolio and product prototype. Update the license file or licensing terms based on your distribution requirements.

## Summary

Altos is a practical example of how to combine modern infrastructure, AI retrieval, and customer-facing product design into a single SaaS experience. It is well suited for portfolio, demo, or MVP purposes and demonstrates real-world AI product architecture.
