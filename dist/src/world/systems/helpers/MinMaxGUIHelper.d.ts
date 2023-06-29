export declare class MinMaxGUIHelper {
    private _obj;
    private _minProp;
    private _maxProp;
    private _minDif;
    constructor(obj: any, minProp: string, maxProp: string, minDif: number);
    get min(): any;
    set min(v: any);
    get max(): any;
    set max(v: any);
}
