import { Request, Response } from "express";
import { Chat, ChatMember } from "../models/index.model.js";
import { ApiError } from "../utils/apiErrors.js";
import firebaseApp, { firebaseDB } from "../config/firebase.js";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ApiResponse } from "../utils/apiResponse.js";

interface MessageDocument {
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

const messagesCollection = (chatId: string) =>
  firebaseDB.collection("chats").doc(chatId).collection("messages");

export const messageController = {
  sendMessage: async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { senderId, text } = req.body as { senderId: string; text: string };

      const member = await ChatMember.findOne({
        where: { chatId, userId: senderId },
      });
      if (!member) {
        throw ApiError({
          statusCode: 403,
          message: "User is not a member of this chat",
        });
      }
      const messageRef = messagesCollection(String(chatId)).doc();
      const messageData = {
        senderId,
        text,
        createdAt: FieldValue.serverTimestamp(),
      };

      await messageRef.set(messageData);

      // Keep a small chat-level summary for future chat-list previews.
      await firebaseDB.collection("chats").doc(String(chatId)).set(
        {
          lastMessageId: messageRef.id,
          lastMessageText: text,
          lastMessageSenderId: senderId,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      const saved = await messageRef.get();
      const savedData = {
        id: messageRef.id,
        senderId,
        text,
        createdAt: saved.get("createdAt")?.toDate?.().toISOString() ?? null,
      };
      res.status(201).json(ApiResponse(savedData, "Message sent successfully"));
    } catch (error) {
      console.log("Server Error With message", error);
      throw ApiError({ statusCode: 500, message: "Internal Server Error." });
    }
  },

  getMessage: async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      const { limit, cursor, userId } = req.query as {
        limit: string;
        cursor?: string;
        userId?: string;
      };
      console.log("get message",limit)

      if (!userId) {
        throw ApiError({
          statusCode: 400,
          message: "userId query parameter is required",
        });
      }

      const member = await ChatMember.findOne({
        where: { chatId, userId },
      });
      if (!member) {
        throw ApiError({
          statusCode: 403,
          message: "User is not a member of this chat",
        });
      }

      let query = messagesCollection(String(chatId))
        .orderBy("createdAt", "desc")
        .limit(Number(limit));

      if (cursor) {
        const cursorSnapshot = await messagesCollection(String(chatId))
          .doc(cursor)
          .get();
        if (!cursorSnapshot.exists)
          throw ApiError({
            statusCode: 400,
            message: "Invalid message cursor",
          });
        query = query.startAfter(cursorSnapshot);
      }

      const snapshot = await query.get();
      const docs = snapshot.docs;

      const messages = docs.reverse().map((doc) => {
        const data = doc.data() as MessageDocument;
        return {
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
        };
      });

      return res.status(201).json(
        ApiResponse(
          {
            messages,
            nextCursor: docs.length === Number(limit) ? (docs[0]?.id ?? null) : null,
          },
          "Messages retrieved successfully",
        ),
      );
    } catch (error) {
      console.log("Server Error With get message", error);
      throw ApiError({ statusCode: 500, message: "Internal Server Error." });
    }
  },

  messageMarkAsRead: async (req: Request, res: Response) => {
    try {
      const { chatId, messageId } = req.params;
      const { userId } = req.body as { userId: string };

      const member = await ChatMember.findOne({
        where: { chatId, userId },
      });
      if (!member) {
        throw ApiError({
          statusCode: 403,
          message: "User is not a member of this chat",
        });
      }
      const messageRef = messagesCollection(String(chatId)).doc(String(messageId));
      const message = await messageRef.get();
      if (!message.exists)
        throw ApiError({ statusCode: 404, message: "Message not found" });

      const receiptRef = messageRef.collection("readReceipts").doc(userId);
      await receiptRef.set(
        {
          userId,
          readAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      res
        .status(200)
        .json(
          ApiResponse(
            { messageId, userId, read: true },
            "Message marked as read",
          ),
        );
    } catch (error) {
      console.log("Server Error With mark as read", error);
      throw ApiError({ statusCode: 500, message: "Internal Server Error." });
    }
  },
  updateLastSeen: async (req: Request, res: Response) => {
    const { chatId } = req.params;
    const { userId, messageId } = req.body as {
      userId: string;
      messageId: string;
    };

    const member = await ChatMember.findOne({
      where: { chatId, userId },
    });
    if (!member) {
      throw ApiError({
        statusCode: 403,
        message: "User is not a member of this chat",
      });
    }

    const messageRef = messagesCollection(String(chatId)).doc(messageId);
    const messageSnapshot = await messageRef.get();
    if (!messageSnapshot.exists)
      throw ApiError({ statusCode: 404, message: "Message not found" });

    const messageData = messageSnapshot.data() as MessageDocument;
    if (!messageData.createdAt) {
      throw ApiError({
        statusCode: 409,
        message: "Message timestamp is not available yet",
      });
    }

    const lastSeenRef = firebaseDB
      .collection("chats")
      .doc(String(chatId))
      .collection("lastSeen")
      .doc(userId);

    const current = await lastSeenRef.get();
    if (current.exists) {
      const currentMessageId = current.get("messageId") as string | undefined;
      if (currentMessageId) {
        const currentMessage = await messagesCollection(String(chatId))
          .doc(currentMessageId)
          .get();

        const currentCreatedAt = currentMessage.get("createdAt") as
          | Timestamp
          | undefined;
        if (
          currentCreatedAt &&
          messageData.createdAt.toMillis() < currentCreatedAt.toMillis()
        ) {
          throw ApiError({
            statusCode: 400,
            message: "Last seen cannot move backwards",
          });
        }
      }
    }

    await lastSeenRef.set(
      {
        userId,
        messageId,
        messageCreatedAt: messageData.createdAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return { userId, messageId, updated: true };
  },
};
