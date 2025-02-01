import { IDocService } from 'chat-list/types/api/doc';

class SheetServiceMock implements IDocService {
    getSelectedText = async () => {
        return 'the Users table stores information about each user, such as their username, email, and password. The Tasks table stores information about each task, including its title, description, due date, and status.';
    };
    insertTable = async (value: string[][]) => {
        return;
    };
    insertText = async (value: string) => {
        return;
    };
    getDocumentContent = async (value: string) => {
        return 'the Users table stores information about each user, such as their username, email, and password. The Tasks table stores information about each task, including its title, description, due date, and status.';
    };
    registSelectEvent = async () => {
        console.log('selecte');
    };
}
export default new SheetServiceMock();