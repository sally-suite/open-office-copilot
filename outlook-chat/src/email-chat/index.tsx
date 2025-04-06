import { render } from "chat-list/apps/email";

/* Render application after Office initializes */

Office.onReady(() => {
    render();
});


// if ((module as any).hot) {
//   (module as any).hot.accept("./components/App", () => {
//     const NextApp = require("./components/App").default;
//     render(NextApp);
//   });
// }
