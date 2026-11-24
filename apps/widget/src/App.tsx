import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@repo/ui/components/button";
import { Card } from "@repo/ui/components/card";

import { ChatForm } from "./components/ChatForm";
import { AgentLogo, ChatHeader } from "./components/ChatHeader";
import { ChatMessages } from "./components/ChatMessages";
import { getApiUrl, getHeaders, getVisitorId } from "./helpers";
import { getWidgetConfig, restoreConversation } from "./services/chat.service";
import type {
  WidgetConfig,
  WidgetCredentials,
  WidgetUIMessage,
} from "./types/widget";

const params = new URLSearchParams(window.location.search);
const credentials: WidgetCredentials = {
  apiKey: params.get("apiKey") ?? "",
  customerOrigin: params.get("customerOrigin") ?? "",
  publicId: params.get("agentId") ?? "",
};
const API_URL = getApiUrl(import.meta.env.VITE_API_URL);

export default function App() {
  const [open, setOpen] = useState(false);
  const [agentConfig, setAgentConfig] = useState<WidgetConfig | null>(null);

  const visitorId = useMemo(
    () => getVisitorId(`ai-widget:visitor:${credentials.publicId}`),
    [],
  );
  const [conversationId, setConversationId] = useState<string>();
  const [isRestoring, setIsRestoring] = useState(true);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_URL}/api/chat/${encodeURIComponent(credentials.publicId)}/messages`,
        headers: getHeaders(credentials),
        prepareSendMessagesRequest: ({ messages }) => {
          const lastMessage = messages[messages.length - 1];
          const message =
            lastMessage?.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("")
              .trim() ?? "";

          return {
            body: {
              visitorId,
              conversationId,
              message,
            },
          };
        },
      }),
    [visitorId, conversationId],
  );

  const { messages, sendMessage, setMessages, status, error } =
    useChat<WidgetUIMessage>({
      transport,
      onData: (data) => {
        if (data.type === "data-conversation") {
          setConversationId(data.data.conversationId);
        }
      },
    });

  const isStreaming = status === "submitted" || status === "streaming";
  const isLoading = isRestoring || isStreaming;

  useEffect(() => {
    const controller = new AbortController();

    async function loadConfig() {
      try {
        const config = await getWidgetConfig(credentials, controller.signal);

        if (!controller.signal.aborted) {
          setAgentConfig(config);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load agent configuration:", error);
        }
      }
    }

    void loadConfig();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConversation() {
      try {
        const result = await restoreConversation(
          credentials,
          visitorId,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        if (result.conversation) {
          setConversationId(result.conversation.id);
        }

        const restoredMessages: WidgetUIMessage[] = result.messages.map(
          (message) => ({
            id: message.id,
            role: message.role,
            parts: [
              {
                type: "text" as const,
                text: message.content,
              },
              ...(message.role === "assistant" &&
              Array.isArray(message.sources) &&
              message.sources.length > 0
                ? [
                    {
                      type: "data-sources" as const,
                      data: message.sources,
                    },
                  ]
                : []),
            ],
          }),
        );

        setMessages(restoredMessages);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error("Conversation restoration failed:", error);
      } finally {
        if (!controller.signal.aborted) {
          setIsRestoring(false);
        }
      }
    }

    void loadConversation();

    return () => controller.abort();
  }, [visitorId, setMessages]);

  useEffect(() => {
    window.parent.postMessage({ type: "ai-widget:toggle", open }, "*");
  }, [open]);

  function handleSendMessage(message: string) {
    void sendMessage({ text: message });
  }

  return (
    <div className="relative h-screen w-full overflow-hidden p-1">
      <Card
        aria-hidden={!open}
        className={`absolute inset-0 flex h-full w-full flex-col gap-0 rounded-2xl bg-white py-0 text-[#17221b] shadow-[0_8px_28px_rgba(23,34,27,0.12)] ring-1 ring-[#e7eae3] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-[0.98] opacity-0"
        }`}
        data-state={open ? "open" : "closed"}
        inert={!open}
      >
        <ChatHeader
          agentConfig={agentConfig}
          onClose={() => setOpen(false)}
        />
        <ChatMessages
          error={error?.message}
          isRestoring={isRestoring}
          isStreaming={isStreaming}
          isSubmitted={status === "submitted"}
          messages={messages}
        />
        <ChatForm disabled={isLoading} onSendMessage={handleSendMessage} />
      </Card>

      {!open && (
        <Button
          aria-label="Open chat"
          className="absolute bottom-1 right-1 size-14 rounded-full bg-[#17221b] text-lg text-white shadow-[0_4px_14px_rgba(23,34,27,0.22)] transition-[opacity,transform] duration-200 hover:bg-[#304536] motion-reduce:transition-none"
          onClick={() => setOpen(true)}
          size="icon"
          type="button"
          variant="default"
        >
          <AgentLogo agentConfig={agentConfig} className="size-10" />
        </Button>
      )}
    </div>
  );
}
