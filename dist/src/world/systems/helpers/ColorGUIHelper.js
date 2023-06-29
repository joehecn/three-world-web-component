export class ColorGUIHelper {
    constructor(object, prop) {
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
//# sourceMappingURL=ColorGUIHelper.js.map