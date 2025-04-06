import { DataTypes, Model, Optional } from "sequelize";
import SequelizeAdapter, { models } from "@auth/sequelize-adapter"

import sequelize from "./db";

// Interface representing the attributes of the User model
interface UserAttributes {
  id: string;
  name: string;
  email: string;
  image?: string;
  registrationDate: Date;
  emailVerified?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface representing the creation attributes of the User model
interface UserCreationAttributes extends Optional<UserAttributes, "id"> { }

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public image?: string;
  public emailVerified?: Date;
  public registrationDate!: Date;
  public createdAt?: Date;
  public updatedAt?: Date;
}


export default sequelize.define<User>(
  "user",
  {
    ...models.User,
    registrationDate: {
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
    modelName: "users",
    underscored: true,
  }
)
