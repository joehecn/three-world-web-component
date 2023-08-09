/** 单例模式 */

import { EventDispatcher } from 'three';

class Resizer extends EventDispatcher {
  private _canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this._canvas = canvas;

    // resize if the window is resized
    window.addEventListener('resize', () => {
      this._dispatch(true);
    });
  }

  private _dispatch(needRender: boolean) {
    const { width, height, clientWidth, clientHeight } = this._canvas;
    const needResize = width !== clientWidth || height !== clientHeight;
    if (needResize) {
      this.dispatchEvent({
        type: 'resizer-render',
        detail: {
          clientWidth,
          clientHeight,
          needRender,
        },
      });
    }
  }

  public init() {
    this._dispatch(false);
  }
}

// let _resizer!: Resizer;

export const getUniqueResizer = (canvas: HTMLCanvasElement) => {
  // if (!_resizer) {
  const _resizer = new Resizer(canvas);
  // }
  return _resizer;
};
