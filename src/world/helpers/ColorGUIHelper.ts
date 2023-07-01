export class ColorGUIHelper {
  private _obj: any;

  private _prop: string;

  constructor(object: any, prop: string) {
    this._obj = object;
    this._prop = prop;
  }

  get value() {
    return `#${this._obj[this._prop].getHexString()}`;
  }

  set value(hexString) {
    this._obj[this._prop].set(hexString);
  }
}
