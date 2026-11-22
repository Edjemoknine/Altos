import { defineRelations } from "drizzle-orm";
import { account, session, user } from "./schemas/auth.ts";
import { agents } from "./schemas/agent.ts";
import { organization, member, invitation } from "./schemas/organization.ts";
import { sources } from "./schemas/source.ts";
import { documents } from "./schemas/document.ts";
import { documentChunks } from "./schemas/document-chunk.ts";
import { ingestionJobs } from "./schemas/ingestion-job.ts";
import { conversations } from "./schemas/conversations.ts";
import { messages } from "./schemas/messages.ts";
import { agentWidgetKeys } from "./schemas/agent-widget-key.ts";

export * from "./schemas/agent-widget-key.ts";
export * from "./schemas/auth.ts";
export * from "./schemas/agent.ts";
export * from "./schemas/organization.ts";
export * from "./schemas/source.ts";
export * from "./schemas/document.ts";
export * from "./schemas/document-chunk.ts";
export * from "./schemas/ingestion-job.ts";
export * from "./schemas/conversations.ts";
export * from "./schemas/messages.ts";

export const relations = defineRelations(
  {
    user,
    session,
    account,
    organization,
    member,
    invitation,
    agents,
    sources,
    documents,
    documentChunks,
    ingestionJobs,
    conversations,
    messages,
  },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      members: r.many.member({
        from: r.user.id,
        to: r.member.userId,
      }),
      invitations: r.many.invitation({
        from: r.user.id,
        to: r.invitation.inviterId,
      }),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    organization: {
      members: r.many.member({
        from: r.organization.id,
        to: r.member.organizationId,
      }),
      invitations: r.many.invitation({
        from: r.organization.id,
        to: r.invitation.organizationId,
      }),
      agents: r.many.agents(),
      sources: r.many.sources({
        from: r.organization.id,
        to: r.sources.organizationId,
      }),
      documents: r.many.documents({
        from: r.organization.id,
        to: r.documents.organizationId,
      }),
      documentChunks: r.many.documentChunks({
        from: r.organization.id,
        to: r.documentChunks.organizationId,
      }),
      ingestionJobs: r.many.ingestionJobs({
        from: r.organization.id,
        to: r.ingestionJobs.organizationId,
      }),
      conversations: r.many.conversations({
        from: r.organization.id,
        to: r.conversations.organizationId,
      }),
    },
    member: {
      organization: r.one.organization({
        from: r.member.organizationId,
        to: r.organization.id,
      }),
      user: r.one.user({ from: r.member.userId, to: r.user.id }),
    },
    invitation: {
      organization: r.one.organization({
        from: r.invitation.organizationId,
        to: r.organization.id,
      }),
      user: r.one.user({
        from: r.invitation.inviterId,
        to: r.user.id,
      }),
    },
    agents: {
      organization: r.one.organization({
        from: r.agents.organizationId,
        to: r.organization.id,
      }),
      sources: r.many.sources({
        from: r.agents.id,
        to: r.sources.agentId,
      }),
      documents: r.many.documents({
        from: r.agents.id,
        to: r.documents.agentId,
      }),
      documentChunks: r.many.documentChunks({
        from: r.agents.id,
        to: r.documentChunks.agentId,
      }),
      ingestionJobs: r.many.ingestionJobs({
        from: r.agents.id,
        to: r.ingestionJobs.agentId,
      }),
      conversations: r.many.conversations({
        from: r.agents.id,
        to: r.conversations.agentId,
      }),
    },
    sources: {
      organization: r.one.organization({
        from: r.sources.organizationId,
        to: r.organization.id,
      }),
      agent: r.one.agents({
        from: r.sources.agentId,
        to: r.agents.id,
      }),
      documents: r.many.documents({
        from: r.sources.id,
        to: r.documents.sourceId,
      }),
      ingestionJobs: r.many.ingestionJobs({
        from: r.sources.id,
        to: r.ingestionJobs.sourceId,
      }),
    },
    documents: {
      organization: r.one.organization({
        from: r.documents.organizationId,
        to: r.organization.id,
      }),
      agent: r.one.agents({
        from: r.documents.agentId,
        to: r.agents.id,
      }),
      source: r.one.sources({
        from: r.documents.sourceId,
        to: r.sources.id,
      }),
      chunks: r.many.documentChunks({
        from: r.documents.id,
        to: r.documentChunks.documentId,
      }),
    },
    documentChunks: {
      organization: r.one.organization({
        from: r.documentChunks.organizationId,
        to: r.organization.id,
      }),
      agent: r.one.agents({
        from: r.documentChunks.agentId,
        to: r.agents.id,
      }),
      document: r.one.documents({
        from: r.documentChunks.documentId,
        to: r.documents.id,
      }),
    },
    ingestionJobs: {
      organization: r.one.organization({
        from: r.ingestionJobs.organizationId,
        to: r.organization.id,
      }),
      agent: r.one.agents({
        from: r.ingestionJobs.agentId,
        to: r.agents.id,
      }),
      source: r.one.sources({
        from: r.ingestionJobs.sourceId,
        to: r.sources.id,
      }),
    },
    conversations: {
      organization: r.one.organization({
        from: r.conversations.organizationId,
        to: r.organization.id,
      }),
      agent: r.one.agents({
        from: r.conversations.agentId,
        to: r.agents.id,
      }),
      messages: r.many.messages({
        from: r.conversations.id,
        to: r.messages.conversationId,
      }),
    },
    messages: {
      conversation: r.one.conversations({
        from: r.messages.conversationId,
        to: r.conversations.id,
      }),
    },
  }),
);
