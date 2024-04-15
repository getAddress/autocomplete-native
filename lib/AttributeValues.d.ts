import { Options } from "./Options";
export default class AttributeValues {
    readonly options: Options;
    readonly listId: string;
    readonly id_prefix?: string;
    constructor(options: Options, index: number);
}
