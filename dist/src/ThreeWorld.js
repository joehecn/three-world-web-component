import { __decorate } from "tslib";
import { html, css, LitElement } from 'lit';
// import { property } from 'lit/decorators.js';
import { query } from 'lit/decorators/query.js';
import { World } from './world/index.js';
export class ThreeWorld extends LitElement {
  // __increment() {
  //   this.counter += 1;
  // }
  firstUpdated() {
    const world = new World(this._canvas, this._mainView, this._secondView, this._controlView);
    world.init(); // .catch(console.error);
  }
  render() {
    // return html`
    //   <h2>${this.header} Nr. ${this.counter}!</h2>
    //   <button @click=${this.__increment}>increment</button>
    // `;
    return html`
      <link rel="stylesheet" href="/three-world-web-component/assets/tw/css/lil-gui.min.css" />
      <canvas class="three-world"></canvas>
      <div class="split">
        <div class="main-view"></div>
        <div class="tool-wrap">
          <div class="second-view"></div>
          <div class="control-view"></div>
        </div>
      </div>
    `;
  }
}
ThreeWorld.styles = css`
    :host {
      height: 100%;
      width: 100%;
      display: block;
      /* padding: 25px; */
      /* color: var(--three-world-text-color, #000); */
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
      /* width: 100%; */
      height: 100%;
    }

    .main-view {
      flex: auto;
      /* border: 2px solid #000; */
    }

    .tool-wrap {
      width: 400px;
      display: flex;
      flex-direction: column;
    }

    .second-view {
      border-top: 32px solid #000;
      border-left: 2px solid #000;
      flex: none;
    }

    .control-view {
      background-color: #000;
      flex: auto;
      overflow-y: auto;
    }
  `;
__decorate([
  query('.three-world')
], ThreeWorld.prototype, "_canvas", void 0);
__decorate([
  query('.main-view')
], ThreeWorld.prototype, "_mainView", void 0);
__decorate([
  query('.second-view')
], ThreeWorld.prototype, "_secondView", void 0);
__decorate([
  query('.control-view')
], ThreeWorld.prototype, "_controlView", void 0);
//# sourceMappingURL=ThreeWorld.js.map