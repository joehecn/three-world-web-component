import { html, css, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('j-btn-group')
export class JBtnGroup extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 36px;
      border-radius: 4px;
      background-color: #ddd;
      border: 1px solid #999;
      margin: 8px;
      overflow: hidden;
    }
  `;

  render() {
    return html`
      <div>
        <slot></slot>
      </div>
    `;
  }
}
