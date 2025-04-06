import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // Your Sequelize connection configuration

export class UserModelsModel extends Model {
    public id!: number;
    public email: string;
    public provider: string;
    public model: string;
    public baseUrl: string;
    public apiKey?: string;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const UserModel = sequelize.define<UserModelsModel>('user_models',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        baseUrl: {
            type: DataTypes.STRING
        },
        apiKey: {
            type: DataTypes.STRING,
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
        modelName: "user_models",
        underscored: true,
    }
);

export default UserModel;
