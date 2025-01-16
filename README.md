# Open Office Copilot

Open Office Copilot is an open-source office copilot platform built on Agents, capable of supporting both Microsoft Office and Google Workspace.

We are preparing to open source this project in the coming weeks. In the meantime, you can experience it now at [https://www.sally.bot](https://www.sally.bot).

## Support Platforms and Software

Open Office Copilot currently supports the following platforms and software, with more to come, you can install it from the following links:

| Platform         | Status      | software                             | link                                                                                             |
| ---------------- | ----------- | ------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Microsoft Office | Done        | Word,Powpoint,Excel,Outlook(classic) | [link](https://appsource.microsoft.com/en-us/product/office/WA200006772?tab=Overview)            |
| Google Workspace | Done        | Docs,Sides,Sheets                    | [link](https://workspace.google.com/u/0/marketplace/app/sally_suite/502322973058)                |
| Google Extension | Done        | Chrome                               | [link](https://chromewebstore.google.com/detail/sally/eomgoeagcnhiodfbghbojilbdlhlkllf)          |
| Edge Extension   | Done        | Edge                                 | [link](https://microsoftedge.microsoft.com/addons/detail/sally/gcmnlkbgphffgkpdblpmnaapdnnajkel) |
| Browser          | Done        | Chrome,Edge,Firefox                  | [link](https://www.sally.bot)                                                                    |
| WPS Office       | In Progress | None                                 |                                                                                                  |

## Support Models

The following models have been tested and can be used in the system. The more stars they have, the better their performance. We also support adding your own models.

- GPT-4o-mini ⭐️⭐️
- GPT-4o ⭐️⭐️⭐️
- Claude 3.5 haiku ⭐️⭐️⭐️
- Claude 3.5 sonnet ⭐️⭐️⭐️⭐️⭐️
- DeepSeek V3 ⭐️⭐️⭐️⭐️⭐️

## Support AI Model Providers

Users can obtain desired models from the following model providers and add them to the system. Priority is given to models from GPT, CLAUDE, and DeepSeek.

| Provider    | Status | link                            |
| ----------- | ------ | ------------------------------- |
| OpenAI      | Done   | [link](https://www.openai.com/) |
| OpenRouter  | Done   | [link](https://openrouter.ai//) |
| SiliconFlow | Done   | [link](https://siliconflow.cn/) |
| DeepSeek    | Done   | [link](https://deepseek.com/)   |

## Support Languages

The following languages can be used in the system.

- **Arabic** 🇸🇦
- **Chinese（Simplified）** 🇨🇳
- **Chinese（Traditional）** 🇨🇳
- **English** 🇺🇸
- **French** 🇫🇷
- **German** 🇩🇪
- **Japanese** 🇯🇵
- **Korean** 🇰🇷
- **Russian** 🇷🇺
- **Spanish** 🇪🇸
- **Vietnamese** 🇻🇳

## Agents

The following are the Agents currently supported by the platform and their features. The platform strives to tightly integrate Agents with software, bridging the gap between AI and software.

| Agent         | Software                                | Description                                                                             |
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------------- |
| Sally         | All                                     | Sally is a chatbot that can help you with various writing tasks.                        |
| Paper         | Word                                    | Paper is a academic writing assistant that can help you write academic papers.          |
| Data Analyst  | Excel,Word,Powerpoint(Google Workspace) | Analyze spreadsheet data with Python, summarize data, virtualize data,etc.              |
| Presentation  | PowerPoint/Google Slides/Onlne          | Create presentations with some inside templates,such as list,talbe or chart template.   |
| Python Slide  | PowerPoint/Google Slides                | Generate or run python code to create slides.                                           |
| Formula       | Word/Google Docs                        | Generate Math Formula in Word and that can be editable in Word.                         |
| Image Scanner | All                                     | Extract information from images and convert it to text, such as table,list,formula,etc. |
| Diagram       | Word/Google Docs                        | Build diagram based on Mermaid,support flow chart, time series chart ,Gantt chart,etc.  |
| Email         | Outlook                                 | Summarize or write email with Outlook(classic).                                         |
| LaTeX         | Chrome/Edge Extension                   | Generate LaTeX code in Overleaf or other LaTeX editor in Browser.                       |
| Coder         | Google Sheets                           | Generate and run Google Apps Script code to edit Google Sheets.                         |

## Technical Details

## Backend

- Node.js 20+
- Nextjs 13

## Database

- Sequelize
- PosgreSQL

## Frontend

- React 18+
- Tailwindcss 3+
- Pyodide
- pptxgen
- echarts
- xlsx
- mermaid
- mathjax
- katex

## Wellcome to feedback

- [Github Issue](https://github.com/sally-suite/open-office-copilot)
- [Discord](https://discord.gg/txPgpZmv36)
- [Whatsapp](https://wa.me/8619066504137)

# License

MIT
