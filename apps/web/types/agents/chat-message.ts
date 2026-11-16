export type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};
