export class MinMaxGUIHelper {
  private _obj: any;

  private _minProp: string;

  private _maxProp: string;

  private _minDif: number;

  constructor(obj: any, minProp: string, maxProp: string, minDif: number) {
    this._obj = obj;
    this._minProp = minProp;
    this._maxProp = maxProp;
    this._minDif = minDif;
  }

  get min() {
    return this._obj[this._minProp];
  }

  set min(v) {
    this._obj[this._minProp] = v;
    this._obj[this._maxProp] = Math.max(
      this._obj[this._maxProp],
      v + this._minDif
    );
  }

  get max() {
    return this._obj[this._maxProp];
  }

  set max(v) {
    this._obj[this._maxProp] = v;
    // this.min = this.min;  // 这将调用min的setter
  }
}
