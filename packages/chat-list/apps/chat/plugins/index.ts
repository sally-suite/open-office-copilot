
import Python from 'chat-list/plugins/python'
import Vision from 'chat-list/plugins/vision'
// import Analyst from 'chat-list/plugins/analyst-v2'
// import Planner from 'chat-list/plugins/planner'
// import Formula from 'chat-list/plugins/formula';
import Stock from 'chat-list/plugins/stock';
// import Crypto from 'chat-list/plugins/crypto';

// import Crypto from 'chat-list/plugins/crypto';
import PowerPoint from 'chat-list/plugins/presentation';
import Word from 'chat-list/plugins/article';
import Jupyter from 'chat-list/plugins/jupyter';
import Uml from 'chat-list/plugins/uml';
import Image from 'chat-list/plugins/image'
import Eric from 'chat-list/plugins/eric';
import Claude from 'chat-list/plugins/claude';

import Sally from './sally';

export const plugins = [
    // Planner,
    Sally,
    Word,
    PowerPoint,
    Python,
    Jupyter,
    // Analyst,
    Vision,
    Image,
    Uml,
    Stock,
    // Crypto,
    // Claude,
    Eric
];

export const homeQuickReplies = (): any[] => {
    return [];
};
