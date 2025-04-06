import { POSTGRES_DATABASE, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_USER } from "../constants/db";
import { Sequelize } from "sequelize";

// const POSTGRES_HOST = process.env.POSTGRES_HOST;
// const POSTGRES_USER = process.env.POSTGRES_USER || 'default';
const isProd = process.env.VERCEL_ENV === "production";
const db = new Sequelize(POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD, {
  port: 5432,
  host: POSTGRES_HOST,
  dialect: "postgres", // 或者使用 'postgres' 或 'sqlite' 等
  dialectModule: require("pg"),
  // ssl: true,
  define: {
    // timestamps: false, // Disable automatic timestamp fields (createdAt, updatedAt)
    // freezeTableName: true, // Prevent Sequelize from pluralizing table names
  },
  dialectOptions: isProd && {
    ssl: {
      require: true,
      rejectUnauthorized: false // 忽略未经授权的证书
    }
  }
});

export default db;
