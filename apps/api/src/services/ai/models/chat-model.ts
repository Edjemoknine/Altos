import { ChatOpenAI } from "@langchain/openai";

export const chatModel = new ChatOpenAI({
  model: "gpt-4.1-mini",
  temperature: 0.2,
});
