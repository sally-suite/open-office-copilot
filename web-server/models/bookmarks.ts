import { DataTypes, Model } from 'sequelize';
import sequelize from './db'; // 你的 Sequelize 连接配置

export class BookMarksModel extends Model {
    public id!: number;
    /**
     * Document type , doc,sheet,slide,side
     */
    public type: string;
    public name: string;
    public description!: string;
    public agent: string;
    public data: string;
    public tags: string[];
    public email!: string;
    public createdAt?: Date;
    public updatedAt?: Date;
}

const BookMark = sequelize.define<BookMarksModel>('bookmark',
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
        data: {
            type: DataTypes.STRING,
        },
        tags: {
            type: DataTypes.ARRAY(DataTypes.STRING),
        },
        email: {
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
        modelName: "bookmarks",
        underscored: true,
    }
);

export default BookMark;
