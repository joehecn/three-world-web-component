export class MinMaxGUIHelper {
    constructor(obj, minProp, maxProp, minDif) {
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
        this._obj[this._maxProp] = Math.max(this._obj[this._maxProp], v + this._minDif);
    }
    get max() {
        return this._obj[this._maxProp];
    }
    set max(v) {
        this._obj[this._maxProp] = v;
        // this.min = this.min;  // 这将调用min的setter
    }
}
//# sourceMappingURL=MinMaxGUIHelper.js.map