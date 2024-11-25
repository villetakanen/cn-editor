import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import TurndownService from "turndown";

@customElement("cn-editor")
export class CnEditor extends LitElement {
	@property({ type: String }) value = "";
	@property({ type: Object }) selection: { start: number; end: number } | null =
		null;
	@property({ type: String }) placeholder = "";

	private _textArea: HTMLTextAreaElement | null = null;
	private _turndownService = new TurndownService();

	render() {
		return html`
      <textarea
        @input="${this._handleInput}"
        @change="${this._handleChange}"
        @paste="${this._handlePaste}"
        @blur="${this._handleBlur}"
        @focus="${this._handleFocus}"
        placeholder="${this.placeholder}"
      >${this.value}</textarea>
    `;
	}

	firstUpdated() {
		this._textArea = this.shadowRoot?.querySelector(
			"textarea",
		) as HTMLTextAreaElement;
	}

	_handleInput(e: Event) {
		e.stopImmediatePropagation();
		this.value = (e.target as HTMLTextAreaElement).value;
		this.dispatchEvent(
			new CustomEvent("input", { detail: { value: this.value } }),
		);
	}

	_handleChange(e: Event) {
		e.stopImmediatePropagation();
		this.value = (e.target as HTMLTextAreaElement).value;
		this.dispatchEvent(
			new CustomEvent("change", { detail: { value: this.value } }),
		);
	}

	_handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const html = e.clipboardData?.getData("text/html") || "";
		const text = e.clipboardData?.getData("text/plain") || "";

		if (html) {
			const markdown = this._turndownService.turndown(html);
			this.insertText(markdown);
		} else {
			this.insertText(text);
		}
		this.dispatchEvent(
			new CustomEvent("change", { detail: { value: this.value } }),
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
				console.error("Failed to copy: ", err);
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
				new CustomEvent("cn-editor-input", { detail: { value: this.value } }),
			);
		}
	}

	_handleBlur() {
		if (this._textArea) {
			this.selection = {
				start: this._textArea.selectionStart || 0,
				end: this._textArea.selectionEnd || 0,
			};
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
      width: 100%;
      height: 100%;
      border: none;
      transition: background 0.3s ease, border 0.3s ease;
      background: var(--background-editor, black);
      padding: var(--cn-grid);
      color: var(--color-on-field);
      border-bottom: 1px solid var(--color-border);
      border-radius: var(--cn-border-radius-field);
      margin: 0;
      box-sizing: border-box;
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
