import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import sequelize from './db';

export interface UserPointModel extends Model {
    email: string;
    points: number;
    createdAt?: Date;
    updatedAt?: Date;
}


const UserPoint = sequelize.define<UserPointModel>('UserPoints', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'user_points',
    timestamps: true,
    underscored: true,
});

export default UserPoint;
