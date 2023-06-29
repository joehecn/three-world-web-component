import { TemplateResult } from 'lit';
import '../src/three-world.js';
declare const _default: {
    title: string;
    component: string;
};
export default _default;
interface Story<T> {
    (args: T): TemplateResult;
    args?: Partial<T>;
    argTypes?: Record<string, unknown>;
}
interface ArgTypes {
    header?: string;
    counter?: number;
    textColor?: string;
    slot?: TemplateResult;
}
export declare const Regular: Story<ArgTypes>;
