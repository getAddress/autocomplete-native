import AttributeValues from "./AttributeValues";
import Client, { Suggestion } from 'getaddress-api';
import { OutputFields } from "./OutputFields";
export default class Autocomplete {
    readonly input: HTMLInputElement;
    readonly client: Client;
    readonly output_fields: OutputFields;
    readonly attributeValues: AttributeValues;
    private filterTimer?;
    private blurTimer?;
    private list?;
    constructor(input: HTMLInputElement, client: Client, output_fields: OutputFields, attributeValues: AttributeValues);
    destroy(): void;
    private destroyList;
    private destroyInput;
    private onInputFocus;
    private onInputPaste;
    build(): void;
    private onInput;
    private onKeyUp;
    private onKeyDown;
    private debug;
    handleComponentBlur: (force?: boolean) => void;
    handleSuggestionSelected: (suggestion: HTMLOptionElement) => Promise<void>;
    private bind;
    private setOutputfield;
    handleKeyDownDefault: (event: KeyboardEvent) => void;
    handleKeyUp: (event: KeyboardEvent) => void;
    populateList: () => Promise<void>;
    clearList: () => void;
    getListItem: (suggestion: Suggestion) => HTMLOptionElement;
}