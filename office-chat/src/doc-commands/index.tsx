// import docApi from '@api/doc'
import { PromptType, callPrompt } from './writing/util'
/* global global, Office, self, window */
import { insertMarkdown, insertFootnoteToDoc } from '../_share/add-on/mark-katex';
import { extractJsonDataFromMd, sleep, StreamingMarkdownProcessor } from 'chat-list/utils';
import api from '@api/index';
import { getApiConfig } from 'chat-list/local/local';

Office.onReady(async () => {

});


async function getSelectedText() {
  const context = await Word.run(async (context) => context)
  var selection = context.document.getSelection();
  selection.load(['isEmpty', 'text'])
  await context.sync()
  if (selection.isEmpty) {
    return "";
  } else {
    return selection.text;
  }
}


async function generate(name: PromptType, event: any, position: string = Word.InsertLocation.after) {
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load(['isEmpty', 'text']);
      await context.sync();

      if (selection.isEmpty) {
        return "";
      }

      const text = selection.text;
      let range = selection.insertText('Writing...\n', Word.InsertLocation.after);
      await context.sync();

      // 创建Markdown处理器实例
      const markdownProcessor = new StreamingMarkdownProcessor();
      const { apiKey } = await getApiConfig();
      await callPrompt(name, text, {
        model: apiKey ? undefined : 'gpt-4o-mini',
        stream: true,
        temperature: 0.8
      },
        async (done, result) => {
          // console.log(result.delta?.content)
          if (done) {
            // 处理最后剩余的内容
            const finalParagraphs = await markdownProcessor.finalize();
            for (const paragraph of finalParagraphs) {
              if (paragraph.trim()) {  // 只插入非空段落
                // range = range.insertOoxml(paragraph, Word.InsertLocation.after);
                await insertMarkdown(paragraph)
              }
            }
            return;
          }

          if (result.delta?.content) {
            // 处理流式内容
            const { newParagraphs, remainingBuffer } =
              await markdownProcessor.processStream(result.delta.content);

            // 只插入新的段落
            for (const paragraph of newParagraphs) {
              if (paragraph.trim()) {  // 只插入非空段落
                // range = range.insertOoxml(paragraph, Word.InsertLocation.after);
                await insertMarkdown(paragraph)
              }
            }
          }
        }
      );
      range.delete();
      if (position === Word.InsertLocation.replace) {
        selection.delete();
      }
    });

  } catch (error) {
    await Word.run(async (context) => {
      // 输出异常
      const selection = context.document.getSelection();
      selection.insertText(`Sorry, there was an error.\n` + error.toString(), Word.InsertLocation.after);
      await context.sync();
    });
    console.error(error);
    event.completed();
  } finally {
    event.completed();
  }
}


async function makeLonger(event: any) {
  return await generate('make_longer', event, 'Replace')
}

async function makeShorter(event: any) {
  return await generate('make_shorter', event, 'Replace')
}

async function summarize(event: any) {
  return await generate('summarize', event)
}

async function contineWriting(event: any) {
  return await generate('contine_write', event)
}

async function refine(event: any) {
  return await generate('refine', event, 'Replace')
}

async function spellCheck(event: any) {
  // return await generate('spell_check', event, 'Replace')
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load(['isEmpty', 'text']);
      await context.sync();

      if (selection.isEmpty) {
        return "";
      }
      const text = selection.text;
      const messageRange = selection.insertText('Checking...\n', Word.InsertLocation.after);

      await context.sync();
      const { apiKey } = await getApiConfig();
      const result = await callPrompt('spell_check', text, {
        model: apiKey ? undefined : 'gpt-4o-mini',
        stream: false,
        temperature: 0.8
      });
      if (result) {
        const comment = extractJsonDataFromMd(result);
        // console.log(comment);
        const { comments = [] } = comment;

        for (let i = 0; i < comments.length; i++) {
          const { original, suggestion, corrected, type } = comments[i];
          // console.log(original)
          const ranges = selection.search(original);
          ranges.load('items');
          await context.sync();
          if (!ranges.items.length) {
            continue;
          }
          for (let range of ranges.items) {
            // replace text
            range.insertText(corrected, Word.InsertLocation.replace);
            range.insertComment(`${original}->${corrected}`);
          }
          await context.sync();
          await sleep(500);
        }
      }
      messageRange.delete();
    });

  } catch (error) {
    await Word.run(async (context) => {
      // 输出异常
      const selection = context.document.getSelection();
      selection.insertText(`Sorry, there was an error.\n` + error.toString(), Word.InsertLocation.after);
      await context.sync();
    });
    console.error(error);
    event.completed();
  } finally {
    event.completed();
  }
}

