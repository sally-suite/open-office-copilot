import { IChatResult } from 'chat-list/types/chat';
import { chatByPrompt } from '../message';
import { ArrowRightSquare, Binary, BookOpen, Check, FileEdit, FileText, MessageCircle, PenTool, Quote, ScrollText, Table2, Wand } from 'lucide-react';
import { template } from 'chat-list/utils';



export const tools = [
    {
        "name": "Polish Text",
        "code": "polish",
        "icon": Wand,
        "prompt": "Please improve this academic writing while maintaining the key ideas: \n\n{{selection}}",
        "description": "Enhance academic writing style"
    },
    {
        "name": "Convert Math",
        "code": "math",
        "icon": Binary,
        "prompt": "Convert this description into LaTeX math formula: \n\n{{selection}}",
        "description": "Convert text to LaTeX formula"
    },
    {
        "name": "Generate Abstract",
        "code": "abstract",
        "icon": FileText,
        "prompt": "Generate a concise academic abstract from this content: \n\n{{selection}}",
        "description": "Create paper abstract"
    },
    {
        "name": "Expand Content",
        "code": "expand",
        "icon": ArrowRightSquare,
        "prompt": "Expand this point into detailed academic discussion: \n\n{{selection}}",
        "description": "Elaborate on current text"
    },
    {
        "name": "Add Citations",
        "code": "cite",
        "icon": Quote,
        "prompt": "Suggest relevant academic citations for this text: \n\n{{selection}}",
        "description": "Find relevant citations"
    },
    {
        "name": "Explain Code",
        "code": "explain",
        "icon": MessageCircle,
        "prompt": "Explain what this LaTeX code does and how to use it: \n\n{{selection}}",
        "description": "Explain LaTeX code usage"
    },
    {
        "name": "Format Table",
        "code": "table",
        "icon": Table2,
        "prompt": "Optimize this table format in LaTeX: \n\n{{selection}}",
        "description": "Improve table layout"
    },
    {
        "name": "Create TikZ",
        "code": "tikz",
        "icon": PenTool,
        "prompt": "Generate TikZ code for this figure description: \n\n{{selection}}",
        "description": "Generate figure code"
    },
    {
        "name": "Simplify Text",
        "code": "simplify",
        "icon": FileEdit,
        "prompt": "Simplify this academic text while keeping the meaning: \n\n{{selection}}",
        "description": "Make text more readable"
    },
    {
        "name": "Use Terms",
        "code": "terms",
        "icon": BookOpen,
        "prompt": "Convert this into proper academic terminology for the field: \n\n{{selection}}",
        "description": "Add academic terms"
    },
    {
        "name": "Check Grammar",
        "code": "grammar",
        "icon": Check,
        "prompt": "Check and correct any grammar issues in this text: \n\n{{selection}}",
        "description": "Fix grammar issues"
    },
    {
        "name": "Check Format",
        "code": "format",
        "icon": ScrollText,
        "prompt": "Check if this LaTeX code follows best practices: \n\n{{selection}}",
        "description": "Verify LaTeX format"
    }
];


export const writing = async (text: string, prompt: string, callback?: (done: boolean, result: IChatResult, stop: () => void) => void) => {
    // const prompt = (prompts as any)[code];
    if (!text) {
        return;
    }

    const input = template(prompt, {
        selection: text
    });

    const result = await chatByPrompt("", input, {
        temperature: 0.7,
        stream: true
    }, callback);

    return result;
};