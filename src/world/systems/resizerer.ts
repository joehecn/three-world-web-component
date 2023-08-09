/** 单例模式 */

import { EventDispatcher } from 'three';

class Resizer extends EventDispatcher {
  private _canvas: HTMLCanvasElement;

  private _resizeObserver!: ResizeObserver;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this._canvas = canvas;

    // // resize if the window is resized
    // window.addEventListener('resize', () => {
    //   this._dispatch(true);
    // });

    this._resizeObserver = new ResizeObserver(entries => {
      // console.log('resizeObserver 1', entries);
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width && height) {
          // console.log('resizeObserver 2', width, height);
          this._dispatch(true);
        }
      }
    });
    this._resizeObserver.observe(this._canvas.parentElement!);
  }

  private _dispatch(needRender: boolean) {
    const { clientWidth, clientHeight } = this._canvas.parentElement!;
    const { width, height } = this._canvas;
    // console.log('resizer', width, height, clientWidth, clientHeight);
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

  public destroy() {
    this._resizeObserver.disconnect();
  }
}

let _resizer!: Resizer;

export const getUniqueResizer = (canvas: HTMLCanvasElement) => {
  if (_resizer) {
    _resizer.destroy();
  }

  _resizer = new Resizer(canvas);
  return _resizer;
};
