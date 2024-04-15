import { AutocompleteAddress, Suggestion } from "getaddress-api";
export declare class AddressSelectedEvent {
    static dispatch(element: HTMLElement | Document, id: string, address: AutocompleteAddress): void;
}
export declare class AddressSelectedFailedEvent {
    static dispatch(element: HTMLElement | Document, id: string, status: number, message: string): void;
}
export declare class SuggestionsEvent {
    static dispatch(element: HTMLElement | Document, query: string, suggestions: Suggestion[]): void;
}
export declare class SuggestionsFailedEvent {
    static dispatch(element: HTMLElement | Document, query: string, status: number, message: string): void;
}
