import { HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

export const editorBaseTheme = EditorView.theme(
  {
    // "&" targets the .cm-editor (root) element
    '&': {
      // Sizing and spacing from :host textarea
      width: '100%',
      height: '100%',
      margin: '0',
      boxSizing: 'border-box',

      // Borders from :host textarea
      // This sets a border for all sides.
      // If var(--_cn-editor-border) is meant for T/L/R and var(--_cn-editor-border-bottom) for bottom:
      // you might need to set borderTop, borderLeft, borderRight individually if var(--_cn-editor-border)
      // is not a shorthand that excludes bottom, or if it's a full shorthand, borderBottom overrides.
      border: 'var(--_cn-editor-border)',
      borderBottom: 'var(--_cn-editor-border-bottom)', // Explicitly sets/overrides the bottom border for default state
      borderRadius: 'var(--_cn-editor-border-radius)',
      outline: 'none', // Remove default browser outline

      // Background and Text color from :host textarea
      // Background applied to the root, text color to the content area usually
      background: 'var(--color-input, black)',

      // Font properties applied broadly, can be overridden by more specific selectors if needed
      fontFamily: 'var(--cn-font-family-ui)',
      fontWeight: 'var(--cn-font-weight-ui)',
      fontSize: 'var(--cn-font-size-ui)',
      letterSpacing: 'var(--cn-letter-spacing-ui)',

      // Transition from :host textarea
      // For smoother border changes, targeting specific border properties is better
      // e.g., transition: "background 0.3s ease, border-bottom-color 0.3s ease",
      transition:
        'background 0.3s ease, border-color 0.3s ease, border-bottom-color 0.3s ease',
    },

    // Styles for the scrollable area (often good for line-height)
    '.cm-scroller': {
      fontFamily: 'inherit', // Inherit from .cm-editor
      lineHeight: 'var(--cn-line-height-ui)',
    },

    // Styles for the actual content area where text is typed
    '.cm-content': {
      padding: 'var(--_cn-editor-padding)',
      color: 'var(--color-on-field)',
    },

    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--color-caret)', // Use your CSS variable, with fallback
      // If you want a thicker cursor:
      borderLeftWidth: '2px',
    },

    // Hover state for the editor (when not focused)
    '&:not(.cm-focused):hover': {
      // Overrides only the bottom border color for hover
      borderBottomColor: 'var(--color-border-hover)',
      // If the entire border-bottom style changes (not just color):
      // borderBottom: "1px solid var(--color-border-hover)",
    },

    // Focus state for the editor
    '&.cm-focused': {
      outline: 'none', // Ensure no outline
      // Overrides only the bottom border color for focus
      borderBottomColor: 'var(--color-border-focus)',
      // If the entire border-bottom style changes:
      // borderBottom: "1px solid var(--color-border-focus)",
    },

    // Placeholder text styling
    '.cm-placeholder': {
      // Inherits font-family, weight, size, letter-spacing from .cm-editor or .cm-scroller
      // Explicitly set if needed or if they differ:
      // fontFamily: "var(--cn-font-family-ui)",
      // fontWeight: "var(--cn-font-weight-ui)",
      // fontSize: "var(--cn-font-size-ui)",
      // letterSpacing: "var(--cn-letter-spacing-ui)",
      lineHeight: 'var(--cn-line-height-ui)', // Important for alignment
      color: 'var(--color-on-field-placeholder, blue)',
    },

    // Selection styling
    // CodeMirror uses specific layers for selection. .cm-selectionBackground is key.
    // Also including general ::selection for robustness.
    '.cm-selectionBackground, & ::selection': {
      background: 'var(--color-selection) !important', // May need !important
    },

    /* --- Styling for Active Line --- */
    '.cm-activeLine': {
      borderRadius: '4px', // Optional, if you want rounded corners
      backgroundColor: 'transparent', // Background for active line in content
      // You can also add other styles like a subtle border if desired
      // E.g., borderLeft: "2px solid var(--color-accent, blue)"
    },

    // --- Styling for Line Numbers Gutter ---
    '.cm-gutters': {
      minWidth: 'calc(2 * var(--cn-gap))', // Minimum width for line numbers
      backgroundColor:
        'var(--color-elevation-1, var(--background-editor, black))', // Gutter background
      color: 'var(--color-on-button, cyan)', // Default color for gutter text (line numbers)
      borderRight: '1px solid var(--color-border, #ddd)', // Separator line
      // Ensure font matches if needed, though it often inherits from .cm-editor
      // fontFamily: "var(--cn-font-family-ui)",
      // fontSize: "calc(var(--cn-font-size-ui) * 0.9)", // Optionally make line numbers slightly smaller
    },

    // Styling for the active line in the gutter
    '.cm-gutter.cm-lineNumbers .cm-activeLineGutter': {
      width: '100%', // Full width for active line gutter
      backgroundColor:
        'var(--color-elevation-2, var(--background-editor, black))',
    },
    '.cm-activeLineGutter': {
      width: '100%', // Full width for active line gutter
      backgroundColor:
        'var(--color-elevation-3, var(--background-editor, black))',
    },
    '& .cm-inline-code': {
      color: 'red',
    },
    '& .cm-quote': {
      backgroundColor: 'var(--color-secondary)',
    },
  },
  { dark: document.body.classList.contains('dark') },
);

export const cnMarkdownHighlightStyle = HighlightStyle.define([
  {
    tag: t.heading1,
    fontSize: 'var(--cn-heading-1-font-size)',
    fontWeight: 'var(--cn-heading-1-font-weight)',
    lineHeight: 'var(--cn-heading-1-line-height)',
    color: 'var(--color-heading-1)',
  },
  {
    tag: t.heading2,
    fontSize: 'var(--cn-heading-2-font-size)',
    fontWeight: 'var(--cn-heading-2-font-weight)',
    lineHeight: 'var(--cn-heading-2-line-height)',
    color: 'var(--color-heading-1)',
  },
  {
    tag: t.heading3,
    fontSize: 'var(--cn-heading-3-font-size)',
    fontWeight: 'var(--cn-heading-3-font-weight)',
    lineHeight: 'var(--cn-heading-3-line-height)',
    color: 'var(--color-heading-2)',
  },
  {
    tag: t.heading4,
    fontSize: 'var(--cn-heading-4-font-size)',
    fontWeight: 'var(--cn-heading-4-font-weight)',
    lineHeight: 'var(--cn-heading-4-line-height)',
    color: 'var(--color-heading-2)',
  },

  { tag: t.strong, fontWeight: 'bold', color: 'var(--color-on-code-strong)' },
  {
    tag: t.emphasis,
    fontStyle: 'italic',
    color: 'var(--color-on-code-emphasis)',
  },
  { tag: t.link, textDecoration: 'underline' },
  {
    tag: t.monospace,
    color: 'var(--color-on-code)',
    backgroundColor: 'var(--color-code)',
    fontFamily: 'var(--cn-font-family-mono, monospace)',
  },
  {
    tag: t.quote,
    class: 'cm-quote',
  },
]);
