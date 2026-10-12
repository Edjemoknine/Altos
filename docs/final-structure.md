```bash

ai-support-saas/
├── apps/
│   ├── web/                         # Next.js SaaS dashboard
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (marketing)/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── pricing/page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── agents/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   │   └── [agentId]/
│   │   │   │   │   │       ├── layout.tsx
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       ├── knowledge/page.tsx
│   │   │   │   │   │       ├── playground/page.tsx
│   │   │   │   │       ├── conversations/page.tsx
│   │   │   │   │       ├── analytics/page.tsx
│   │   │   │   │       ├── settings/page.tsx
│   │   │   │   │       └── installation/page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   ├── organization/page.tsx
│   │   │   │   │   ├── members/page.tsx
│   │   │   │   │   ├── billing/page.tsx
│   │   │   │   │   └── usage/page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── globals.css
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   └── providers/
│   │   │   ├── features/
│   │   │   │   ├── agents/
│   │   │   │   │   ├── components/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── api/
│   │   │   │   │   └── utils/
│   │   │   │   ├── knowledge/
│   │   │   │   ├── conversations/
│   │   │   │   ├── analytics/
│   │   │   │   └── billing/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   └── env.ts
│   │   │   └── middleware.ts
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api/                         # Hono REST API
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── env.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── organization.ts
│   │   │   │   ├── rate-limit.ts
│   │   │   │   ├── error-handler.ts
│   │   │   │   └── request-id.ts
│   │   │   ├── routes/
│   │   │   │   ├── index.ts
│   │   │   │   ├── agents.ts
│   │   │   │   ├── sources.ts
│   │   │   │   ├── chat.ts
│   │   │   │   ├── conversations.ts
│   │   │   │   ├── contacts.ts
│   │   │   │   ├── organizations.ts
│   │   │   │   ├── billing.ts
│   │   │   │   ├── usage.ts
│   │   │   │   ├── widget.ts
│   │   │   │   └── webhooks.ts
│   │   │   ├── modules/
│   │   │   │   ├── agents/
│   │   │   │   │   ├── agent.service.ts
│   │   │   │   │   ├── agent.repository.ts
│   │   │   │   │   └── agent.routes.ts
│   │   │   │   ├── sources/
│   │   │   │   │   ├── source.service.ts
│   │   │   │   │   ├── source.repository.ts
│   │   │   │   │   └── source.routes.ts
│   │   │   │   ├── chat/
│   │   │   │   │   ├── chat.service.ts
│   │   │   │   │   └── chat.routes.ts
│   │   │   │   ├── conversations/
│   │   │   │   ├── organizations/
│   │   │   │   ├── contacts/
│   │   │   │   ├── billing/
│   │   │   │   ├── usage/
│   │   │   │   └── webhooks/
│   │   │   └── lib/
│   │   │       ├── logger.ts
│   │   │       └── errors.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── widget/                      # Embeddable chat widget
│   │   ├── src/
│   │   │   ├── entry.ts
│   │   │   ├── loader.ts
│   │   │   ├── iframe.ts
│   │   │   ├── client/
│   │   │   │   ├── App.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatWindow.tsx
│   │   │   │   │   ├── MessageList.tsx
│   │   │   │   │   ├── MessageInput.tsx
│   │   │   │   │   └── Launcher.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── styles/
│   │   │   └── lib/
│   │   │       ├── api.ts
│   │   │       └── config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── worker/                      # BullMQ worker process
│       ├── src/
│       │   ├── index.ts
│       │   ├── worker.ts
│       │   ├── queues/
│       │   │   ├── crawl.worker.ts
│       │   │   ├── document.worker.ts
│       │   │   ├── embedding.worker.ts
│       │   │   └── cleanup.worker.ts
│       │   ├── processors/
│       │   │   ├── crawl.processor.ts
│       │   │   ├── document.processor.ts
│       │   │   ├── embedding.processor.ts
│       │   │   └── cleanup.processor.ts
│       │   ├── services/
│       │   │   ├── crawler.service.ts
│       │   │   ├── document-parser.service.ts
│       │   │   └── ingestion.service.ts
│       │   ├── lib/
│       │   │   ├── logger.ts
│       │   │   └── shutdown.ts
│       │   └── env.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── database/                    # Drizzle schema and queries
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── users.ts
│   │   │   │   ├── organizations.ts
│   │   │   │   ├── memberships.ts
│   │   │   │   ├── invitations.ts
│   │   │   │   ├── plans.ts
│   │   │   │   ├── subscriptions.ts
│   │   │   │   ├── agents.ts
│   │   │   │   ├── sources.ts
│   │   │   │   ├── documents.ts
│   │   │   │   ├── chunks.ts
│   │   │   │   ├── contacts.ts
│   │   │   │   ├── conversations.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── usage-events.ts
│   │   │   │   └── index.ts
│   │   │   ├── relations.ts
│   │   │   ├── client.ts
│   │   │   ├── queries/
│   │   │   │   ├── agents.ts
│   │   │   │   ├── sources.ts
│   │   │   │   ├── documents.ts
│   │   │   │   ├── conversations.ts
│   │   │   │   └── chunks.ts
│   │   │   └── index.ts
│   │   ├── drizzle/
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   │
│   ├── ai/                          # Provider and AI orchestration
│   │   ├── src/
│   │   │   ├── providers/
│   │   │   │   ├── llm.provider.ts
│   │   │   │   └── embedding.provider.ts
│   │   │   ├── prompts/
│   │   │   │   ├── system.ts
│   │   │   │   └── answer.ts
│   │   │   ├── rag/
│   │   │   │   ├── retrieve.ts
│   │   │   │   ├── rerank.ts
│   │   │   │   ├── context.ts
│   │   │   │   └── generate.ts
│   │   │   ├── ingestion/
│   │   │   │   ├── chunk.ts
│   │   │   │   └── normalize.ts
│   │   │   ├── citations/
│   │   │   │   └── format-sources.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── queue/                       # Shared BullMQ definitions
│   │   ├── src/
│   │   │   ├── connection.ts
│   │   │   ├── queues.ts
│   │   │   ├── job-types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── validators/                  # Shared Zod schemas
│   │   ├── src/
│   │   │   ├── agents.ts
│   │   │   ├── sources.ts
│   │   │   ├── chat.ts
│   │   │   ├── organizations.ts
│   │   │   ├── billing.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api-client/                  # Typed API client for frontend
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                          # Shared dashboard UI
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config/                      # Shared tooling configurations
│   │   ├── eslint/
│   │   ├── typescript/
│   │   └── package.json
│   │
│   └── utils/                       # Environment-agnostic utilities
│       ├── src/
│       │   ├── ids.ts
│       │   ├── dates.ts
│       │   └── index.ts
│       └── package.json
│
├── tooling/
│   └── scripts/
│       ├── seed.ts
│       └── check-env.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .env.example
├── .gitignore
├── .npmrc
├── package.json
├── package-lock.json
├── turbo.json
├── tsconfig.json
└── README.md

```