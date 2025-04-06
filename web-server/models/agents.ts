import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // 你的 Sequelize 连接配置

export class AgenMdel extends Model {
    public id!: number;
    public type: string;
    public avatar: string;
    public name: string;
    public introduce: string;
    public description!: string;
    public instruction!: string;
    public tools: string[];
    public agents: string[];
    public visibility: 'private' | 'public';
    public status: 'active' | 'inactive';
    public version!: string;
    public dataAsContext: string;
    public tags: string[];
    public acitions: string[];
    public owner!: string;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const Agent = sequelize.define<AgenMdel>('agents',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.STRING,
        },
        avatar: {
            type: DataTypes.STRING,
        },
        name: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        introduce: {
            type: DataTypes.STRING,
        },
        instruction: {
            type: DataTypes.TEXT,
        },
        tools: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        agents: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        visibility: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['private', 'public']]
            }
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['active', 'inactive']]
            }
        },
        version: {
            type: DataTypes.STRING
        },
        dataAsContext: {
            type: DataTypes.BOOLEAN
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        acitions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        owner: {
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
        modelName: "agents",
        underscored: true,
    }
);

export default Agent;
