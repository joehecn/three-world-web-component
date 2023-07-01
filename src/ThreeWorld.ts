import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { query } from 'lit/decorators/query.js';

import { World } from './world/index.js';

import './tool/index.js';

import type { ToolData, Tree } from './world/type.js';

import { lilStyles } from './css/lil-gui.js';

export class ThreeWorld extends LitElement {
  static styles = [
    lilStyles,
    css`
      :host {
        height: 100%;
        width: 100%;
        display: block;
        /* padding: 25px; */
        /* color: var(--three-world-text-color, #000); */
      }

      .three-world {
        height: 100%;
        width: 100%;
        display: block;
      }

      .split {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
      }

      .split > div {
        /* width: 100%; */
        height: 100%;
      }

      .main-view {
        flex: auto;
        /* border: 2px solid #000; */
      }

      .tool-wrap {
        width: 400px;
        display: flex;
        flex-direction: column;
      }

      .second-view {
        border-top: 32px solid #000;
        border-left: 2px solid #000;
        flex: none;
      }

      .control-view {
        background-color: #000;
        flex: auto;
        overflow-y: auto;
      }
    `,
  ];

  private _world!: World;

  @state()
  _toolData: ToolData[] = [
    {
      group: 'operate',
      actived: 'move',
      btns: [
        {
          action: 'move',
        },
        {
          action: 'add',
        },
      ],
    },
    {
      group: 'setting',
      actived: '',
      btns: [
        {
          action: 'axes',
        },
      ],
    },
  ];

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) glb = '';

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: Array }) tree: Tree[] = [];

  @query('.three-world')
  _canvas!: HTMLCanvasElement;

  @query('.main-view')
  _mainView!: HTMLDivElement;

  @query('.second-view')
  _secondView!: HTMLDivElement;

  @query('.control-view')
  _controlView!: HTMLDivElement;

  firstUpdated(): void {
    if (!this.glb) return;

    const world = new World(
      this._canvas,
      this._mainView,
      this._secondView,
      this._controlView,
      this.tree
    );

    world.init(this.glb); // .catch(console.error);

    this._world = world;
  }

  private _setToolData(group: string, action: string, actived: string) {
    const data = JSON.parse(JSON.stringify(this._toolData));

    const item = data.find((it: ToolData) => it.group === group);

    let changed = true;
    if (group === 'setting') {
      item.actived = actived ? '' : action;
    } else if (item.actived === action) {
      changed = false;
    } else {
      item.actived = action;
    }

    if (changed) {
      this._toolData = data;
    }

    return { changed, item };
  }

  private _toolBtnClick(e: CustomEvent) {
    const { group, action, actived } = e.detail;
    const { changed, item } = this._setToolData(group, action, actived);
    if (changed) {
      this._world.toolAction(item);
    }
  }

  protected render() {
    return html`
      <j-tool
        .data=${this._toolData}
        @tool-btn-click="${this._toolBtnClick}"
      ></j-tool>
      <canvas class="three-world"></canvas>
      <div class="split">
        <div class="main-view"></div>
        <div class="tool-wrap">
          <div class="second-view"></div>
          <div class="control-view"></div>
        </div>
      </div>
    `;
  }
}

export type { Tree };
