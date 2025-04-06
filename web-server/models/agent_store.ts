import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // Your Sequelize connection configuration

export class AgentStoreModel extends Model {
    public id!: number;
    public agentId: number;
    public price: number;
    public stock: number;
    public isAvailable: boolean;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const AgentStore = sequelize.define<AgentStoreModel>('agentStore',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        agentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
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
        modelName: "agent_stores",
        underscored: true,
    }
);

export default AgentStore;
