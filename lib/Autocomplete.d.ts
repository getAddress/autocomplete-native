import AttributeValues from "./AttributeValues";
import Client, { Suggestion } from 'getaddress-api';
export default class Autocomplete {
    readonly input: HTMLInputElement;
    readonly client: Client;
    readonly attributeValues: AttributeValues;
    private filterTimer?;
    private blurTimer?;
    private list?;
    constructor(input: HTMLInputElement, client: Client, attributeValues: AttributeValues);
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
    handleKeyDownDefault: (event: KeyboardEvent) => void;
    handleKeyUp: (event: KeyboardEvent) => void;
    populateList: () => Promise<void>;
    clearList: () => void;
    getListItem: (suggestion: Suggestion) => HTMLOptionElement;
}
