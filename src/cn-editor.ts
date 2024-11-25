import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './styles.css';

@customElement('cn-editor')
export class CnEditor extends LitElement {
  // Attributes
  @property({ type: String, reflect: true }) value = '';
  @property({ type: Object }) selection: { start: number; end: number } | null =
    null;
  @property({ type: String, reflect: true }) placeholder = '';
  @property({ type: Boolean, reflect: true }) disabled = false;

  private _textArea: HTMLTextAreaElement | null = null;

  static formAssociated = true;

  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
  }

  private _updateFormValue() {
    this._internals.setFormValue(this.value);
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('value')) {
      this._updateFormValue();
    }
  }

  render() {
    return html`
      <textarea
        @input="${this._handleInput}"
        @change="${this._handleChange}"
        @paste="${this._handlePaste}"
        @blur="${this._handleBlur}"
        @focus="${this._handleFocus}"
        placeholder="${this.placeholder}"
        ?disabled="${this.disabled}"
      >${this.value}</textarea>
    `;
  }

  firstUpdated() {
    this._textArea = this.shadowRoot?.querySelector(
      'textarea',
    ) as HTMLTextAreaElement;
  }

  _handleInput(e: Event) {
    e.stopImmediatePropagation();
    this.value = (e.target as HTMLTextAreaElement).value;
    this.dispatchEvent(
      new CustomEvent('input', { detail: { value: this.value } }),
    );
  }

  _handleChange(e: Event) {
    e.stopImmediatePropagation();
    this.value = (e.target as HTMLTextAreaElement).value;
    this.dispatchEvent(
      new CustomEvent('change', { detail: { value: this.value } }),
    );
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
    this.dispatchEvent(
      new CustomEvent('change', { detail: { value: this.value } }),
    );
  }

  async _copy() {
    if (this._textArea) {
      const selectedText = this._textArea.value.substring(
        this._textArea.selectionStart || 0,
        this._textArea.selectionEnd || 0,
      );
      try {
        await navigator.clipboard.writeText(selectedText);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  }

  select() {
    if (this._textArea) {
      this._textArea.select();
    }
  }

  copy() {
    this.select();
    this._copy(); // Use the updated _copy method
  }

  insertText(text: string) {
    if (this._textArea) {
      const start = this._textArea.selectionStart || 0;
      const end = this._textArea.selectionEnd || 0;
      const newValue =
        this.value.substring(0, start) + text + this.value.substring(end);
      this._textArea.value = newValue;
      this._textArea.selectionStart = start + text.length;
      this._textArea.selectionEnd = start + text.length;
      this.value = newValue;
      this.dispatchEvent(
        new CustomEvent('input', { detail: { value: this.value } }),
      );
    }
  }

  _handleBlur() {
    if (this._textArea) {
      this.selection = {
        start: this._textArea.selectionStart || 0,
        end: this._textArea.selectionEnd || 0,
      };
      this.dispatchEvent(new CustomEvent('selectionchange'));
    }
  }

  _handleFocus() {
    if (this._textArea && this.selection) {
      this._textArea.selectionStart = this.selection.start;
      this._textArea.selectionEnd = this.selection.end;
      this.selection = null;
    }
  }

  static styles = css`
    :host {
      display: contents;
    }
    :host textarea {
      /* Sizing and spacing */
      width: 100%;
      height: 100%;
      margin: 0;
      box-sizing: border-box;
      padding: var(--_cn-editor-padding);
      
      /* Borders */
      border: var(--_cn-editor-border);
      border-bottom: var(--_cn-editor-border-bottom);
      border-radius: var(--_cn-editor-border-radius);
      outline: none;

      
      transition: background 0.3s ease, border 0.3s ease;
      background: var(--background-editor, black);
      color: var(--color-on-field);
      
      
      // UI text-styling
      font-family: var(--cn-font-family-ui);
      font-weight: var(--cn-font-weight-ui);
      font-size: var(--cn-font-size-ui);
      line-height: var(--cn-line-height-ui);
      letter-spacing: var(--cn-letter-spacing-ui);
    }
    :host textarea:hover {
      border-bottom: 1px solid var(--color-border-hover);
    }
    :host textarea:focus {
        outline: none;
        border-bottom: 1px solid var(--color-border-focus);
    }
    :host textarea::placeholder {
      // UI text-styling
      font-family: var(--cn-font-family-ui);
      font-weight: var(--cn-font-weight-ui);
      font-size: var(--cn-font-size-ui);
      line-height: var(--cn-line-height-ui);
      letter-spacing: var(--cn-letter-spacing-ui);
      color: var(--color-on-field-placeholder, blue)
    }
    :host textarea::selection {
      background: var(--color-selection);
    }
  `;
}
