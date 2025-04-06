import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // Your Sequelize connection configuration

export class UserAgentModel extends Model {
    public id!: number;
    public userId: number;
    public agentId: number;
    public role: 'owner' | 'user';
    public createdAt?: Date;
    public updatedAt?: Date;
}

const UserAgent = sequelize.define<UserAgentModel>('user_agents',
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
        agentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('owner', 'collaborator'),
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
        modelName: "user_agents",
        underscored: true,
    }
);

export default UserAgent;
