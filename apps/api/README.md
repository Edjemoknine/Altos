# Altos API

The API layer for the Altos platform is a lightweight Hono-based service that powers the core SaaS experience: onboarding, agent configuration, document ingestion, retrieval-augmented chat, and deployment-ready integrations.

## Overview

This backend provides the foundation for a multi-tenant AI assistant platform where business owners can:

- create and manage agent profiles
- configure conversational behavior and role definitions
- upload or scrape domain knowledge for retrieval
- generate secure API credentials for front-end embedding
- serve customer-facing interactions through a hosted widget
- monitor usage, billing, and analytics over time

## Core user workflow

1. User authentication and onboarding  
   Business owners create an account, verify their email, and sign in to a personalized dashboard.

2. Agent creation and customization  
   Users configure the agent's name, purpose, persona, and tone to match their brand and support needs.

3. Knowledge base ingestion  
   Domain context is added by uploading files or scraping website content so the model can answer against business-specific knowledge.

4. API key generation  
   A secure key is created for each client-agent pair and used to authenticate widget traffic.

5. Widget embedding and deployment  
   The client inserts a widget script into their website and connects it to the generated API key.

6. Real-time interaction  
   Visitors can chat via text or voice, with speech converted to text, processed through the model, and returned as a spoken response when needed.

7. Analytics and monitoring  
   The system tracks conversations, token usage, route activity, and billing metrics to support performance and operational visibility.

## Project structure

```bash
apps/api/
├── src/
│   ├── index.ts                 # Hono app entry point and route registration
│   ├── config/                  # Runtime configuration and environment helpers
│   │   └── env.ts
│   ├── db/                      # Database access and schema definitions
│   │   ├── client.ts
│   │   └── schema.ts
│   ├── middleware/              # Auth, validation, and shared request logic
│   │   ├── auth.ts
│   │   └── validator.ts
│   ├── modules/                 # Feature-oriented modules
│   │   ├── agents/
│   │   │   ├── agents.routes.ts
│   │   │   └── agents.service.ts
│   │   ├── ingestion/
│   │   │   ├── ingestion.routes.ts
│   │   │   └── ingestion.service.ts
│   │   └── chat/
│   │       ├── chat.routes.ts
│   │       └── chat.service.ts
│   └── services/                # External service adapters and domain utilities
│       ├── scraper.service.ts
│       ├── parser.service.ts
│       └── embedding.service.ts
├── package.json
├── tsconfig.json
├── pnpm-lock.yaml
└── README.md
```

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Run the compiled output:

```bash
pnpm start
```

## Scripts

- `pnpm dev` — runs the app with tsx in watch mode
- `pnpm build` — compiles TypeScript to the `dist` directory
- `pnpm start` — serves the built app from `dist`

## Notes

This service is designed as a scalable backend foundation for an AI-driven customer support platform. The initial structure is intentionally modular so that auth, storage, retrieval, embeddings, and analytics can be added incrementally without disrupting the application architecture.
