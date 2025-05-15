import type { Extension } from '@codemirror/state'; // Import Extension type for clarity
import { EditorView } from '@codemirror/view';
import DOMPurify from 'dompurify';
import TurndownService from 'turndown';
import type { Plugin } from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// --- Initialize and configure Turndown ---
const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  strongDelimiter: '**',
  linkStyle: 'inlined',
});
turndownService.use(gfm as Plugin);

export function pasteHtmlAsMarkdown(): Extension {
  return EditorView.domEventHandlers({
    paste(event: ClipboardEvent, view: EditorView) {
      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return false;
      }

      const pastedHTML = clipboardData.getData('text/html');

      if (pastedHTML && pastedHTML.length > 0) {
        event.preventDefault();

        let markdown = '';
        try {
          const cleanHTML = DOMPurify.sanitize(pastedHTML, {
            USE_PROFILES: { html: true },
          });
          markdown = turndownService.turndown(cleanHTML);
        } catch (e) {
          console.error('Error during HTML to Markdown conversion:', e);
          const pastedText = clipboardData.getData('text/plain');
          if (pastedText && pastedText.length > 0) {
            markdown = pastedText;
          } else {
            return true;
          }
        }

        if (markdown) {
          const { state } = view;
          const changes = state.selection.ranges.map((range) => ({
            from: range.from,
            to: range.to,
            insert: markdown,
          }));

          view.dispatch({ changes });
          view.dom.dispatchEvent(
            new Event('change', { bubbles: true, composed: true }),
          );
        }

        return true;
      }

      const pastedText = clipboardData.getData('text/plain');
      if (pastedText && pastedText.length > 0) {
        event.preventDefault();
        const { state } = view;
        const changes = state.selection.ranges.map((range) => ({
          from: range.from,
          to: range.to,
          insert: pastedText,
        }));
        view.dispatch({ changes });
        view.dom.dispatchEvent(
          new Event('change', { bubbles: true, composed: true }),
        );
        return true;
      }

      return false;
    },
  });
}
