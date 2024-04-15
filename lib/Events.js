export class AddressSelectedEvent {
    static dispatch(element, id, address) {
        const evt = new Event("getaddress-autocomplete-address-selected", { bubbles: true });
        evt["address"] = address;
        evt["id"] = id;
        element.dispatchEvent(evt);
    }
}
export class AddressSelectedFailedEvent {
    static dispatch(element, id, status, message) {
        const evt = new Event("getaddress-autocomplete-address-selected-failed", { bubbles: true });
        evt["status"] = status;
        evt["message"] = message;
        evt["id"] = id;
        element.dispatchEvent(evt);
    }
}
export class SuggestionsEvent {
    static dispatch(element, query, suggestions) {
        const evt = new Event("getaddress-autocomplete-suggestions", { bubbles: true });
        evt["suggestions"] = suggestions;
        evt["query"] = query;
        element.dispatchEvent(evt);
    }
}
export class SuggestionsFailedEvent {
    static dispatch(element, query, status, message) {
        const evt = new Event("getaddress-autocomplete-suggestions-failed", { bubbles: true });
        evt["status"] = status;
        evt["message"] = message;
        evt["query"] = query;
        element.dispatchEvent(evt);
    }
}
//# sourceMappingURL=Events.js.map