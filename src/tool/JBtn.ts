import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('j-btn')
export class JBtn extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 36px;
      display: block;
      overflow: hidden;
    }

    button {
      margin: 0;
      padding: 0;
      border: none;
      background: none;
    }

    button:hover {
      background-color: #eee;
    }
    button.actived {
      background-color: #fff;
    }
  `;

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) group = '';

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) action = '';

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) actived = '';

  private _btnClick() {
    this.dispatchEvent(
      new CustomEvent('tool-btn-click', {
        detail: {
          group: this.group,
          action: this.action,
          actived: this.actived,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render() {
    return html`
      <button
        class=${this.action && this.action === this.actived ? 'actived' : ''}
        @click="${this._btnClick}"
      >
        <slot></slot>
      </button>
    `;
  }
}
