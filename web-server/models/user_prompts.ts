import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // 你的 Sequelize 连接配置

export class UserPrompts extends Model {
    public id!: number;
    /**
     * Document type , doc,sheet,slide,side
     */
    public type: string;
    public name: string;
    public description!: string;
    public agent: string;
    public prompt: string;
    public email!: string;
    public order: number;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const UserPrompt = sequelize.define<UserPrompts>('user_prompts',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        agent: {
            type: DataTypes.STRING,
        },
        prompt: {
            type: DataTypes.TEXT,
        },
        email: {
            type: DataTypes.STRING,
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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
        modelName: "user_prompts",
        underscored: true,
    }
);

export default UserPrompt;
