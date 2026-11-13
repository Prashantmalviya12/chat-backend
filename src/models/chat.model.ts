import {
  CreateOptions,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { squelizer } from "../config/db.js";

export class Chat extends Model<
  InferAttributes<Chat>,
  InferCreationAttributes<Chat>
> {
  declare id: CreateOptions<string>;
  declare pairKey: string;
  declare type: CreateOptions<"direct" | "group">;
  declare createdAt: CreateOptions<Date>;
  declare updatedAt: CreateOptions<Date>;
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pairKey: {
      type: DataTypes.STRING(73),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM("direct", "group"),
      allowNull: false,
      defaultValue: "direct",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize: squelizer,
    tableName: "chats",
  },
);
