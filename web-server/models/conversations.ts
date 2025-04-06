import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./db";

// Interface representing the attributes of the Conversation model
interface ConversationAttributes {
  conversationId: string;
  conversationName: string;
  createdBy: string;
  creationDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface representing the creation attributes of the Conversation model
interface ConversationCreationAttributes
  extends Optional<ConversationAttributes, "conversationId"> { }

class Conversation
  extends Model<ConversationAttributes, ConversationCreationAttributes>
  implements ConversationAttributes {
  public conversationId!: string;
  public conversationName!: string;
  public createdBy!: string;
  public creationDate!: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
}

Conversation.init(
  {
    conversationId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    conversationName: {
      type: DataTypes.STRING,
    },
    createdBy: {
      type: DataTypes.STRING,
    },
    creationDate: {
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
    modelName: "conversations",
  }
);

export default Conversation;
