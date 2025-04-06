import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./db";

// Interface representing the attributes of the Message model
interface MessageAttributes {
  id: number;
  conversationId: string;
  senderId: string | number;
  receiverId: string | number;
  content: string;
  agent: string;
  model: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface representing the creation attributes of the Message model
interface MessageCreationAttributes extends Optional<MessageAttributes, "id"> { }

class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes {
  public id!: number;
  public conversationId: string;
  public senderId!: string;
  public receiverId!: string;
  public content!: string;
  public agent!: string;
  public model!: string;
  public timestamp!: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationId: {
      type: DataTypes.STRING,
    },
    senderId: {
      type: DataTypes.STRING,
    },
    receiverId: {
      type: DataTypes.STRING,
    },
    agent: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
    },
    model: {
      type: DataTypes.STRING,
    },
    timestamp: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "messages",
    underscored: true,
  }
);

export default Message;
