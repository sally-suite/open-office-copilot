import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "./db";

// Interface representing the attributes of the AccessKey model
export interface AccessKeyModel extends Model {
    id: number;
    key: string;
    salt: string;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}


const AccessKey = sequelize.define<AccessKeyModel>('AccessKey',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        salt: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'access_key',
        timestamps: true,
        underscored: true,
    }
);

export default AccessKey;
