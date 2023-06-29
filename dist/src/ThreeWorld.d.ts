import { LitElement } from 'lit';
export declare class ThreeWorld extends LitElement {
    static styles: import("lit").CSSResult;
    _canvas: HTMLCanvasElement;
    _mainView: HTMLDivElement;
    _secondView: HTMLDivElement;
    _controlView: HTMLDivElement;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
