
import { Footnote } from 'chat-list/types/api/doc';

export async function insertFootnoteToDoc(footnote: Footnote, range: Word.Range) {
    const context = range.context;
    const footnoteElement = range.insertFootnote("");
    context.trackedObjects.add(footnoteElement);
    const footnoteBody = footnoteElement.body.paragraphs.getFirst();

    await context.sync();

    const authors = footnote.authors.map((author) => `${author.lastName}, ${author.initials}`).join(", ");
    footnoteBody.insertText(`${authors} (${footnote.year})`, "End").font.italic = false;
    const title = footnoteBody.insertText(` ${footnote.title}`, "End");
    title.font.italic = false;
    title.hyperlink = footnote.url;

    if (footnote.journal) {
        const journalInfo = [footnote.journal.name, footnote.journal.volume].filter(Boolean).join(" ");
        footnoteBody.insertText(` ${journalInfo}`, "End").font.italic = true;

        if (footnote.journal.pages) {
            footnoteBody.insertText(`, ${footnote.journal.pages}`, "End").font.italic = false;
        }
    }

    await context.sync();
}