import { Chat } from "./chat.model.js";
import { ChatMember } from "./chatMember.js";
import { User } from "./user.model.js";

User.hasMany(ChatMember,{foreignKey:"userId",as:"memberships"})
ChatMember.belongsTo(User,{foreignKey:"userId",as:"user"})

Chat.hasMany(ChatMember,{foreignKey:"chatId",as:"members"})
ChatMember.belongsTo(Chat, { foreignKey: "chatId", as: "chat" });

export { User, Chat, ChatMember };