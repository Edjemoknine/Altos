# Product workflow

This AI support agent is a strong portfolio project because it combines SaaS architecture, multi-tenancy, RAG, web scraping, background jobs, AI, authentication, billing, and an embeddable frontend widget.

## End-to-end system flow

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

## Customer scenario

Imagine a customer signs up and says:

> "I have an e-commerce website and I want an AI support agent."

They create a new AI agent with the following setup:

```bash
Agent: MyShop Assistant

Website:
https://myshop.com

Knowledge:
✓ Website
✓ FAQ.pdf
✓ Returns.pdf

Personality:
Friendly and concise

Language:
English + French + Arabic

Widget:
Bottom-right
```

The application then generates a widget snippet:

```bash
<script
  src="https://yourapp.com/widget.js"
  data-agent-id="agent_123">
</script>
```

The business owner pastes this script into their site, and visitors can start chatting with the AI assistant directly on the storefront.

## Example visitor interaction

```bash
                         ┌─────────────────────┐
                         │ MyShop AI      ×    │
                         ├─────────────────────┤
                         │                     │
                         │ Hi! How can I help? │
                         │                     │
                         │ Can I return an     │
                         │ item after 30 days? │
                         │                     │
                         ├─────────────────────┤
                         │ Ask a question...   │
                         └─────────────────────┘
                                      ●
```

## Summary

The workflow is simple:

1. A user creates an agent.
2. The app ingests knowledge sources.
3. The content is processed and embedded.
4. A widget is generated for the customer website.
5. Visitors ask questions.
6. The AI retrieves relevant context and answers in real time.
