# Product timeline

This roadmap outlines a practical delivery plan for building Altos as an AI customer support SaaS product.

## Phase 1 — Foundation and workspace setup

Timeline: Week 1

Goals:
- initialize the monorepo structure
- configure Turborepo, TypeScript, linting, and formatting
- create the `apps/web` and `apps/api` workspaces
- add shared package scaffolding for config and UI

Deliverables:
- working monorepo setup
- consistent tooling across apps
- base project structure ready for product features

## Phase 2 — Data layer and auth foundation

Timeline: Week 2

Goals:
- configure Neon and Drizzle
- define the database schema for users, organizations, agents, and sources
- implement authentication and tenant-level access patterns
- create migration and seed scripts

Deliverables:
- database-ready project foundation
- users can sign up and create an organization
- secure multi-tenant base model

## Phase 3 — AI agent and knowledge ingestion

Timeline: Weeks 3–4

Goals:
- create agent configuration and workspace settings
- support website URLs, PDFs, and text document sources
- integrate scraping and content extraction
- normalize content and split it into chunks
- generate embeddings and store them in pgvector

Deliverables:
- searchable knowledge base per agent
- automatic ingestion pipeline for web and document sources
- vectorized memory layer for RAG

## Phase 4 — Retrieval-augmented chat

Timeline: Weeks 5–6

Goals:
- build the conversation flow for AI support agents
- retrieve relevant document chunks
- generate grounded answers with an LLM
- add source citations and streaming responses
- create a dashboard playground for testing chat behavior

Deliverables:
- working agent support chatbot
- real-time question answering grounded in business data
- internal testing environment for prompt and retrieval tuning

## Phase 5 — Async jobs and reliability

Timeline: Weeks 6–7

Goals:
- add Redis and BullMQ
- move ingestion tasks into background workers
- track job progress, retries, and failures
- monitor queue health and task execution

Deliverables:
- reliable asynchronous knowledge processing
- better uptime and resilience for long-running jobs
- scalable ingestion architecture

## Phase 6 — Embeddable customer widget

Timeline: Week 8

Goals:
- build the standalone widget frontend
- create a script-based installation flow
- connect it to the public chat API
- add domain validation and rate limiting

Deliverables:
- embeddable AI assistant for customer websites
- secure and lightweight installation experience
- usable widget for live support scenarios

## Phase 7 — SaaS-ready product features

Timeline: Weeks 9–10

Goals:
- add subscriptions and billing logic
- implement usage metering and plan limits
- create analytics and conversation history
- add deployment readiness checks

Deliverables:
- monetization-ready SaaS product
- usage tracking and billing controls
- improved visibility into platform performance

## Phase 8 — Launch and optimization

Timeline: Weeks 11–12

Goals:
- configure CI/CD and monitoring
- complete deployment pipeline
- validate performance and reliability
- tune prompts, retrieval quality, and UX

Deliverables:
-production-ready deployment pipeline
- measurable AI support experience
- strong base for customer onboarding and iteration

## Summary

This timeline keeps the roadmap realistic and delivery-focused:

1. build the foundation
2. create the data and authentication layer
3. add the AI knowledge system
4. ship the chat experience
5. make it scalable and embeddable
6. finalize the SaaS layer for launch

This sequence reduces technical risk and ensures each phase produces a usable product milestone.
