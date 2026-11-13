import { Request, Response } from "express";
import { Chat, ChatMember, User } from "../models/index.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const userController = {
  listUserChats: async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) throw ApiError({ statusCode: 404, message: "User not found" });

    const memberships = await ChatMember.findAll({
      where: { userId },
      include: [
        {
          model: Chat,
          as: "chat",
          include: [
            {
              model: ChatMember,
              as: "members",
              attributes: ["userId", "joinedAt"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const chats = memberships
      .map((membership) => {
        const chat = membership.chat;
        if (!chat) return null;

        return {
          chatId: chat.id,
          type: chat.type,
          createdAt: chat.createdAt,
          members: (chat.members || []).map((member) => member.userId),
        };
      })
      .filter((chat) => chat !== null);
    res
      .status(200)
      .json(ApiResponse({ chats }, "User chats retrieved successfully"));
  
    } catch (error) {
        console.log("User List error",error)
        throw ApiError({statusCode:500,message:"Internal Server Error"})
    }
};
