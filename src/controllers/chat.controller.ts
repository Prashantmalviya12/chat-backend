import { Request, response, Response } from "express";
import { ApiError } from "../utils/apiErrors.js";
import { Chat, ChatMember, User } from "../models/index.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { squelizer } from "../config/db.js";
import { Transaction, UniqueConstraintError } from "sequelize";

export const chatController = {
  createOrGetChat: async (req: Request, res: Response) => {
    try {
      const { userAId, userBId } = req.body as {
        userAId: string;
        userBId: string;
      };

      if (userAId === userBId) {
        throw ApiError({
          statusCode: 400,
          message: "User cannot chat with themselves.",
        });
      }
      const pairKey = `${userAId}_${userBId}`;
      
      const users = await User.findAll({
        where: {
          id: [userAId, userBId],
        },
        logging: console.log,
      });
      // console.log("aaaaa")

      if (users.length !== 2) {
        throw ApiError({
          statusCode: 404,
          message: "One or both users were not found.",
        });
      }

      const existing = await Chat.findOne({ where: { pairKey } });
      if (existing) {
        return res
          .status(200)
          .json(ApiResponse({ chatId: existing.id }, "Existing chat found"));
      }
      // console.log("Existing", existing);

      const result = await squelizer.transaction(
        async (transaction: Transaction) => {
          const chat = await Chat.create(
            { pairKey, type: "direct" },
            { transaction },
          );

          await ChatMember.bulkCreate(
            [
              { chatId: String(chat.id), userId: userAId },
              { chatId: String(chat.id), userId: userBId },
            ],
            { transaction },
          );

          return chat;
        },
      );
      console.log("result", result);
      res
        .status(201)
        .json(ApiResponse({ chatId: result.id }, "Chat created successfully"));
    } catch (error) {
      throw ApiError({
        statusCode: 500,
        message: "Internal Server Error with chat.",
      });
    }
  },
};
