import { history } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, placeholder as cmPlaceholder } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import './styles.css';
import { createEditorState } from './cnEditorConfig';
import { pasteHtmlAsMarkdown } from './cnPasteHandler';

@customElement('cn-editor')
export class CnEditor extends LitElement {
  // Attributes
  @property({ type: String, reflect: true }) value = '';
  @property({ type: Object }) selection: { start: number; end: number } | null =
    null;
  @property({ type: String, reflect: true }) placeholder = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  // *** Local state **********************************************************

  // @query to get the Codemate 6 container - Note that ID's are local to the
  // shadow DOM, and so we can use the same ID in multiple components without
  // conflict
  @query('#editor-container') private _editorContainer!: HTMLDivElement;
  private _editorView?: EditorView;
  private _placeholderCompartment = new Compartment();
  private _disabledCompartment = new Compartment();

  // *** Form associated element **********************************************
  static formAssociated = true;
  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  private _updateFormValue() {
    this._internals.setFormValue(this.value);
  }

  render() {
    // Note: since 2.0.0, we are using CodeMirror 6, and set all the options
    // trough its API.
    return html`<div id="editor-container"></div>`;
  }

  firstUpdated() {
    if (this._editorContainer) {
      const state = createEditorState(
        this.value,
        this.placeholder,
        this.disabled,
        this._placeholderCompartment,
        this._disabledCompartment,
        {
          // Callbacks object
          onDocChanged: (newDoc) => {
            if (this.value !== newDoc) {
              this.value = newDoc; // Sync back to Lit property
            }
            // This handles the 'input' event
            this.dispatchEvent(
              new Event('input', { bubbles: true, composed: true }),
            );
          },
          onFocus: (event, view) => {
            // this._valueOnFocus = view.state.doc.toString();
            this.dispatchEvent(
              new CustomEvent('focus', {
                bubbles: true,
                composed: true,
                detail: event,
              }),
            );
          },
          onBlur: (event, view) => {
            this.dispatchEvent(
              new CustomEvent('blur', {
                bubbles: true,
                composed: true,
                detail: event,
              }),
            );
            // Optional: 'change' event logic if value changed since focus
            // if (this._valueOnFocus !== view.state.doc.toString()) {
            //   this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            // }
          },
        },
      );

      this._editorView = new EditorView({
        state,
        parent: this._editorContainer,
      });
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('value')) {
      this._updateFormValue();
      if (
        this._editorView &&
        this.value !== this._editorView.state.doc.toString()
      ) {
        this._editorView.dispatch({
          changes: {
            from: 0,
            to: this._editorView.state.doc.length,
            insert: this.value,
          },
        });
      }
    }
    // Reconfigure placeholder and disabled state using compartments
    if (changedProperties.has('placeholder') && this._editorView) {
      this._editorView.dispatch({
        effects: this._placeholderCompartment.reconfigure(
          cmPlaceholder(this.placeholder),
        ),
      });
    }
    if (changedProperties.has('disabled') && this._editorView) {
      this._editorView.dispatch({
        effects: this._disabledCompartment.reconfigure(
          EditorState.readOnly.of(this.disabled),
        ),
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._editorView?.destroy();
  }

  _handleInput(e: Event) {
    e.stopImmediatePropagation();
    this.value = (e.target as HTMLTextAreaElement).value;
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  _handleChange(e: Event) {
    e.stopImmediatePropagation();
    this.value = (e.target as HTMLTextAreaElement).value;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  async _handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const html = e.clipboardData?.getData('text/html') || '';
    const text = e.clipboardData?.getData('text/plain') || '';

    const TurndownService = (await import('turndown')).default;
    const _turndownService = new TurndownService();

    if (html) {
      const markdown = _turndownService.turndown(html);
      this.insertText(markdown);
    } else {
      this.insertText(text);
    }
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  select() {
    if (this._editorView) {
      this._editorView.dispatch({
        selection: { anchor: 0, head: this._editorView.state.doc.length },
        scrollIntoView: true, // Ensure selection is visible
      });
      this._editorView.focus();
    }
  }

  async _copySelectionToClipboard() {
    // New name for clarity
    if (this._editorView) {
      const { state } = this._editorView;
      const selection = state.selection.main;
      if (!selection.empty) {
        const selectedText = state.doc.sliceString(
          selection.from,
          selection.to,
        );
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch (err) {
          console.error('Failed to copy: ', err);
        }
      }
    }
  }

  copy() {
    this._copySelectionToClipboard();
  }

  insertText(text: string) {
    if (this._editorView) {
      // Replace current selection or insert at cursor
      this._editorView.dispatch(this._editorView.state.replaceSelection(text));
      // this.value will be updated by the updateListener
      this._editorView.focus(); // Ensure editor is focused
    }
  }

  static styles = css`
    :host {
      display: contents;
    }
    #editor-container { /* The div CodeMirror attaches to */
      width: 100%;
      height: 100%;
    }
  `;
}
