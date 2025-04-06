import { Sequelize } from "sequelize";
// import path from "path";
import sqlite3 from 'sqlite3'


// const db = new Sequelize({
//   dialect: "sqlite",
//   storage: path.join(__dirname, "../database.sqlite"), // 指定 SQLite 数据库文件路径
//   define: {
//     // timestamps: false, // 禁用自动时间戳字段（createdAt, updatedAt）
//     // freezeTableName: true, // 防止 Sequelize 自动将表名复数化
//   }
// });

const db = new Sequelize({
  dialect: "sqlite",
  storage: "/tmp/database.sqlite", // 指定 SQLite 数据库文件路径
  dialectModule: sqlite3
});


export default db;
