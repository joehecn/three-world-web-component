import { EventDispatcher } from 'three';
import GUI from 'lil-gui';

export class DeviceGUI extends EventDispatcher {
  private _gui: GUI;

  constructor(controlView: HTMLDivElement) {
    super();

    const gui = new GUI({
      container: controlView,
      width: 400,
      title: 'Device',
      injectStyles: false,
    });
    this._gui = gui;
  }

  public show() {
    this._gui.show();
  }

  public hide() {
    this._gui.hide();
  }
}
