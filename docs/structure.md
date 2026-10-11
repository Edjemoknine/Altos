# Project structure

This repository is a lightweight monorepo built for an AI customer support SaaS prototype. The current implementation is intentionally focused and modular, with separate application and shared package boundaries.

## Current repository layout

```bash
Altos/
├── apps/
│   ├── api/                       # Hono backend API
│   │   ├── src/
│   │   │   └── index.ts          # API entry point and /api/health route
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── pnpm-lock.yaml
│   │
│   └── web/                      # Next.js marketing + product frontend
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── page.module.css
│       ├── lib/
│       │   └── client.ts
│       ├── public/
│       │   ├── file-text.svg
│       │   ├── globe.svg
│       │   ├── next.svg
│       │   ├── turborepo-dark.svg
│       │   ├── turborepo-light.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       ├── README.md
│       ├── eslint.config.js
│       ├── next.config.js
│       ├── next-env.d.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── .gitignore
│
├── packages/
│   ├── eslint-config/            # Shared ESLint rules
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── react-internal.js
│   │   ├── README.md
│   │   └── package.json
│   │
│   ├── typescript-config/         # Shared TypeScript configs
│   │   ├── base.json
│   │   ├── nextjs.json
│   │   ├── react-library.json
│   │   └── package.json
│   │
│   └── ui/                        # Shared UI components
│       ├── src/
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   └── code.tsx
│       ├── eslint.config.mjs
│       ├── package.json
│       └── tsconfig.json
│
├── .gitignore
├── .npmrc
├── .turbo/
├── AGENTS.md
├── README.md
├── README_STARTER.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── docs/
│   ├── scraping.md
│   ├── stacks.md
│   ├── structure.md
│   └── workflow.md
└── node_modules/
```

## Application responsibilities

### apps/api

The API layer is a small Hono-based backend that currently exposes a health check route and acts as the foundation for future agent, chat, and ingestion functionality.

Current structure:

- `src/index.ts` creates the API instance and exports the app type
- `app.get("/health")` returns a simple JSON status response
- This keeps the backend minimal while allowing future expansion into routes for:
  - agents
  - conversations
  - support widgets
  - knowledge ingestion
  - billing and usage tracking

### apps/web

The web app is a Next.js frontend that currently serves a polished landing page for the Altos product concept.

Current structure:

- `app/layout.tsx` defines the root layout and metadata
- `app/page.tsx` renders the main product marketing page
- `app/page.module.css` contains local styling for the landing page
- `lib/client.ts` provides a frontend client helper for API communication

This app is a strong starting point for a SaaS dashboard and customer-facing marketing experience.

### packages/ui

The UI package exposes reusable frontend primitives like buttons, cards, and code blocks. This keeps supporting components consistent across apps while staying isolated from the application layer.

### packages/eslint-config and packages/typescript-config

These packages define the shared linting and TypeScript standards used across the monorepo.

## Architecture direction

The current repository is intentionally simple, but it follows a clean product architecture:

- `apps/web` handles the user-facing dashboard and marketing experience
- `apps/api` handles backend services and request processing
- `packages/ui` centralizes reusable UI components
- `packages/*-config` keeps development standards consistent across the repo

This modular structure is ready to grow into a fuller AI support product with:

- customer authentication
- multi-tenant workspaces
- vector-backed knowledge retrieval
- document ingestion and website crawling
- background workers and job queues
- chat and widget integrations

## Relationship between the product and the repo structure

The repo already reflects the planned SaaS model at a high level:

- A web app for customers and product teams
- An API app for business logic and integrations
- Shared packages for reusable code and standards

This is a strong base for a future architecture that may include:

- agent management endpoints
- knowledge source ingestion
- vector storage powered by pgvector
- Redis and queue workers
- widget embedding and analytics

## Summary

The repository is currently in an MVP / foundation phase. It has the right monorepo shape for a SaaS product, but the product logic is still being scaffolded. The structure is organized to support expansion without needing a large refactor later.
