import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // Your Sequelize connection configuration

export class UserToolModel extends Model {
    public id!: number;
    public userId: number;
    public toolId: number;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const UserTool = sequelize.define<UserToolModel>('UserTool',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        toolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
    {
        modelName: "user_tools",
        underscored: true,
    }
);

export default UserTool;
