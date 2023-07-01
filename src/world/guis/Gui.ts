import * as THREE from 'three';
import { EventDispatcher } from 'three';
import { DevicesGUI } from './DevicesGUI.js';
import { DeviceGUI } from './DeviceGUI.js';
import { ConfigGUI } from './ConfigGUI.js';
import { Tree } from '../type.js';

export class Gui extends EventDispatcher {
  private _guiMap: Map<string, any> = new Map();

  private _currentGuiKey: string = 'devices';

  constructor(
    controlView: HTMLDivElement,
    mainLight: THREE.DirectionalLight,
    secondLight: THREE.HemisphereLight,
    mainCamera: THREE.PerspectiveCamera,
    tree: Tree[]
  ) {
    super();

    const devicesGUI = new DevicesGUI(controlView, tree);
    devicesGUI.show();
    this._guiMap.set('devices', devicesGUI);

    const deviceGUI = new DeviceGUI(controlView);
    deviceGUI.hide();
    this._guiMap.set('device', deviceGUI);

    const configGUI = new ConfigGUI(
      controlView,
      mainLight,
      secondLight,
      mainCamera
    );
    configGUI.hide();
    this._guiMap.set('config', configGUI);

    devicesGUI.addEventListener('goto-config-gui', () => {
      this.setCurrentGuiKey('config');
    });

    configGUI.addEventListener('goto-devices-gui', () => {
      this.setCurrentGuiKey('devices');
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
}
