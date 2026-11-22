export type WidgetCredentials = {
  publicId: string;
  apiKey: string;
  customerOrigin: string;
};

export type MessageSource = {
  documentId: string;
  chunkId: string;
  sourceId: string;
  title: string;
  url: string | null;
  snippet: string;
};

export type WidgetMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: MessageSource[] | null;
  createdAt: string;
};

export type WidgetConversation = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type RestoreConversationResult = {
  conversation: WidgetConversation | null;
  messages: WidgetMessage[];
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
    }
  | {
      type: "error";
      message: string;
    };

export type SendChatMessageInput = {
  conversationId?: string;
  message: string;
  signal?: AbortSignal;
  onEvent: (event: ChatStreamEvent) => void;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type PublicChatSource = {
  documentId: string;
  chunkId: string;
  sourceId: string;
  title: string;
  url: string | null;
  snippet: string;
};
import { type UIMessage } from "ai";

export type WidgetUIMessage = UIMessage<
  never,
  {
    conversation: {
      conversationId: string;
    };
    sources: PublicChatSource[];
    messageId: {
      messageId: string;
    };
  }
>;
