
import description from './description.md'
import { ChatState, ITool } from 'chat-list/types/plugin';
import { generateNotes } from './util';
import { buildChatMessage } from 'chat-list/utils';
import slideApi from '@api/slide'

export const func = async ({ tone, all_page, from_page, to_page, context }: { tone: string, all_page: boolean, from_page: string, to_page: string, context: ChatState }) => {

    const { appendMsg, setTyping } = context;
    const slides = await slideApi.getSlides(false);
    let start = 0, end = slides.length - 1;

    if (!all_page) {
        if (from_page && Number(from_page) > 0) {
            start = Number(from_page) - 1;
        }
        if (to_page && Number(to_page) > 0) {
            end = Number(to_page) - 1;
        }
    }
    let notes = ''
    for (let i = start; i <= end; i++) {
        const item = slides[i];
        setTyping(true);
        const result = await slideApi.getSlidesText(item.id);

        for (let j = 0; j < result.length; j++) {
            const { id, texts } = result[j];
            const content = await generateNotes(texts, tone);
            if (content) {
                notes += content;
                // appendMsg(buildChatMessage(content, 'text', 'assistant'));
                await slideApi.setSpeakerNote(id, content)
            }
        }
    }

    return `Task completed, speaker nodes is:\n\n${notes}\n\nPlease let user check the generated speaker notes and manually insert the notes into the presentation,and the speaker notes is AI-generated and is not guaranteed to be accurate, so please be sure to proofread`;

}

export default {
    type: 'function',
    name: 'generate_speaker_notes',
    description,
    parameters: {
        "type": "object",
        "properties": {
            "tone": {
                "type": "string",
                "description": `Tone of the notes`
            },
            "all_page": {
                "type": "boolean",
                "description": `is generate all slides speaker notes,default is true`
            },
            "from_page": {
                "type": "string",
                "description": `Generate from page number,default is empty`
            },
            "to_page": {
                "type": "string",
                "description": `Generate to page,default is empty`
            }
        },
        "required": [
            "tone",
            "all_page",
            "from_page",
            "to_page"
        ]
    },
    func
} as unknown as ITool;

