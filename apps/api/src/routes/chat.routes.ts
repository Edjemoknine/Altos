import { Hono } from "hono";

import {
  getWidgetConfig,
  restoreConversation,
  sendChatMessage,
} from "../controllers/chat.controller.ts";

import { widgetAuthMiddleware } from "../middlewares/widget-auth.middleware.ts";

const chatRoutes = new Hono();

chatRoutes.use("/:publicId/*", widgetAuthMiddleware);

chatRoutes.post("/:publicId/messages", sendChatMessage);

chatRoutes.post("/:publicId/conversations/restore", restoreConversation);

chatRoutes.get("/:publicId/config", getWidgetConfig);

export { chatRoutes };
