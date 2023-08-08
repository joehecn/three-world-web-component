import { css, html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import '../three-world.js';
import type { Axes, Point, View } from '../world/index.js';
import { ThreeWorld } from '../ThreeWorld.js';

function _getItem() {
  const key = localStorage.getItem('three-config');
  if (!key) return '{}';
  return localStorage.getItem(key) || '{}';
}

@customElement('demo-helper')
export class DemoHelper extends LitElement {
  static styles = css`
    .helper-view {
      position: fixed;
      top: 0;
      right: 0;
    }

    .helper-drawer {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: none;
    }

    .helper-drawer.open {
      display: flex;
      z-index: 110;
    }

    .hidden {
      display: none;
    }

    .helper-drawer-back {
      flex: auto;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .helper-drawer-content {
      flex: none;
      min-width: 600px;
      background-color: rgba(255, 255, 255, 1);
    }

    .error-msg {
      color: red;
    }

    .textarea-wrap {
      padding-right: 8px;
    }

    #config-textarea {
      width: 100%;
    }
  `;

  @state()
  _currentPoint: Point | null = null;

  @state()
  _view: View = 'read';

  @state()
  _base = '';

  @state()
  _glb = '';

  @state()
  _background = '#d9e1eb';

  @state()
  _axes: Axes = {
    size: 1,
    visible: false,
  };

  @state()
  _points: Point[] = [];

  @state()
  _helperDrawerOpen = false;

  @state()
  _errorMsg = '';

  @query('#config-textarea')
  _configTextarea!: HTMLTextAreaElement;

  private _openHelperDrawerBtnClick() {
    this._helperDrawerOpen = !this._helperDrawerOpen;
  }

  private _setConfig(config: any) {
    const { view, base, glb, background, axes, points } = config;
    if (view) this._view = view;
    if (base) this._base = base;
    if (glb) this._glb = glb;
    if (background) this._background = background;
    if (axes) this._axes = axes;
    if (points) this._points = points;
  }

  private _setItem(value: string) {
    const config = JSON.parse(value);

    this._setConfig(config);

    const key = `glb:${this._glb}`;
    // set to localstorage
    localStorage.setItem('three-config', key);
    localStorage.setItem(key, value);
  }

  private _saveConfigBtnClick() {
    try {
      const value = this._configTextarea.value || '{}';
      this._setItem(value);
      this._errorMsg = '';
    } catch (e) {
      this._errorMsg = (e as Error).message;
    }
  }

  protected firstUpdated(): void {
    // get form localstorage
    const value = _getItem();
    const config = JSON.parse(value);

    this._setConfig(config);

    this._configTextarea.value = JSON.stringify(config, null, 2);
  }

  private _saveConfig(): void {
    const config = {
      view: this._view,
      base: this._base,
      glb: this._glb,
      background: this._background,
      axes: this._axes,
      points: this._points,
    };
    const value = JSON.stringify(config);
    const key = `glb:${this._glb}`;
    localStorage.setItem('three-config', key);
    localStorage.setItem(key, value);

    this._configTextarea.value = JSON.stringify(config, null, 2);
  }

  private _removePointBtnClick() {
    if (!this._currentPoint) return;

    const clone = JSON.parse(JSON.stringify(this._points));
    const index = clone.findIndex(
      (it: Point) => it.userData!._id === this._currentPoint!.userData!._id
    );
    if (index > -1) {
      clone.splice(index, 1);
      this._points = clone;

      // 保存
      this._saveConfig();

      // 查找 three-world 组件, 调用 removePoint 方法
      const threeWorld = this.shadowRoot?.querySelector(
        'three-world'
      ) as ThreeWorld;
      threeWorld.removePoint(this._currentPoint);
    }
  }

  handlePointCreate(e: CustomEvent) {
    const { point } = e.detail;
    // console.log('handlePointCreate:', point);
    const clone = JSON.parse(JSON.stringify(this._points));

    point.userData = {
      _id: `userData${Date.now()}`,
    };

    clone.push(point);
    this._points = clone;

    // 保存
    this._saveConfig();

    // 查找 three-world 组件, 调用 addPoint 方法
    const threeWorld = this.shadowRoot?.querySelector(
      'three-world'
    ) as ThreeWorld;
    threeWorld.addPoint(point);
  }

  handlePointSelected(e: CustomEvent) {
    const { point } = e.detail;
    this._currentPoint = point;
    // console.log('handlePointSelected:', this._view, this._currentPoint);
  }

  handleAxesSettingChanged(e: CustomEvent) {
    const { actived } = e.detail;

    const axes = { ...this._axes };
    axes.visible = !!actived;
    this._axes = axes;

    // 保存
    this._saveConfig();
  }

  render() {
    return html`
      <three-world
        .view=${this._view}
        .base=${this._base}
        .glb=${this._glb}
        .background=${this._background}
        .axes=${this._axes}
        .points=${this._points}
        @point-create=${this.handlePointCreate}
        @point-selected=${this.handlePointSelected}
        @axes-setting-changed=${this.handleAxesSettingChanged}
      ></three-world>
      <div
        class=${this._helperDrawerOpen ? 'helper-drawer open' : 'helper-drawer'}
      >
        <div
          class="helper-drawer-back"
          @click="${this._openHelperDrawerBtnClick}"
          @keydown="${this._openHelperDrawerBtnClick}"
        ></div>
        <div class="helper-drawer-content">
          <button @click="${this._saveConfigBtnClick}">Save config</button>
          <span class="error-msg">${this._errorMsg}</span>
          <div class="textarea-wrap">
            <textarea id="config-textarea" rows="30"></textarea>
          </div>
        </div>
      </div>
      <div class="helper-view">
        <button
          class="${this._currentPoint && this._view === 'edit' ? '' : 'hidden'}"
          @click="${this._removePointBtnClick}"
        >
          Remove Point
        </button>
        <button @click="${this._openHelperDrawerBtnClick}">
          ${this._helperDrawerOpen ? 'Close helper' : 'Open helper'}
        </button>
      </div>
    `;
  }
}
