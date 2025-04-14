import { getMailWindowState } from '../_share/add-on/outlook'
import { render as renderEmailRead } from "chat-list/apps/email-read";
import { render as renderEmailChat } from "chat-list/apps/email";

/* Render application after Office initializes */

const state = getMailWindowState();
if (state == 'Compose') {
    renderEmailChat();
} else {
    renderEmailRead();
}


// if ((module as any).hot) {
//   (module as any).hot.accept("./components/App", () => {
//     const NextApp = require("./components/App").default;
//     render(NextApp);
//   });
// }
