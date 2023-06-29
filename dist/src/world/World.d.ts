export declare class World {
    private _scene;
    private _mainCamera;
    private _secondCamera;
    private _renderer;
    private _mainView;
    private _secondView;
    private _lightHelper;
    private _cameraHelper;
    constructor(canvas: HTMLCanvasElement, mainView: HTMLDivElement, secondView: HTMLDivElement, controlView: HTMLDivElement);
    init(): Promise<void>;
    render(): void;
}
