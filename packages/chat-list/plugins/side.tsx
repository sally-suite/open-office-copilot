
import Vision from 'chat-list/plugins/vision';
import Sally from './sally-side';
import PowerPoint from 'chat-list/plugins/presentation';
import Article from 'chat-list/plugins/article';
import Eric from './eric';
import Formula from './formula';
import Latext from './latex';
export const plugins = [
    Sally,
    Article,
    PowerPoint,
    Latext,
    Formula,
    Vision,
    Eric
];

export const homeQuickReplies = (): any[] => {
    return [];
};
