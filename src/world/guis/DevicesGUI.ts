import { EventDispatcher } from 'three';
import GUI from 'lil-gui';
import { Tree } from '../type.js';

export class DevicesGUI extends EventDispatcher {
  private _gui: GUI;

  private _obj = {
    gotoConfigGUI: () => {
      this.dispatchEvent({ type: 'goto-config-gui' });
    },
  };

  constructor(controlView: HTMLDivElement, tree: Tree[]) {
    super();

    const gui = new GUI({
      container: controlView,
      width: 400,
      title: 'Device list',
      injectStyles: false,
    });
    this._gui = gui;

    gui.add(this._obj, 'gotoConfigGUI').name('Config setting >>>');

    this.__LoopTree(tree, gui);
  }

  private __LoopTree(tree: Tree[], gui: GUI) {
    for (let i = 0; i < tree.length; i += 1) {
      const item = tree[i];
      if (item.isLeaf) {
        gui.addFolder(item.name);
        // console.log(item.name);
      } else if (item.children) {
        const folder = gui.addFolder(item.name);
        this.__LoopTree(item.children, folder);
      }
    }
  }

  public show() {
    this._gui.show();
  }

  public hide() {
    this._gui.hide();
  }
}
