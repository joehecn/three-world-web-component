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
import { ModelConfig } from './world/type.js';

export class ThreeWorld extends LitElement {
  static styles = [
    lilStyles,
    css`
      * {
        box-sizing: border-box;
      }
      :host {
        height: 100%;
        width: 100%;
        display: block;
      }

      .main-div {
        height: 100%;
        width: 100%;
        position: relative;
      }

      .three-world {
        /* height: 100%; */
        /* width: 100%; */
        display: block;
        /* aspect-ratio: revert-layer; */
      }

      .split {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
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

  private ON_POINT_CREATE = Symbol('on-point-create');

  private ON_POINT_SELECTED = Symbol('on-point-selected');

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

  // 传入主相机的属性
  @property({ type: Object }) modelConfig: ModelConfig = {
    mainLightConfig: {
      color: '999999',
      position: {
        x: 2,
        y: 6,
        z: 0,
      },
      intensity: 1,
    },
    secondLightConfig: {
      color: 'dddddd',
      groundColor: '2f4f4f',
      intensity: 1,
    },
    mainCameraConfig: {
      fov: 45,
      near: 0.1,
      far: 1000,
      position: [100, 100, 100],
      up: [0, 1, 0],
    },
    secondCameraConfig: {
      fov: 45,
      near: 0.1,
      far: 1000,
      position: [100, 100, 100],
    },
  };

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

      if (g === 'operate' && this.view === 'edit') {
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

    // console.log('ThreeWorld._init', this.axes);

    this._world = new World(
      this.view,
      this.axes,
      this.icon,
      this.points,
      this.modelConfig,
      this._canvas,
      this._mainView,
      this._secondView,
      this._controlView,
      this.ON_POINT_CREATE,
      this.ON_POINT_SELECTED
    );

    this._world.init(this.base, this.icon.scale, this.glb, this.background);

    // 设置操作按钮
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

  public getConfigData() {
    return this._world.getConfigData();
  }

  // 获取当前点的信息
  public getPointInfo() {
    const { object, _point } = this._world.getCurrentPointInfo();
    let detail: any = { point: null, scale: null };
    if (object && _point) {
      if (object.userData) {
        const { _id } = object.userData;
        const p = this.points.find((it: any) => it.userData._id === _id);
        if (p) {
          p._point = _point.toArray();
        }
        detail = { point: p, scale: object.scale.x };
      }
    }
    return detail;
  }

  connectedCallback() {
    super.connectedCallback();

    emitter.on(this.ON_POINT_CREATE, (point: any) => {
      // console.log('ON_POINT_CREATE', point);
      const detail = { point };
      const event = new CustomEvent('point-create', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      this.dispatchEvent(event);
    });

    emitter.on(this.ON_POINT_SELECTED, (point: any) => {
      // console.log('ON_POINT_SELECTED', point);
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
    emitter.off(this.ON_POINT_CREATE);
    emitter.off(this.ON_POINT_SELECTED);
  }

  protected willUpdate(
    changedProperties: Map<string | number | symbol, unknown>
  ) {
    if (
      changedProperties.has('view') ||
      changedProperties.has('base') ||
      changedProperties.has('glb') ||
      changedProperties.has('background') ||
      changedProperties.has('modelConfig') ||
      changedProperties.has('icon')
    ) {
      if (!this._canvas) return;

      this._init();
    } else if (changedProperties.has('axes')) {
      this._world.updateAxes(this.axes);
    }
  }

  protected render() {
    return html`
      <div class="main-div">
        <j-tool
          .data=${this._toolData}
          @tool-btn-click="${this._toolBtnClick}"
        ></j-tool>
        <canvas class="three-world"></canvas>
        <div class="split">
          <div class="main-view"></div>
          <div class=${this.view !== 'read' ? 'tool-wrap' : 'tool-wrap hidden'}>
            <div class="second-view"></div>
            <div class="control-view"></div>
          </div>
        </div>
      </div>
    `;
  }
}
