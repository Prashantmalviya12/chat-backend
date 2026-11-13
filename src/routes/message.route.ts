import { Router } from "express";
import { messageController } from "../controllers/message.controller.js";
const router = Router();

router.post("/:chatId/message/send", messageController.sendMessage);
router.get("/:chatId/messages", messageController.getMessage);
router.post("/:chatId/message/:messageId/read", messageController.messageMarkAsRead);
router.post("/:chatId/lastseen", messageController.updateLastSeen);


export default router;