async function grammarCheck(event: any) {
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load(['isEmpty', 'text']);
      await context.sync();

      if (selection.isEmpty) {
        return "";
      }
      const text = selection.text;
      const messageRange = selection.insertText('Checking...\n', Word.InsertLocation.after);

      await context.sync();
      const { apiKey } = await getApiConfig();
      const result = await callPrompt('spell_grammar', text, {
        model: apiKey ? undefined : 'gpt-4o-mini',
        stream: false,
        temperature: 0.8
      });
      if (result) {
        const comment = extractJsonDataFromMd(result);
        // console.log(comment);
        const { comments = [] } = comment;

        for (let i = 0; i < comments.length; i++) {
          const { original, suggestion, corrected, type } = comments[i];
          // console.log(original)
          const ranges = selection.search(original);
          ranges.load('items');
          await context.sync();
          if (!ranges.items.length) {
            continue;
          }
          for (let range of ranges.items) {
            // replace text
            range.insertText(corrected, Word.InsertLocation.replace);
            range.insertComment(suggestion);
          }
          await context.sync();
          await sleep(500);
        }
      }
      messageRange.delete();
    });

  } catch (error) {
    await Word.run(async (context) => {
      // 输出异常
      const selection = context.document.getSelection();
      selection.insertText(`Sorry, there was an error.\n` + error.toString(), Word.InsertLocation.after);
      await context.sync();
    });
    console.error(error);
    event.completed();
  } finally {
    event.completed();
  }
}

async function addCitation(event: any) {
  // return await generate('add_citation', event)
  const name = 'add_citation';
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load(['isEmpty', 'text']);
      await context.sync();

      if (selection.isEmpty) {
        return "";
      }

      const text = selection.text;
      let range = selection.insertText('Searching...\n', Word.InsertLocation.after);
      await context.sync();
      const { apiKey } = await getApiConfig();
      const result = await callPrompt(name, text, {
        model: apiKey ? undefined : 'gpt-4o-mini',
        stream: false,
        temperature: 0.8
      });
      if (result) {
        const footNote = extractJsonDataFromMd(result);
        const title = footNote.title;
        const papers = await api.searchScholar({
          keyword: title,
        })
        if (papers.length > 0) {
          const paper = papers[0];
          const url = paper.link || paper.pdfUrl;
          footNote.url = url;
        }
        await insertFootnoteToDoc(footNote, selection);
      }
      range.delete();
      return context.sync();
    });

  } catch (error) {
    await Word.run(async (context) => {
      // 输出异常
      const selection = context.document.getSelection();
      selection.insertText(`Sorry, there was an error.\n` + error.toString(), Word.InsertLocation.after);
      await context.sync();
    });
    console.error(error);
  } finally {
    event.completed();
  }
}

async function reviewComment(event: any) {
  //review_comment
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load(['isEmpty', 'text']);
      await context.sync();

      if (selection.isEmpty) {
        return "";
      }
      const text = selection.text;
      const messageRange = selection.insertText('Reviewing...\n', Word.InsertLocation.after);

      await context.sync();
      const { apiKey } = await getApiConfig();
      const result = await callPrompt('review_comment', text, {
        model: apiKey ? undefined : 'gpt-4o-mini',
        stream: false,
        temperature: 0.8
      });
      if (result) {
        const comment = extractJsonDataFromMd(result);
        const { comments = [] } = comment;

        for (let i = 0; i < comments.length; i++) {
          const { original, suggestion, type } = comments[i];
          const ranges = selection.search(original);
          ranges.load('items');
          await context.sync();
          for (let range of ranges.items) {
            // add comment
            range.insertComment(suggestion);
          }
          await context.sync();
          await sleep(1000);
        }
      }
      messageRange.delete();
    });

  } catch (error) {
    await Word.run(async (context) => {
      // 输出异常
      const selection = context.document.getSelection();
      selection.insertText(`Sorry, there was an error.\n` + error.toString(), Word.InsertLocation.after);
      await context.sync();
    });
    console.error(error);
  } finally {
    event.completed();
  }
}

