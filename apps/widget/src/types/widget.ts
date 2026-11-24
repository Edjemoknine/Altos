import { type UIMessage } from "ai";

export type WidgetCredentials = {
  publicId: string;
  apiKey: string;
  customerOrigin: string;
};

export type PublicChatSource = {
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
  sources: PublicChatSource[] | null;
  createdAt: string;
};

export type WidgetConfig = {
  name: string;
  logoUrl: string | null;
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

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

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
