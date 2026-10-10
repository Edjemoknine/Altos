```bash
ai-support-saas/
├── apps/
│   ├── api/                      # Hono.js Backend Server
│   │   ├── src/
│   │   │   ├── config/           # App config, env validation
│   │   │   ├── middlewares/      # Auth verification, rate-limiting, CORS
│   │   │   ├── routes/           # API Endpoints
│   │   │   │   ├── agents.ts     # CRUD for AI voice/text agents
│   │   │   │   ├── chat.ts       # Text & Voice streaming / LLM interaction
│   │   │   │   ├── knowledge.ts  # RAG processing (website scraping, .txt ingestion)
│   │   │   │   └── widgets.ts    # Widget script generation & API key checks
│   │   │   ├── services/         # Business logic layer
│   │   │   │   ├── hf.service.ts # Hugging Face inference & embedding client
│   │   │   │   └── rag.service.ts# Chunking, vector storage, and context retrieval
│   │   │   ├── utils/            # Token counters, error handlers
│   │   │   └── index.ts          # Hono entry point (Bun / Node / Node-server)
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                      # Next.js SaaS Dashboard & Landing Page
│   │   ├── src/
│   │   │   ├── app/              # App Router (Dashboard, Agents, Settings, Billing)
│   │   │   ├── components/       # Dashboard UI & shadcn/ui elements
│   │   │   ├── hooks/            # Custom React hooks (voice recorder, agent state)
│   │   │   ├── lib/              # API client (Hono RPC / fetch helpers)
│   │   │   └── styles/           # Global CSS & Tailwind configs
│   │   ├── package.json
│   │   └── next.config.ts
│   │
│   └── widget/                   # Embeddable Chat + Voice Widget (Vite + React/Preact)
│       ├── src/
│       │   ├── components/       # Floating bubble, chat window, audio visualizer
│       │   ├── hooks/            # Speech-to-text & TTS audio playback handlers
│       │   ├── widget.tsx        # Entry point compiled into a single script.js tag
│       │   └── index.css
│       ├── vite.config.ts        # Configured to bundle into a standalone script
│       └── package.json
│
├── packages/
│   ├── auth/                     # Better-Auth configuration & shared auth client
│   │   ├── src/
│   │   │   ├── config.ts         # Better-auth setup with Neon adapter
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── db/                       # Drizzle ORM + Neon Database Package
│   │   ├── src/
│   │   │   ├── schema/           # Database tables (Users, Agents, Knowledge, Conversations, Tokens)
│   │   │   │   ├── users.ts
│   │   │   │   ├── agents.ts
│   │   │   │   ├── knowledge.ts
│   │   │   │   └── conversations.ts
│   │   │   ├── index.ts          # Neon client & Drizzle instance export
│   │   │   └── migrate.ts        # Migration runner
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── typescript-config/        # Shared tsconfig bases
│   └── ui/                       # Shared UI primitives (optional, or use app-level shadcn)
│
├── package.json                  # Root monorepo manager (pnpm / turbo)
├── turbo.json                    # Turborepo build & dev pipeline config
└── pnpm-workspace.yaml
```