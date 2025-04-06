// eslint-disable-next-line import/no-anonymous-default-export
// export default [
//     {
//         question: '我可以使用自己的模型吗?',
//         answer: "是的，可以在应用的左下角添加自定义模型，目前我们支持OpenAI,OpenRouter,SiliconFlow,DeepSeek等模型供应商，你可以选择自己需要的模型进行使用，API KEY存储在本地，不会上传到服务器。",
//     },
//     {
//         question: 'Python环境可以访问本地文件系统吗?',
//         answer: '不要试图把本地文件路径给Sally，Python环境无法访问本地的文件系统，这个Python环境运行在浏览器中，因此无法访问本地文件系统。',
//     },
//     {
//         question: "哪个模型表现更好？",
//         answer: '经过我们的测试，普通的写作辅助，GPT-4o-mini或GPT-4o可以满足需求，如果要分析数据，推荐GPT-4o, Claude 3.5 Sonnet 或者DeepSeek效果会更好。',
//     },
//     {
//         question: "可以私有化部署吗？",
//         answer: "Sally是一套插件，可以私有部署到企业内网环境，包括Office或者Google Workspace，访问企业内部的大模型服务。",
//     },
//     {
//         question: "如何保证数据安全？",
//         answer: "Sally的插件运行在浏览器中，数据不会离开用户设备，也不会上传用户数据，用户可以随时删除插件，删除插件后，插件的数据也会被删除。",
//     },
//     {
//         question: "Sally支持哪些语言？",
//         answer: "Sally的用户界面支持11种语言，包括中文简体，中文繁体、英文、日文、韩文、西班牙文、法文、德文、俄文、越南语，阿拉伯文，聊天支持的语言取决于模型供应商。"
//     }

// ];

// eslint-disable-next-line import/no-anonymous-default-export
export default [
    {
        question: "Can I use my own model?",
        answer: "Yes, you can add a custom model in the bottom left corner of the application. Currently, we support model providers such as OpenAI, OpenRouter, SiliconFlow, and DeepSeek. You can select the model you need. The API key is stored locally and will not be uploaded to the server.",
    },
    {
        question: "Can the Python environment access the local file system?",
        answer: "Do not attempt to provide local file paths to Sally. The Python environment cannot access the local file system as it runs in the browser and does not have access to local files.",
    },
    {
        question: "Which model performs better?",
        answer: "Based on our testing, for general writing assistance, GPT-4o-mini or GPT-4o should suffice. For data analysis, we recommend GPT-4o, Claude 3.5 Sonnet, or DeepSeek for better results.",
    },
    {
        question: "Can Sally be deployed privately?",
        answer: "Sally is a plugin that can be privately deployed within an enterprise intranet environment, including Office or Google Workspace, to access the organization’s internal large model services.",
    },
    {
        question: "How is data security ensured?",
        answer: "Sally runs as a browser-based plugin. Your data will not leave your device, nor will it be uploaded. You can delete the plugin at any time, and all plugin-related data will be removed upon deletion.",
    },
    {
        question: "What languages does Sally support?",
        answer: "Sally's user interface supports 11 languages, including Simplified Chinese, Traditional Chinese, English, Japanese, Korean, Spanish, French, German, Russian, Vietnamese, and Arabic. The languages supported in chats depend on the model provider."
    }
];
