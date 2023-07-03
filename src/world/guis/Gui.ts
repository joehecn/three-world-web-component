import * as THREE from 'three';
import { EventDispatcher } from 'three';
import { AssetsGUI } from './AssetsGUI.js';
import { AssetGUI } from './AssetGUI.js';
import { ConfigGUI } from './ConfigGUI.js';
import { Tree } from '../type.js';

export class Gui extends EventDispatcher {
  private _guiMap: Map<string, any> = new Map();

  private _currentGuiKey: string = 'assets';

  constructor(
    controlView: HTMLDivElement,
    mainLight: THREE.DirectionalLight,
    secondLight: THREE.HemisphereLight,
    mainCamera: THREE.PerspectiveCamera,
    tree: Tree[]
  ) {
    super();

    const assetsGUI = new AssetsGUI(controlView, tree);
    assetsGUI.show();
    this._guiMap.set('assets', assetsGUI);

    const assetGUI = new AssetGUI(controlView);
    assetGUI.hide();
    this._guiMap.set('asset', assetGUI);

    const configGUI = new ConfigGUI(
      controlView,
      mainLight,
      secondLight,
      mainCamera
    );
    configGUI.hide();
    this._guiMap.set('config', configGUI);

    assetsGUI.addEventListener('goto-config-gui', () => {
      this.setCurrentGuiKey('config');
    });

    assetGUI.addEventListener('goto-assets-gui', () => {
      this.setCurrentGuiKey('assets');
    });
    assetGUI.addEventListener('asset-gui-change', this._dispatch.bind(this));

    configGUI.addEventListener('goto-assets-gui', () => {
      this.setCurrentGuiKey('assets');
    });
    configGUI.addEventListener('config-gui-change', this._dispatch.bind(this));
  }

  private _dispatch() {
    this.dispatchEvent({ type: 'gui-change' });
  }

  public getCurrentGuiKey() {
    return this._currentGuiKey;
  }

  public setCurrentGuiKey(key: string) {
    // 如果当前的 GUI 就是要设置的 GUI，那么就不用再设置了
    if (this._currentGuiKey === key) return;

    // 隐藏当前的 GUI
    this._guiMap.get(this._currentGuiKey).hide();

    // 设置新的 GUI 并 显示
    this._currentGuiKey = key;
    this._guiMap.get(key).show();
  }

  public initAssetGUI(object: THREE.Object3D) {
    this._guiMap.get('asset').init(object as THREE.Mesh);
  }
}
