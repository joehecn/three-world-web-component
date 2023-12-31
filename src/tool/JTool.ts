import { css, LitElement } from 'lit';
import { html, unsafeStatic } from 'lit/static-html.js';
import { customElement, property } from 'lit/decorators.js';

import './JBtnGroup.js';
import './JBtn.js';
import '../icons/index.js';
import { ToolData } from '../world/type.js';

@customElement('j-tool')
export class JTool extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      z-index: 100;
    }
  `;

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: Array }) data: ToolData[] = [];

  protected render() {
    return html`
      ${this.data.map(
        item => html`
          <j-btn-group>
            ${item.btns.map(
              btn => html`
                <j-btn
                  .group=${item.group}
                  .action=${btn.action}
                  .actived=${item.actived}
                >
                  ${unsafeStatic(`<i-${btn.action} />`)}
                </j-btn>
              `
            )}
          </j-btn-group>
        `
      )}
    `;
  }
}
