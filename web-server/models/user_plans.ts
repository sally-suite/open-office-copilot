import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // Your Sequelize connection configuration

export class UserPlansModel extends Model {
    public id!: number;
    public email: string;
    public name: string;
    public tasks: string;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const UserPlan = sequelize.define<UserPlansModel>('user_plans',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tasks: {
            type: DataTypes.TEXT,
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
        modelName: "user_plans",
        underscored: true,
    }
);

export default UserPlan;
