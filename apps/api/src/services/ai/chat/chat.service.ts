import { AIMessage, HumanMessage } from "@langchain/core/messages";

import { chatModel } from "../models/chat-model.ts";
import { retrieveRelevantChunks } from "../retrieval/retrieval.service.ts";
import { buildChatPrompt } from "../retrieval/prompt.ts";

import {
  createConversation,
  getConversationHistory,
  getVisitorConversation,
} from "../chat/conversation.service.ts";

import { createMessage } from "../chat/message.service.ts";

import type { MessageSource } from "../../../db/schema.ts";
import { getActiveAgentByPublicId } from "./agent-chat.service.ts";

const MAX_MESSAGE_LENGTH = 4000;

export type SendChatMessageInput = {
  publicId: string;
  visitorId: string;
  conversationId?: string;
  message: string;
  organizationId?: string;
};

export type ChatStreamEvent =
  | {
      type: "conversation";
      conversationId: string;
    }
  | {
      type: "sources";
      sources: MessageSource[];
    }
  | {
      type: "token";
      token: string;
    }
  | {
      type: "done";
      messageId: string;
    };

function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part: unknown) => {
      if (typeof part === "string") {
        return part;
      }

      if (
        typeof part === "object" &&
        part !== null &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }

      return "";
    })
    .join("");
}

function getAgentSettings(settings: Record<string, unknown>) {
  return {
    tone: typeof settings.tone === "string" ? settings.tone : "professional",

    targetWebsiteUrl:
      typeof settings.targetWebsiteUrl === "string"
        ? settings.targetWebsiteUrl
        : "",
  };
}

export async function* streamChatResponse({
  publicId,
  visitorId,
  conversationId,
  message,
  organizationId,
}: SendChatMessageInput): AsyncGenerator<ChatStreamEvent> {
  // 1. Validate the incoming message.
  const normalizedMessage = message.trim();

  if (!normalizedMessage) {
    throw new Error("Message cannot be empty");
  }

  if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Message exceeds the maximum allowed length");
  }

  // 2. Resolve the active agent.
  const agent = await getActiveAgentByPublicId(publicId, organizationId);

  if (!agent) {
    throw new Error("Agent not found or inactive");
  }

  // 3. Create or validate the conversation.
  let conversationIdToUse = conversationId;

  if (conversationIdToUse) {
    const conversation = await getVisitorConversation({
      conversationId: conversationIdToUse,
      agentId: agent.id,
      visitorId,
    });

    if (!conversation || conversation.status !== "active") {
      throw new Error("Conversation not found or closed");
    }
  } else {
    const conversation = await createConversation({
      organizationId: agent.organizationId,
      agentId: agent.id,
      visitorId,
      title: normalizedMessage.slice(0, 80),
    });

    conversationIdToUse = conversation.id;
  }

  yield {
    type: "conversation",
    conversationId: conversationIdToUse,
  };

  // 4. Load history BEFORE saving the current visitor message.
  const history = await getConversationHistory(conversationIdToUse);

  // 5. Persist the visitor message.
  await createMessage({
    conversationId: conversationIdToUse,
    role: "user",
    content: normalizedMessage,
  });

  // 6. Retrieve relevant knowledge-base chunks.
  const retrievedChunks = await retrieveRelevantChunks({
    organizationId: agent.organizationId,
    agentId: agent.id,
    query: normalizedMessage,
  });

  // 7. Build structured citations.
  const sources: MessageSource[] = retrievedChunks.map((chunk) => ({
    documentId: chunk.documentId,
    chunkId: chunk.chunkId,
    sourceId: chunk.sourceId,
    title: chunk.title,
    url: chunk.url,
    snippet: chunk.content.slice(0, 300),
  }));

  yield {
    type: "sources",
    sources,
  };

  // 8. Convert history into LangChain messages.
  const historyMessages = history.map((item) =>
    item.role === "user"
      ? new HumanMessage(item.content)
      : new AIMessage(item.content),
  );

  // 9. Build the RAG prompt.
  const settings = getAgentSettings(agent.settings);

  const prompt = await buildChatPrompt({
    agentName: agent.name,
    agentDescription: agent.description,
    instructions: agent.instructions,
    tone: settings.tone,
    targetWebsiteUrl: settings.targetWebsiteUrl,
    context: retrievedChunks,
  });

  const promptMessages = await prompt.formatMessages({
    history: historyMessages,
    question: normalizedMessage,
  });

  // 10. Stream the OpenAI response.
  let assistantResponse = "";

  const stream = await chatModel.stream(promptMessages);

  for await (const chunk of stream) {
    const token = extractText(chunk.content);

    if (!token) {
      continue;
    }

    assistantResponse += token;

    yield {
      type: "token",
      token,
    };
  }

  if (!assistantResponse.trim()) {
    throw new Error("The AI model returned an empty response");
  }

  // 11. Persist the completed assistant response.
  const assistantMessage = await createMessage({
    conversationId: conversationIdToUse,
    role: "assistant",
    content: assistantResponse,
    sources,
  });

  // 12. Notify the client that generation is complete.
  yield {
    type: "done",
    messageId: assistantMessage.id,
  };
}
