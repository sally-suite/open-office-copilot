

import sequelize from './db'
import './agents'
// import './access_key'
// import './agent_store'
import './bookmarks'
import './config'
// import './conversations'
// import './messages'
import './user_agents'
import './users'
import './user_models'
// import './user_plans'
import './user_prompts'

// sequelize.sync({ alter: true }) // 使用 `alter: true` 来修改表结构而不是重新创建
//     .then(() => {
//         console.log('数据库同步成功！');
//     })
//     .catch((error) => {
//         console.error('数据库同步失败：', error);
//     });

export const sync = async (force: boolean = false) => {
    await sequelize.sync({ alter: true }) // 使用 `alter: true` 来修改表结构而不是重新创建
}