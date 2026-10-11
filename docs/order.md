# Product implementation order

This is the recommended build sequence for turning the Altos idea into a production-ready AI support SaaS.

## Recommended priority order

1. Workspace foundation
   - root configuration
   - Turborepo setup
   - TypeScript configuration
   - linting and formatting

2. Database layer
   - Drizzle schema
   - relations and migrations
   - Neon connection setup
   - seed scripts

3. API foundation and authentication
   - organizations
   - memberships
   - agents
   - tenant authorization

4. AI core package
   - document normalization
   - chunking
   - embeddings
   - vector retrieval
   - answer generation

5. Knowledge ingestion pipeline
   - source models
   - Firecrawl integration
   - BullMQ queues
   - worker processors
   - progress tracking

6. Dashboard and widget experience
   - agent playground first
   - then publicly embeddable chat

7. SaaS production features
   - billing
   - usage limits
   - analytics
   - support workflows
   - CI/CD
   - monitoring

## Implementation roadmap

### Phase 1 — Monorepo and database foundation

Start with the project shell and data layer.

Goals:
- set up Turborepo and workspace tooling
- create `apps/web`, `apps/api`, and `packages/database`
- configure Neon and Drizzle
- build the schema for users, organizations, agents, sources, and usage records
- implement authentication and organization scaffolding

Outcome:
Users can sign up, create an organization, and begin building a workspace.

### Phase 2 — AI agent and knowledge base

Add the intelligence layer for the product.

Goals:
- create and configure agents
- support website URLs, PDFs, and text sources
- scrape and extract content
- chunk documents
- generate embeddings
- store them in pgvector

Outcome:
Each agent has searchable, grounded knowledge.

### Phase 3 — RAG chat experience

Build the actual conversational layer.

Goals:
- retrieve relevant document chunks
- generate answers with an LLM
- add streaming responses and source citations
- create a dashboard playground for testing agents

Outcome:
A working AI support chatbot is available inside the product.

### Phase 4 — Background jobs and ingestion workers

Move heavy processing out of the request lifecycle.

Goals:
- add Redis and BullMQ
- move scraping, processing, and embedding jobs into workers
- handle retries, failures, and job status tracking

Outcome:
Knowledge ingestion becomes scalable, asynchronous, and production-friendly.

### Phase 5 — Embeddable widget

Expose the AI assistant to customer websites.

Goals:
- build a standalone React widget with Vite
- load it through a JavaScript snippet
- connect it to the public chat API
- enforce allowed-domain checks and rate limiting

Outcome:
Customers can install the chatbot on their websites with minimal setup.

### Phase 6 — Production SaaS features

Turn the prototype into a product-ready SaaS business.

Goals:
- add Stripe subscriptions and usage limits
- include conversation history and analytics
- configure CI/CD, logging, monitoring, and deployment

Outcome:
A deployable, production-scale SaaS product.

## Recommended build strategy

A good implementation order is:

1. foundation
2. auth + tenant model
3. database + schema
4. AI data pipeline
5. chat and retrieval
6. async workers
7. widget
8. billing and analytics

This order keeps the architecture stable while reducing the risk of building the AI layer before the product foundation is ready.

## Summary

The project should be built in phases rather than all at once. Start with the monorepo, data layer, and authentication, then add knowledge ingestion and AI retrieval, and only after that move to widgets, background jobs, and SaaS-scale operational features.
