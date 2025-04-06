import { SALLY_ROOT_TAG, SALLY_ROOT_ID } from "chat-list/config/side"

const tag = SALLY_ROOT_TAG
const conatinerId = SALLY_ROOT_ID;

// Create a class for the element
export class WritelyContainer extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super()

    // Create a shadow root
    const shadow = this.attachShadow({ mode: 'open' })

    const container = document.createElement('div')
    container.id = conatinerId
    container.setAttribute('style', 'font-size:16px;')
    // create a style label
    //   const style = document.createElement('style')
    //   style.setAttribute('type', 'text/css')
    //   style.textContent = `* {
    //   --background: 0 0% 100%;
    //   --foreground: 240 10% 3.9%;
    //   --card: 0 0% 100%;
    //   --card-foreground: 240 10% 3.9%;
    //   --popover: 0 0% 100%;
    //   --popover-foreground: 240 10% 3.9%;
    //   --primary: 142.1 76.2% 36.3%;
    //   --primary-foreground: 0 0% 100%;
    //   --secondary: 240 4.8% 95.9%;
    //   --secondary-foreground: 240 5.9% 10%;
    //   --muted: 240 4.8% 95.9%;
    //   --muted-foreground: 240 3.8% 46.1%;
    //   --accent: 240 4.8% 95.9%;
    //   --accent-foreground: 240 5.9% 10%;
    //   --destructive: 0 84.2% 60.2%;
    //   --destructive-foreground: 0 0% 98%;
    //   --border: 240 5.9% 90%;
    //   --input: 240 5.9% 90%;
    //   --ring: 142.1 76.2% 36.3%;
    //   --radius: 0.8rem;
    //   --code: 240 5.9% 90%;
    //   --code-foreground: 240 5.9% 10%;
    // }`
    //   shadow.appendChild(style)
    shadow.appendChild(container)

    /**
     * Prevent bubble, cause the host website might listen them to make thing unexpected
     * For example notion, it listens on keyup event to delete content
     * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
     * https://developer.mozilla.org/en-US/docs/Web/API/InputEvent/inputType
     */
    // ;[
    //   'click',
    //   'keydown',
    //   'keypress',
    //   'keyup',
    //   'copy',
    //   'paste',
    //   'mouseup',
    // ].forEach((eventName) => {
    //   shadow.addEventListener(eventName, (e) => {
    //     e.stopPropagation()
    //   })
    // })
  }
}

// Define the new element
customElements.define(SALLY_ROOT_TAG, WritelyContainer)

export { tag, conatinerId }
