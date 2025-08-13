import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  standardKeymap,
} from '@codemirror/commands'; // Examples
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
// Import necessary syntax highlighting tools
import { syntaxHighlighting } from '@codemirror/language'; // <<< ADD THIS IMPORT
import { languages } from '@codemirror/language-data';
import {
  type Compartment,
  EditorState,
  type Extension,
} from '@codemirror/state';
import {
  placeholder as cmPlaceholder,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
} from '@codemirror/view';

import { cnMarkdownHighlightStyle, editorBaseTheme } from './cnEditorTheme';
// *** Custom Extensions ******************************************************
import { pasteHtmlAsMarkdown } from './cnPasteHandler';

// import { liveMarkdownDecorations } from './live-markdown-decorations'; // For Phase 3

// Define an interface for the callbacks for clarity
interface EditorCallbacks {
  onDocChanged: (newDoc: string) => void;
  onFocus: (event: FocusEvent, view: EditorView) => void;
}

export function createEditorState(
  initialDoc: string,
  initialPlaceholder: string,
  initialIsDisabled: boolean,
  initialShowGutter: boolean,
  // Compartments are passed in so the component can manage their reconfiguration
  placeholderCompartment: Compartment,
  disabledCompartment: Compartment,
  gutterCompartment: Compartment,
  callbacks: EditorCallbacks,
): EditorState {
  const allKeymaps = keymap.of([
    ...standardKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    indentWithTab, // Handles Tab and Shift+Tab for indentation
  ]);

  const extensions: Extension[] = [
    EditorView.lineWrapping,
    allKeymaps,
    history(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    highlightSpecialChars(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
    }),

    placeholderCompartment.of(cmPlaceholder(initialPlaceholder)),
    disabledCompartment.of(EditorState.readOnly.of(initialIsDisabled)),

    // --- Conditional gutter extension via compartment ---
    gutterCompartment.of(initialShowGutter ? lineNumbers() : []),

    // Turwdown plugin with GFM for Markdown paste handling
    pasteHtmlAsMarkdown(),
    syntaxHighlighting(cnMarkdownHighlightStyle, { fallback: true }),

    // Cyan Design System theming for the editor
    editorBaseTheme,

    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        callbacks.onDocChanged(update.state.doc.toString());
      }
      // If you need to report selection changes:
      // if (update.selectionSet) {
      //   callbacks.onSelectionChanged(update.state.selection);
      // }
    }),
    EditorView.domEventHandlers({
      focus: callbacks.onFocus,
    }),

    // Future Phase 3: live rendering extensions
    // liveMarkdownDecorations(),
  ];

  return EditorState.create({
    doc: initialDoc,
    extensions: extensions,
  });
}
