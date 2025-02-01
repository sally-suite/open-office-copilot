import { IChatBody, IChatResult, ICompletionsBody } from 'chat-list/types/chat';
import { ISlideItem, ISlideService } from 'chat-list/types/api/slide';
import { isProd } from 'chat-list/utils';
import api from '.';

class SheetServiceMock implements ISlideService {
  getSelectedText = async () => {
    return 'the Users table stores information about each user, such as their username, email, and password. The Tasks table stores information about each task, including its title, description, due date, and status.'
  }
  insertTable = async (value: string[][]) => {
    return;
  };
  insertText = async (value: string) => {
    return;
  };
  insertImage = async (value: string, width: number, height: number, altTitle: string, altDescription: string) => {
    return;
  };
  getDocumentContent = async (value: string) => {
    return 'the Users table stores information about each user, such as their username, email, and password. The Tasks table stores information about each task, including its title, description, due date, and status.'
  };
  getSelectedImageInfo = async () => {
    return {
      title: 'mermaid',
      description: `
stateDiagram
[*] --> Still
Still --> [*]

Still --> Moving
Moving --> Still
Moving --> Crash
Crash --> [*]
      `
    }
  }
  generateSlide = async (title: string, subTitle: string, list: ISlideItem[]) => {
    return;
  }
  createPage = async (title: string, text: string, list: string[], image: string) => {
    return;
  }
  getSlidesText = async () => {
    return [];
  }

}
export default new SheetServiceMock();