async function correctComment(event: any) {
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load(['isEmpty', 'text']);
      await context.sync();

      if (selection.isEmpty) {
        return "";
      }
      const text = selection.text;
      const messageRange = selection.insertText('Correcting...\n', Word.InsertLocation.after);

      await context.sync();
      const { apiKey } = await getApiConfig();
      const result = await callPrompt('correct_comment', text, {
        model: apiKey ? undefined : 'gpt-4o-mini',
        stream: false,
        temperature: 0.8
      });
      if (result) {
        const comment = extractJsonDataFromMd(result);
        const { comments = [] } = comment;

        for (let i = 0; i < comments.length; i++) {
          const { original, suggestion, corrected, type } = comments[i];
          const ranges = selection.search(original);
          ranges.load('items');
          await context.sync();
          for (let range of ranges.items) {
            // replace text
            range.insertText(corrected, Word.InsertLocation.replace);
            // add comment
            range.insertComment(suggestion);
          }
          await context.sync();
          await sleep(1000);
        }
      }
      messageRange.delete();
    });

  } catch (error) {
    await Word.run(async (context) => {
      // 输出异常
      const selection = context.document.getSelection();
      selection.insertText(`Sorry, there was an error.\n` + error.toString(), Word.InsertLocation.after);
      await context.sync();
    });
    console.error(error);
  } finally {
    event.completed();
  }
}

async function detecAIComment(event: any) {
  try {
    await Word.run(async (context) => {
      const selection = context.document.getSelection();
      selection.load(['isEmpty', 'text']);
      await context.sync();

      if (selection.isEmpty) {
        return "";
      }
      const text = selection.text;
      const messageRange = selection.insertText('Detecting...\n', Word.InsertLocation.after);

      await context.sync();
      const { apiKey } = await getApiConfig();
      const result = await callPrompt('detect', text, {
        model: apiKey ? undefined : 'gpt-4o-mini',
        stream: false,
        temperature: 0.8
      });
      if (result) {
        const comment = extractJsonDataFromMd(result);
        // console.log(comment);
        const { comments = [] } = comment;

        for (let i = 0; i < comments.length; i++) {
          const { sentences, explanation } = comments[i];
          const ranges = selection.search(sentences);
          ranges.load('items');

          await context.sync();
          if (!ranges.items.length) {
            continue;
          }
          for (let range of ranges.items) {
            // add comment
            range.insertComment(explanation);
          }
          await context.sync();
          await sleep(1000);
        }
      }
      messageRange.delete();
    });

  } catch (error) {
    await Word.run(async (context) => {
      // 输出异常
      const selection = context.document.getSelection();
      selection.insertText(`Sorry, there was an error.\n` + error.toString(), Word.InsertLocation.after);
      await context.sync();
    });
    console.error(error);
  } finally {
    event.completed();
  }
}

async function paraphrase(event: any) {
  return await generate('rephrase', event, 'Replace')
}

async function convertToTable(event: any) {
  return await generate('convert_to_table', event)
}

async function convertToFlowchart(event: any) {
  return await generate('convert_to_flowchart', event)
}

async function convertToList(event: any) {
  return await generate('convert_to_list', event)
}

async function convertToEquation(event: any) {
  return await generate('convert_to_equation', event)
}

async function removeAllComments(event: any) {
  await Word.run(async (context) => {
    const comments = context.document.body.getComments();
    comments.load('items');
    await context.sync();

    for (let i = comments.items.length - 1; i >= 0; i--) {
      comments.items[i].delete();
    }

    await context.sync();

    event.completed();
  });
}
// async function makeTitles(event: any) {
//   return await generate('make_titles', event)
// }

async function help() {
  window.open('https://www.sally.bot/#contact', '_blank')
}
// You must register the function with the following line.
Office.actions.associate("help", help);
Office.actions.associate("summarize", summarize);
Office.actions.associate("makeLonger", makeLonger);
Office.actions.associate("makeShorter", makeShorter);
Office.actions.associate("contineWriting", contineWriting);
Office.actions.associate("refine", refine);
Office.actions.associate("spellCheck", spellCheck);
Office.actions.associate("grammarCheck", grammarCheck);
Office.actions.associate("addCitation", addCitation);
Office.actions.associate("review", reviewComment);
Office.actions.associate("correct", correctComment);
Office.actions.associate("detect", detecAIComment);
Office.actions.associate("paraphrase", paraphrase);
Office.actions.associate("removeAllComments", removeAllComments);
Office.actions.associate("convertToTable", convertToTable);
Office.actions.associate("convertToFlowchart", convertToFlowchart);
Office.actions.associate("convertToList", convertToList);
Office.actions.associate("convertToEquation", convertToEquation);

// Office.actions.associate("makeTitles", makeTitles);

