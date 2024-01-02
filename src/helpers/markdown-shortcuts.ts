/* eslint-disable no-prototype-builtins */
/* eslint-disable no-unused-vars */
import Quill from 'quill';

let BlockEmbed = Quill.import('blots/block/embed');

class HorizontalRule extends BlockEmbed {}

HorizontalRule.blotName = 'hr';
HorizontalRule.tagName = 'hr';

Quill.register('formats/horizontal', HorizontalRule);

class MarkdownShortcuts {
  quill: Quill;
  options: any;
  ignoreTags: string[];
  matches: any[];

  constructor(quill: Quill, options: any) {
    this.quill = quill;
    this.options = options;

    this.ignoreTags = ['PRE'];
    this.matches = [
      {
        name: 'header',
        pattern: /^(#){1,6}\s/g,
        action: (text: string, selection: any, pattern: any) => {
          var match = pattern.exec(text);
          if (!match) return;
          const size = match[0].length;
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(() => {
            this.quill.formatLine(selection.index, 0, 'header', size - 1);
            this.quill.deleteText(selection.index - size, size);
          }, 0);
        },
      },
      {
        name: 'blockquote',
        pattern: /^(>)\s/g,
        action: (_text: string, selection: any) => {
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(() => {
            this.quill.formatLine(selection.index, 1, 'blockquote', true);
            this.quill.deleteText(selection.index - 2, 2);
          }, 0);
        },
      },
      {
        name: 'code-block',
        pattern: /^`{3}(?:\s|\n)/g,
        action: (_text: string, selection: any) => {
          // Need to defer this action https://github.com/quilljs/quill/issues/1134
          setTimeout(() => {
            this.quill.formatLine(selection.index, 1, 'code-block', true);
            this.quill.deleteText(selection.index - 4, 4);
          }, 0);
        },
      },
      {
        name: 'bolditalic',
        pattern: /(?:\*|_){3}(.+?)(?:\*|_){3}/g,
        action: (text: string, _selection: any, pattern: any, lineStart: number) => {
          let match = pattern.exec(text);

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, {
              bold: true,
              italic: true,
            });
            this.quill.format('bold', false);
          }, 0);
        },
      },
      {
        name: 'bold',
        pattern: /(?:\*|_){2}(.+?)(?:\*|_){2}/g,
        action: (text: string, _selection: any, pattern: any, lineStart: number) => {
          let match = pattern.exec(text);

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { bold: true });
            this.quill.format('bold', false);
          }, 0);
        },
      },
      {
        name: 'italic',
        pattern: /(?:\*|_){1}(.+?)(?:\*|_){1}/g,
        action: (text: string, _selection: any, pattern: any, lineStart: number) => {
          let match = pattern.exec(text);

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { italic: true });
            this.quill.format('italic', false);
          }, 0);
        },
      },
      {
        name: 'strikethrough',
        pattern: /(?:~~)(.+?)(?:~~)/g,
        action: (text: string, _selection: any, pattern: any, lineStart: number) => {
          let match = pattern.exec(text);

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { strike: true });
            this.quill.format('strike', false);
          }, 0);
        },
      },
      {
        name: 'code',
        pattern: /(?:`)(.+?)(?:`)/g,
        action: (text: string, _selection: any, pattern: any, lineStart: number) => {
          let match = pattern.exec(text);

          const annotatedText = match[0];
          const matchedText = match[1];
          const startIndex = lineStart + match.index;

          if (text.match(/^([*_ \n]+)$/g)) return;

          setTimeout(() => {
            this.quill.deleteText(startIndex, annotatedText.length);
            this.quill.insertText(startIndex, matchedText, { code: true });
            this.quill.format('code', false);
            const selection = this.quill.getSelection();
            if (selection) {
              this.quill.insertText(selection.index, ' ');
            }
          }, 0);
        },
      },
      {
        name: 'hr',
        pattern: /^([-*]\s?){3}/g,
        action: (text: string, selection: any) => {
          const startIndex = selection.index - text.length;
          setTimeout(() => {
            this.quill.deleteText(startIndex, text.length);

            this.quill.insertEmbed(startIndex + 1, 'hr', true, Quill.sources.USER);
            this.quill.insertText(startIndex + 2, '\n', Quill.sources.SILENT);
            this.quill.setSelection({ index: startIndex + 2, length: 0 }, Quill.sources.SILENT);
          }, 0);
        },
      },
      {
        name: 'asterisk-ul',
        pattern: /^(\*|\+)\s$/g,
        action: (_text: string, selection: any, _pattern: any) => {
          setTimeout(() => {
            this.quill.formatLine(selection.index, 1, 'list', 'unordered');
            this.quill.deleteText(selection.index - 2, 2);
          }, 0);
        },
      },
      {
        name: 'image',
        pattern: /(?:!\[(.+?)\])(?:\((.+?)\))/g,
        action: (text: string, selection: any, pattern: any) => {
          const startIndex = text.search(pattern);
          const matchedText = text.match(pattern)?.[0];
          // const hrefText = text.match(/(?:!\[(.*?)\])/g)[0]
          const hrefLink = text.match(/(?:\((.*?)\))/g)?.[0];
          const start = selection.index - (matchedText?.length ?? 0) - 1;
          if (startIndex !== -1 && matchedText && hrefLink) {
            setTimeout(() => {
              this.quill.deleteText(start, matchedText.length);
              this.quill.insertEmbed(start, 'image', hrefLink.slice(1, hrefLink.length - 1));
            }, 0);
          }
        },
      },
      {
        name: 'link',
        pattern: /(?:\[(.+?)\])(?:\((.+?)\))/g,
        action: (text: string, selection: any, pattern: any) => {
          const startIndex = text.search(pattern);
          const matchedText = text.match(pattern)?.[0];
          const hrefText = text.match(/(?:\[(.*?)\])/g)?.[0] ?? '';
          const hrefLink = text.match(/(?:\((.*?)\))/g)?.[0] ?? '';
          const start = selection.index - (matchedText?.length ?? 0) - 1;
          if (startIndex !== -1) {
            setTimeout(() => {
              this.quill.deleteText(start, matchedText?.length ?? 0);
              this.quill.insertText(
                start,
                hrefText.slice(1, hrefText.length - 1),
                'link',
                hrefLink.slice(1, hrefLink.length - 1)
              );
            }, 0);
          }
        },
      },
    ];

    this.quill.on('text-change', (delta, _oldContents, _source) => {
      for (let i = 0; i < delta.ops.length; i++) {
        if (delta.ops[i].hasOwnProperty('insert')) {
          if (delta.ops[i].insert === ' ') {
            this.onSpace();
          } else if (delta.ops[i].insert === '\n') {
            this.onEnter();
          }
        }
      }
    });
  }

  isValid(text: string, tagName: string): boolean {
    return typeof text !== 'undefined' && text !== '' && this.ignoreTags.indexOf(tagName) === -1;
  }

  onSpace(): void {
    const selection = this.quill.getSelection();
    if (!selection) return;
    const [line, offset] = this.quill.getLine(selection.index);
    const text = line.domNode.textContent;
    const lineStart = selection.index - offset;
    if (this.isValid(text, line.domNode.tagName)) {
      for (let match of this.matches) {
        const matchedText = text.match(match.pattern);
        if (matchedText) {
          match.action(text, selection, match.pattern, lineStart);
          return;
        }
      }
    }
  }

  onEnter(): void {
    let selection = this.quill.getSelection();
    if (!selection) return;
    const [line, offset] = this.quill.getLine(selection.index);
    const text = line.domNode.textContent + ' ';
    const lineStart = selection.index - offset;
    selection.length = selection.index++;
    if (this.isValid(text, line.domNode.tagName)) {
      for (let match of this.matches) {
        const matchedText = text.match(match.pattern);
        if (matchedText) {
          match.action(text, selection, match.pattern, lineStart);
          return;
        }
      }
    }
  }
}

export default MarkdownShortcuts;
