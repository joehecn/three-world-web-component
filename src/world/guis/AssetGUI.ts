import * as THREE from 'three';
import { EventDispatcher } from 'three';
import GUI from 'lil-gui';

export class AssetGUI extends EventDispatcher {
  private _gui: GUI;

  private _positionFolder: GUI | null = null;

  private _view: 'config' | 'edit' | 'read' = 'read';

  private object: any;

  private _obj = {
    gotoConfigGUI: () => {
      this.dispatchEvent({ type: 'goto-config-gui' });
    },
  };

  constructor(controlView: HTMLDivElement, view: 'config' | 'edit' | 'read') {
    super();

    this._view = view;
    const gui = new GUI({
      container: controlView,
      width: 360,
      title: 'Asset',
      injectStyles: false,
    });
    this._gui = gui;

    // gui.add(this._obj, 'gotoConfigGUI').name('Config setting >>>');
  }

  // 控制图标的缩放
  private setScale() {
    this.object.scale.set(this.object.scale.x, this.object.scale.x, 1);
    this.dispatchEvent({ type: 'asset-gui-change' });
  }

  private _dispatch() {
    this.dispatchEvent({ type: 'asset-gui-change' });
  }

  public show() {
    this._gui.show();
  }

  public hide() {
    this._gui.hide();
  }

  public init(object: THREE.Mesh) {
    this.object = object;

    // 销毁旧的 Position
    if (this._positionFolder) {
      this._positionFolder.destroy();
      this._positionFolder = null;
    }

    // 创建新的 Position
    this._positionFolder = this._gui.addFolder(object.userData._id);
    if (this._view === 'edit') {
      this._positionFolder
        .add(
          object.position,
          'x',
          object.position.x - 10,
          object.position.x + 10,
          0.01
        )
        .onChange(this._dispatch.bind(this));
      this._positionFolder
        .add(
          object.position,
          'y',
          object.position.y - 10,
          object.position.y + 10,
          0.01
        )
        .onChange(this._dispatch.bind(this));
      this._positionFolder
        .add(
          object.position,
          'z',
          object.position.z - 10,
          object.position.z + 10,
          0.01
        )
        .onChange(this._dispatch.bind(this));
    }

    if (this._view === 'config') {
      this._positionFolder
        .add(object.scale, 'x', 0.01, 10, 0.01)
        .name('Scale')
        .onChange(this.setScale.bind(this));
    }
  }
}
