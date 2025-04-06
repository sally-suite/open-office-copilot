import { DataTypes, Model } from 'sequelize';
import sequelize from './db';

export class ConfigModel extends Model {
    public id!: number;
    public name!: string;
    public value!: string;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const Config = sequelize.define<ConfigModel>('config',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
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
        modelName: "configs",
        underscored: true,
    }
);

export default Config;
