# `<cn-editor>`

A powerful, themeable, and form-associated Markdown editor component built with Lit and CodeMirror 6. It provides a rich editing experience with features like syntax highlighting, HTML-to-Markdown pasting, and optional line numbers.

## Properties

| Property      | Type      | Default | Description                                               |
|---------------|-----------|---------|-----------------------------------------------------------|
| `value`       | `string`  | `''`    | The Markdown content of the editor.                       |
| `placeholder` | `string`  | `''`    | Placeholder text to show when the editor is empty.        |
| `disabled`    | `boolean` | `false` | Disables the editor, making it read-only.                 |
| `gutter`      | `boolean` | `false` | Toggles the visibility of the line number gutter.         |

## Methods

| Method                  | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `select()`              | Selects all content within the editor.                                      |
| `copy()`                | Copies the currently selected text to the clipboard.                        |
| `insertText(text: string)` | Inserts the given text at the current cursor or replaces the selection. |

## Events

| Event    | Description                                                                 |
|----------|-----------------------------------------------------------------------------|
| `input`  | Fired whenever the editor's content changes. Bubbles and is composed.       |
| `change` | Fired when the value is committed, such as on blur or after a paste. Bubbles and is composed. |

## Usage

Here is a basic example of how to use the `<cn-editor>` component.

```html
<cn-editor
  value="# Hello, World!\n\nThis is a `cn-editor` component."
  placeholder="Start typing your markdown here..."
></cn-editor>

<script>
  const editor = document.querySelector('cn-editor');
  editor.addEventListener('input', (e) => {
    console.log('Editor content:', e.target.value);
  });
</script>
```

### With Line Numbers

To enable the line number gutter, set the `gutter` attribute.

```html
<cn-editor gutter value="1. First line\n2. Second line"></cn-editor>
```

## Styling

The editor can be styled using the CSS custom properties defined in [`packages/cn-editor/src/styles.css`](packages/cn-editor/src/styles.css). The CodeMirror theme itself is configured in [`packages/cn-editor/src/cnEditorTheme.ts`](packages/cn-editor/src/cnEditorTheme.ts) and uses design tokens from the `cyan-css` package.

Key custom properties for theming:
- `--_cn-editor-border`: The default border for the editor.
- `--_cn-editor-border-bottom`: The bottom border, which can be styled separately.
- `--_cn-editor-border-radius`: The border-radius of the editor container.
- `--color-caret`: The color of the editor's cursor.
- `--color-selection`: The background color of selected text.

## Accessibility and Form Integration

- The component is a form-associated custom element, meaning it can be used directly within a `<form>` and its value will be included on submission.
- It properly manages focus, delegating it to the underlying CodeMirror editor instance.
- It can be focused and interacted with using keyboard navigation.
