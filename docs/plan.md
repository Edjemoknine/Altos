# The build stages:

## Phase 1 — SaaS foundation

Build:

```bash
Next.js
Auth
Organizations
Dashboard
Agents CRUD
PostgreSQL
Drizzle
```

<i>Goal</i>:
User can sign up and create an AI agent.

## Phase 2 — Knowledge

Implement:

```bash
Add URL
Add PDF
Add text
```

Initially don't even use queues.
Get this working:

```bash
source
 ↓
document
 ↓
chunk
 ↓
embedding
 ↓
pgvector
```

Goal:
Agent has a knowledge base.

## Phase 3 — RAG

Build:

```bash
POST /chat

Pipeline:

question
 ↓
embedding
 ↓
similarity search
 ↓
top K chunks
 ↓
prompt
 ↓
OpenAI
 ↓
stream response
```

Goal:
Agent answers questions using its knowledge.

## Phase 4 — Background jobs

Now introduce:

```bash
Redis
BullMQ
Worker
```

Move:

```bash
scraping
chunking
embedding
```

into workers.

Goal:
Large ingestion jobs don't block your API.

## Phase 5 — Website widget

Build:

```bash
widget.js
```

Customer copies:

```bash
<script
  src="https://yourapp.com/widget.js"
  data-agent-id="agent_xxx">
</script>
```

Goal:
Anyone can embed the chatbot.

## Phase 6 — SaaS features

Add:

```bash
Stripe
Usage limits
Plans
Analytics
Conversations
Team members
Agent customization
```

Goal:
It looks like an actual SaaS product.

## Phase 7 — Advanced AI

Then you can add:

```bash
conversation memory
tool calling
human handoff
lead collection
sentiment detection
multilingual responses
FAQ generation
source citations
automatic re-crawling
scheduled knowledge updates
```

And eventually:

```bash
AI agent
   │
   ├── search knowledge
   ├── check order
   ├── create support ticket
   ├── collect email
   └── transfer to human
```

At that point it becomes much more than a basic RAG chatbot.
