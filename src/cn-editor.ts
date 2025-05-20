import { Compartment, EditorState } from '@codemirror/state';
import {
  EditorView,
  placeholder as cmPlaceholder,
  lineNumbers,
} from '@codemirror/view';
// Libs
import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

// Local imports
import './styles.css';
import { createEditorState } from './cnEditorConfig';

@customElement('cn-editor')
export class CnEditor extends LitElement {
  // --- Properties, all reflect to attributes --------------------------------
  @property({ type: String, reflect: true }) value = '';
  @property({ type: String, reflect: true }) placeholder = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  // Show/hide gutter (line numbers) from the editor
  @property({ type: Boolean, reflect: true }) gutter = false;

  // --- Local state ----------------------------------------------------------

  // The container for the CodeMirror editor, the id is shadow DOM scoped
  @query('#editor-container') private _editorContainer!: HTMLDivElement;

  // The CodeMirror editor instance
  private _editorView?: EditorView;
  private _placeholderCompartment = new Compartment();
  private _disabledCompartment = new Compartment();
  private _gutterCompartment = new Compartment();

  // Store the value on focus for potential use in blur event
  private _valueOnFocus = '';
  // Flag to prevent re-entrant focus calls
  private _isDelegatingFocus = false;

  // --- Form associated element ----------------------------------------------
  static formAssociated = true;
  private _internals: ElementInternals;

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.addEventListener('focus', this._handleHostFocus.bind(this)); // Bind here for consistency
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.getAttribute('tabindex') === null) {
      this.setAttribute('tabindex', '0');
    }
  }

  private _updateFormValue() {
    this._internals.setFormValue(this.value);
  }

  private _handleHostFocus(_event: FocusEvent) {
    // This is the native focus event handler for the <cn-editor> host.
    // External listeners will receive THIS event.
    // console.log('[CN-EDITOR] _handleHostFocus (Native Host Focus) CALLED. Current activeElement:', document.activeElement);

    if (this._isDelegatingFocus) {
      // console.log('[CN-EDITOR] Already delegating focus, ignoring re-entrant call.');
      return;
    }

    // If CodeMirror's content DOM is not already the active element, delegate focus.
    if (
      this._editorView &&
      document.activeElement !== this._editorView.contentDOM
    ) {
      // console.log('[CN-EDITOR] Host focused, delegating to CodeMirror.');
      this._isDelegatingFocus = true;
      this._editorView.focus();

      requestAnimationFrame(() => {
        this._isDelegatingFocus = false;
      });
    }
    // DO NOT dispatch a new CustomEvent('focus') here. The native event is sufficient.
    // _valueOnFocus will be set by CodeMirror's internal onFocus callback.
  }

  render() {
    // Note: since 2.0.0, we are using CodeMirror 6, and set all the options
    // trough its API.
    return html`<div id="editor-container"></div>`;
  }

  firstUpdated() {
    if (this._editorContainer) {
      this._editorContainer.addEventListener(
        'focusout',
        this._handleFocusOut.bind(this),
      );

      const state = createEditorState(
        this.value,
        this.placeholder,
        this.disabled,
        this.gutter,
        this._placeholderCompartment,
        this._disabledCompartment,
        this._gutterCompartment, // <<< Pass gutter compartment
        {
          // Callbacks object
          onDocChanged: (newDoc) => {
            if (this.value !== newDoc) {
              this.value = newDoc;
            }
            this.dispatchEvent(
              new Event('input', { bubbles: true, composed: true }),
            );
          },
          onFocus: (_cmFocusEvent, view) => {
            // This is called when CodeMirror's contentDOM itself gains focus.
            // This is the most reliable place to set _valueOnFocus.
            this._valueOnFocus = view.state.doc.toString();
          },
        },
      );

      this._editorView = new EditorView({
        state,
        parent: this._editorContainer,
      });
    } else {
      console.error(
        '[cn-editor]: CodeMirror container not found in firstUpdated!',
      );
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
    // --- Handle gutter property change ---
    if (changedProperties.has('gutter') && this._editorView) {
      this._editorView.dispatch({
        effects: this._gutterCompartment.reconfigure(
          this.gutter ? lineNumbers() : [],
        ),
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('focus', this._handleHostFocus); // No need to bind again if bound in constructor or using arrow func
    this._editorView?.destroy();
    if (this._editorContainer) {
      this._editorContainer.removeEventListener(
        'focusout',
        this._handleFocusOut.bind(this),
      ); // Or store bound ref
    }
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

  private _handleFocusOut(event: FocusEvent) {
    //console.log('[cn-editor] _handleFocusOut CALLED. relatedTarget:', event.relatedTarget, 'Current activeElement:', document.activeElement);
    const shadow = this.shadowRoot;

    if (!shadow) {
      console.error('[cn-editor] ShadowRoot not found in _handleFocusOut.');
      return;
    }

    let focusHasLeftComponent = false;
    if (!event.relatedTarget) {
      // Focus lost to browser chrome or non-focusable area
      focusHasLeftComponent = true;
    } else {
      // Focus went to an element that is NOT the host itself AND is NOT within the shadow DOM
      if (
        event.relatedTarget !== this &&
        !shadow.contains(event.relatedTarget as Node)
      ) {
        focusHasLeftComponent = true;
      }
    }

    if (focusHasLeftComponent) {
      // console.log('[CN-EDITOR] Focus truly moved outside component (from _editorContainer focusout). Value on focus:', this._valueOnFocus, 'Current value:', this.value);

      // DO NOT dispatch custom 'blur' event from here anymore.
      // The native 'blur' event on the host element will be the one external listeners get.
      // this.dispatchEvent(new CustomEvent('blur', { /* ... */ }));

      if (this._valueOnFocus !== this.value) {
        // console.log('[CN-EDITOR] Value changed since focus, dispatching component change event from _handleFocusOut.');
        this.dispatchEvent(
          new Event('change', { bubbles: true, composed: true }),
        );
      }
    }
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
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
    }
  `;
}
