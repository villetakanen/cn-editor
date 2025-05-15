import { history } from '@codemirror/commands'; // Examples
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import {
  type Compartment,
  EditorState,
  type Extension,
} from '@codemirror/state';
import {
  EditorView,
  placeholder as cmPlaceholder,
  keymap,
} from '@codemirror/view';
import { basicSetup } from 'codemirror'; // Or import individual setup components

import { editorBaseTheme } from './cnEditorTheme';
// *** Custom Extensions ******************************************************
import { pasteHtmlAsMarkdown } from './cnPasteHandler';
// import { liveMarkdownDecorations } from './live-markdown-decorations'; // For Phase 3

// Define an interface for the callbacks for clarity
interface EditorCallbacks {
  onDocChanged: (newDoc: string) => void;
  onFocus: (event: FocusEvent, view: EditorView) => void;
  onBlur: (event: FocusEvent, view: EditorView) => void;
}

export function createEditorState(
  initialDoc: string,
  initialPlaceholder: string,
  initialIsDisabled: boolean,
  // Compartments are passed in so the component can manage their reconfiguration
  placeholderCompartment: Compartment,
  disabledCompartment: Compartment,
  callbacks: EditorCallbacks,
): EditorState {
  const extensions: Extension[] = [
    EditorView.lineWrapping,
    basicSetup,
    history(),
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
    }),
    placeholderCompartment.of(cmPlaceholder(initialPlaceholder)),
    disabledCompartment.of(EditorState.readOnly.of(initialIsDisabled)),

    // Turwdown plugin with GFM for Markdown paste handling
    pasteHtmlAsMarkdown(),

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
      blur: callbacks.onBlur,
    }),

    // Future Phase 3: live rendering extensions
    // liveMarkdownDecorations(),
  ];

  return EditorState.create({
    doc: initialDoc,
    extensions: extensions,
  });
}
