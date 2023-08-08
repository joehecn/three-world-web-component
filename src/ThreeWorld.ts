import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { query } from 'lit/decorators/query.js';

import {
  type AxesConfig,
  type IconConfig,
  type ToolData,
  type Point,
  World,
  emitter,
  View,
} from './world/index.js';

import { lilStyles } from './css/lil-gui.js';

import './tool/index.js';

export class ThreeWorld extends LitElement {
  static styles = [
    lilStyles,
    css`
      :host {
        height: 100%;
        width: 100%;
        display: block;
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
        height: 100%;
      }

      .main-view {
        flex: auto;
      }

      .tool-wrap {
        width: 360px;
        display: flex;
        flex-direction: column;
      }
      .tool-wrap.hidden {
        display: none;
      }

      .second-view {
        border-top: 2px solid #000;
        border-left: 2px solid #000;
        flex: none;
      }

      .control-view {
        background-color: #000;
        flex: auto;
        overflow-y: auto;
      }

      @media (max-width: 1200px) {
        .second-view {
          display: none;
        }
      }
    `,
  ];

  private _world!: World;

  private _toolOperateActived: 'move' | 'add' = 'move';

  @state()
  _toolData: ToolData[] = [
    // {
    //   group: 'operate',
    //   actived: 'move',
    //   btns: [
    //     {
    //       action: 'move',
    //     },
    //     {
    //       action: 'add',
    //     },
    //   ],
    // },
    // {
    //   group: 'setting',
    //   actived: 'axes',
    //   btns: [
    //     {
    //       action: 'axes',
    //     },
    //   ],
    // },
  ];

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) view: View = 'read';

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) base = '';

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) glb = '';

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: String }) background = '#d9e1eb';

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: Object }) axes: AxesConfig = {
    size: 1,
    visible: false,
  };

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: Object }) icon: IconConfig = {
    scale: 0.16,
  };

  // * 重要 不要在内部改变外部传入的属性
  @property({ type: Array }) points: Point[] = [];

  @query('.three-world')
  _canvas!: HTMLCanvasElement;

  @query('.main-view')
  _mainView!: HTMLDivElement;

  @query('.second-view')
  _secondView!: HTMLDivElement;

  @query('.control-view')
  _controlView!: HTMLDivElement;

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
      const { group: g, actived: a } = item;
      if (g === 'setting') {
        const detail = { actived: a };
        const event = new CustomEvent('axes-setting-changed', {
          detail,
          bubbles: true,
          composed: true,
          cancelable: true,
        });
        this.dispatchEvent(event);
        return;
      }

      if (g === 'operate') {
        this._toolOperateActived = a;
        this._setEditAction();
      }

      this._world.toolAction(item);
    }
  }

  private _setEditAction(): void {
    this._toolData = [
      {
        group: 'operate',
        actived: this._toolOperateActived,
        btns: [
          {
            action: 'move',
          },
          {
            action: 'add',
          },
        ],
      },
    ];

    this._world.toolAction({
      group: 'operate',
      actived: this._toolOperateActived,
      btns: [
        {
          action: 'move',
        },
      ],
    });
  }

  private _init(): void {
    if (!this.base || !this.glb) return;
    if (this._world) this._world.dispose();

    this._world = new World(
      this.view,
      this.axes,
      this.icon,
      this.points,
      this._canvas,
      this._mainView,
      this._secondView,
      this._controlView
    );

    this._world.init(this.base, this.icon.scale, this.glb, this.background);

    if (this.view === 'read') {
      this._toolData = [];
      this._world.toolAction({
        group: 'operate',
        actived: 'move',
        btns: [
          {
            action: 'move',
          },
        ],
      });
    } else if (this.view === 'edit') {
      this._setEditAction();
    } else if (this.view === 'config') {
      this._toolData = [
        {
          group: 'setting',
          actived: this.axes.visible ? 'axes' : '',
          btns: [
            {
              action: 'axes',
            },
          ],
        },
      ];

      this._world.toolAction({
        group: 'operate',
        actived: 'move',
        btns: [
          {
            action: 'move',
          },
        ],
      });
    }
  }

  public addPoint(point: Point) {
    this._world.addPoint(this.base, point, this.icon.scale);
  }

  public removePoint(point: Point) {
    this._world.removePoint(point);
  }

  connectedCallback() {
    super.connectedCallback();

    emitter.on('on-point-create', (point: any) => {
      const detail = { point };
      const event = new CustomEvent('point-create', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(event);
    });

    emitter.on('on-point-selected', (point: any) => {
      let detail: any = { point: null };
      if (point.userData) {
        const { _id } = point.userData;
        const p = this.points.find((it: any) => it.userData._id === _id);
        detail = { point: p };
      }

      const event = new CustomEvent('point-selected', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(event);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    emitter.off('on-point-create');
    emitter.off('on-point-selected');
  }

  protected willUpdate(
    changedProperties: Map<string | number | symbol, unknown>
  ) {
    // console.log('willUpdate', changedProperties);
    if (
      changedProperties.has('view') ||
      changedProperties.has('base') ||
      changedProperties.has('glb') ||
      changedProperties.has('background') ||
      changedProperties.has('axes') ||
      changedProperties.has('icon')
    )
      this._init();

    // changedProperties.has('points')
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
        <div class=${this.view === 'config' ? 'tool-wrap' : 'tool-wrap hidden'}>
          <div class="second-view"></div>
          <div class="control-view"></div>
        </div>
      </div>
    `;
  }
}
