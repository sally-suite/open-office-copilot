# Open Office Copilot

Open Office Copilot 是一个基于 Agents 架构的开源办公助手平台，支持 Microsoft Office 和 Google Workspace。

我们计划在未来几周内开源该项目。目前，你可以通过 [https://www.sally.bot](https://www.sally.bot) 体验它。

---

## 支持的平台与软件

Open Office Copilot 目前支持以下平台和软件，并将持续扩展，你可以通过以下链接安装：

| 平台             | 状态   | 软件                                     | 链接                                                                                             |
| ---------------- | ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Microsoft Office | 已完成 | Word、PowerPoint、Excel、Outlook（经典） | [链接](https://appsource.microsoft.com/en-us/product/office/WA200006772?tab=Overview)            |
| Google Workspace | 已完成 | Docs、Slides、Sheets                     | [链接](https://workspace.google.com/u/0/marketplace/app/sally_suite/502322973058)                |
| Chrome 扩展      | 已完成 | Chrome                                   | [链接](https://chromewebstore.google.com/detail/sally/eomgoeagcnhiodfbghbojilbdlhlkllf)          |
| Edge 扩展        | 已完成 | Edge                                     | [链接](https://microsoftedge.microsoft.com/addons/detail/sally/gcmnlkbgphffgkpdblpmnaapdnnajkel) |
| 浏览器           | 已完成 | Chrome、Edge、Firefox                    | [链接](https://www.sally.bot)                                                                    |
| WPS Office       | 开发中 | 暂无                                     |                                                                                                  |

---

## 支持的 AI 模型

以下模型已通过测试并可在系统中使用。星级越高，性能越佳。同时，我们也支持用户添加自己的模型。

- GPT-4o-mini ⭐️⭐️
- GPT-4o ⭐️⭐️⭐️
- Claude 3.5 haiku ⭐️⭐️⭐️
- Claude 3.5 sonnet ⭐️⭐️⭐️⭐️⭐️
- DeepSeek V3 ⭐️⭐️⭐️⭐️

---

## 支持的 AI 模型提供商

用户可以从以下模型提供商获取所需的 AI 模型并添加至系统。目前优先支持 GPT、Claude 和 DeepSeek。

| 提供商      | 状态   | 链接                            |
| ----------- | ------ | ------------------------------- |
| OpenAI      | 已完成 | [链接](https://www.openai.com/) |
| OpenRouter  | 已完成 | [链接](https://openrouter.ai//) |
| SiliconFlow | 已完成 | [链接](https://siliconflow.cn/) |
| DeepSeek    | 已完成 | [链接](https://deepseek.com/)   |

---

## 支持的语言

系统支持以下语言：

- **阿拉伯语** 🇸🇦
- **简体中文** 🇨🇳
- **繁体中文** 🇨🇳
- **英语** 🇺🇸
- **法语** 🇫🇷
- **德语** 🇩🇪
- **日语** 🇯🇵
- **韩语** 🇰🇷
- **俄语** 🇷🇺
- **西班牙语** 🇪🇸
- **越南语** 🇻🇳

---

## Agents（智能代理）

以下是当前支持的 Agents 及其功能。平台致力于将 Agents 深度集成至各类软件，以增强 AI 与办公软件的结合。

| Agent         | 适用软件                          | 描述                                                     |
| ------------- | --------------------------------- | -------------------------------------------------------- |
| Sally         | 所有平台                          | 一个可以帮助你完成各种写作任务的智能聊天助手。           |
| Paper         | Word                              | 学术写作助手，可帮助你撰写学术论文。                     |
| Data Analyst  | Excel、Word、PowerPoint（Google） | 用 Python 分析数据、总结数据、可视化数据等。             |
| Presentation  | PowerPoint/Google Slides/在线版   | 通过内置模板（列表、表格、图表）创建演示文稿。           |
| Python Slide  | PowerPoint/Google Slides          | 生成或运行 Python 代码来创建幻灯片。                     |
| Formula       | Word/Google Docs                  | 生成可编辑的数学公式。                                   |
| Image Scanner | 所有平台                          | 从图片中提取信息，如表格、列表、数学公式等。             |
| Diagram       | Word/Google Docs                  | 基于 Mermaid 生成流程图、时间序列图、甘特图等。          |
| Email         | Outlook                           | 总结或撰写邮件（支持经典版 Outlook）。                   |
| LaTeX         | Chrome/Edge 扩展                  | 在 Overleaf 或其他 LaTeX 编辑器中生成 LaTeX 代码。       |
| Coder         | Google Sheets                     | 生成并运行 Google Apps Script 代码来编辑 Google Sheets。 |

---

## 技术详情

### 后端

- Node.js 20+
- Next.js 13

### 数据库

- Sequelize
- PostgreSQL

### 前端

- React 18+
- Tailwind CSS 3+
- Pyodide
- pptxgen
- ECharts
- xlsx
- Mermaid
- MathJax
- KaTeX

---

## 反馈与社区

欢迎反馈和交流：

- [GitHub Issue](https://github.com/sally-suite/open-office-copilot)
- [Discord](https://discord.gg/txPgpZmv36)
- [WhatsApp](https://wa.me/8619066504137)

---

## 路线图

- [x] 支持 WPS Office
- [x] 支持 桌面客户端（Windows、MacOS）
- [x] Agent 应用市场

## 许可证

MIT

---

## **总结**

Open Office Copilot 是一个即将开源的办公 AI 助手，支持 Microsoft Office 和 Google Workspace。它提供多个 AI Agent，包括写作助手、数据分析、公式编辑、邮件撰写等，支持多种 AI 模型（GPT-4o、Claude 3.5、DeepSeek V3）。用户可以通过多个平台（浏览器、Office 插件、Google 扩展）使用。技术栈包括 Next.js、PostgreSQL、React 等，支持多种语言。当前仍在开发 WPS Office 兼容性，欢迎社区反馈和贡献。
