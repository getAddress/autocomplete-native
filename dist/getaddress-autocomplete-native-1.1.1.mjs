class AddressSelectedEvent {
    static dispatch(element, id, address) {
        const evt = new Event("getaddress-autocomplete-address-selected", { bubbles: true });
        evt["address"] = address;
        evt["id"] = id;
        element.dispatchEvent(evt);
    }
}
class AddressSelectedFailedEvent {
    static dispatch(element, id, status, message) {
        const evt = new Event("getaddress-autocomplete-address-selected-failed", { bubbles: true });
        evt["status"] = status;
        evt["message"] = message;
        evt["id"] = id;
        element.dispatchEvent(evt);
    }
}
class SuggestionsEvent {
    static dispatch(element, query, suggestions) {
        const evt = new Event("getaddress-autocomplete-suggestions", { bubbles: true });
        evt["suggestions"] = suggestions;
        evt["query"] = query;
        element.dispatchEvent(evt);
    }
}
class SuggestionsFailedEvent {
    static dispatch(element, query, status, message) {
        const evt = new Event("getaddress-autocomplete-suggestions-failed", { bubbles: true });
        evt["status"] = status;
        evt["message"] = message;
        evt["query"] = query;
        element.dispatchEvent(evt);
    }
}

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Autocomplete {
    constructor(input, client, output_fields, attributeValues) {
        this.input = input;
        this.client = client;
        this.output_fields = output_fields;
        this.attributeValues = attributeValues;
        this.onInputFocus = () => {
            if (this.attributeValues.options.select_on_focus) {
                this.input.select();
            }
        };
        this.onInputPaste = () => {
            setTimeout(() => { this.populateList(); }, 100);
        };
        this.onInput = (e) => {
            if (this.list && (e instanceof InputEvent == false) && e.target instanceof HTMLInputElement) {
                const input = e.target;
                Array.from(this.list.querySelectorAll("option"))
                    .every((o) => {
                    if (o.innerText === input.value) {
                        this.handleSuggestionSelected(o);
                        return false;
                    }
                    return true;
                });
            }
        };
        this.onKeyUp = (event) => {
            this.debug(event);
            this.handleKeyUp(event);
        };
        this.onKeyDown = (event) => {
            this.debug(event);
            this.handleKeyDownDefault(event);
        };
        this.debug = (data) => {
            if (this.attributeValues.options.debug) {
                console.log(data);
            }
        };
        this.handleComponentBlur = (force = false) => {
            clearTimeout(this.blurTimer);
            const delay = force ? 0 : 100;
            this.blurTimer = setTimeout(() => {
                this.clearList();
            }, delay);
        };
        this.handleSuggestionSelected = (suggestion) => __awaiter$1(this, void 0, void 0, function* () {
            if (!this.attributeValues.options.enable_get) {
                this.clearList();
            }
            else {
                this.input.value = '';
                if (this.attributeValues.options.clear_list_on_select) {
                    this.clearList();
                }
                const id = suggestion.dataset.id;
                if (id) {
                    const addressResult = yield this.client.get(id);
                    if (addressResult.isSuccess) {
                        let success = addressResult.toSuccess();
                        this.bind(success.address);
                        AddressSelectedEvent.dispatch(this.input, id, success.address);
                        if (this.attributeValues.options.input_focus_on_select) {
                            this.input.focus();
                            this.input.setSelectionRange(this.input.value.length, this.input.value.length + 1);
                        }
                    }
                    else {
                        const failed = addressResult.toFailed();
                        AddressSelectedFailedEvent.dispatch(this.input, id, failed.status, failed.message);
                    }
                }
            }
        });
        this.bind = (address) => {
            if (address && this.attributeValues.options.bind_output_fields) {
                this.setOutputfield(this.output_fields.building_name, address.building_name);
                this.setOutputfield(this.output_fields.building_number, address.building_number);
                this.setOutputfield(this.output_fields.latitude, address.latitude.toString());
                this.setOutputfield(this.output_fields.longitude, address.longitude.toString());
                this.setOutputfield(this.output_fields.line_1, address.line_1);
                this.setOutputfield(this.output_fields.line_2, address.line_2);
                this.setOutputfield(this.output_fields.line_3, address.line_3);
                this.setOutputfield(this.output_fields.line_4, address.line_4);
                this.setOutputfield(this.output_fields.country, address.country);
                this.setOutputfield(this.output_fields.county, address.county);
                this.setOutputfield(this.output_fields.formatted_address_0, address.formatted_address[0]);
                this.setOutputfield(this.output_fields.formatted_address_1, address.formatted_address[1]);
                this.setOutputfield(this.output_fields.formatted_address_2, address.formatted_address[2]);
                this.setOutputfield(this.output_fields.formatted_address_3, address.formatted_address[3]);
                this.setOutputfield(this.output_fields.formatted_address_4, address.formatted_address[4]);
                this.setOutputfield(this.output_fields.town_or_city, address.town_or_city);
                this.setOutputfield(this.output_fields.locality, address.locality);
                this.setOutputfield(this.output_fields.district, address.district);
                this.setOutputfield(this.output_fields.residential, address.residential.toString());
                this.setOutputfield(this.output_fields.sub_building_name, address.sub_building_name);
                this.setOutputfield(this.output_fields.sub_building_number, address.sub_building_number);
                this.setOutputfield(this.output_fields.thoroughfare, address.thoroughfare);
                this.setOutputfield(this.output_fields.postcode, address.postcode);
            }
        };
        this.setOutputfield = (fieldName, fieldValue) => {
            if (!fieldName) {
                return;
            }
            let element = document.getElementById(fieldName);
            if (!element) {
                element = document.querySelector(fieldName);
            }
            if (element) {
                if (element instanceof HTMLInputElement) {
                    element.value = fieldValue;
                }
                else {
                    element.innerText = fieldValue;
                }
            }
            return element;
        };
        this.handleKeyDownDefault = (event) => {
            let isPrintableKey = event.key && (event.key.length === 1 || event.key === 'Unidentified');
            if (isPrintableKey) {
                clearTimeout(this.filterTimer);
                this.filterTimer = setTimeout(() => {
                    if (this.input.value.length >= this.attributeValues.options.minimum_characters) {
                        this.populateList();
                    }
                    else {
                        this.clearList();
                    }
                }, this.attributeValues.options.delay);
            }
        };
        this.handleKeyUp = (event) => {
            if (event.code === 'Backspace' || event.code === 'Delete') {
                if (event) {
                    const target = event.target;
                    if (target == this.input) {
                        if (this.input.value.length < this.attributeValues.options.minimum_characters) {
                            this.clearList();
                        }
                        else {
                            this.populateList();
                        }
                    }
                }
            }
        };
        this.populateList = () => __awaiter$1(this, void 0, void 0, function* () {
            var _a;
            const autocompleteOptions = {
                all: true,
                top: this.attributeValues.options.suggestion_count,
                template: "{formatted_address}{postcode,, }{postcode}"
            };
            if (this.attributeValues.options.filter) {
                autocompleteOptions.filter = this.attributeValues.options.filter;
            }
            const query = (_a = this.input.value) === null || _a === void 0 ? void 0 : _a.trim();
            const result = yield this.client.autocomplete(query, autocompleteOptions);
            if (result.isSuccess) {
                const success = result.toSuccess();
                const newItems = [];
                if (this.list && success.suggestions.length) {
                    for (let i = 0; i < success.suggestions.length; i++) {
                        const li = this.getListItem(success.suggestions[i]);
                        newItems.push(li);
                    }
                    this.list.replaceChildren(...newItems);
                }
                else {
                    this.clearList();
                }
                SuggestionsEvent.dispatch(this.input, query, success.suggestions);
            }
            else {
                const failed = result.toFailed();
                SuggestionsFailedEvent.dispatch(this.input, query, failed.status, failed.message);
            }
        });
        this.clearList = () => {
            if (this.list) {
                this.list.replaceChildren(...[]);
            }
        };
        this.getListItem = (suggestion) => {
            const option = document.createElement('OPTION');
            let address = suggestion.address;
            option.innerText = address;
            option.dataset.id = suggestion.id;
            return option;
        };
    }
    destroy() {
        this.destroyInput();
        this.destroyList();
    }
    destroyList() {
        if (this.list) {
            this.list.remove();
        }
    }
    destroyInput() {
        this.input.removeAttribute('list');
        this.input.removeEventListener('focus', this.onInputFocus);
        this.input.removeEventListener('paste', this.onInputPaste);
        this.input.removeEventListener('keydown', this.onKeyDown);
        this.input.removeEventListener('keyup', this.onKeyUp);
        this.input.removeEventListener('input', this.onInput);
    }
    build() {
        this.input.setAttribute('list', `${this.attributeValues.listId}`);
        this.input.addEventListener('focus', this.onInputFocus);
        this.input.addEventListener('paste', this.onInputPaste);
        this.input.addEventListener('keydown', this.onKeyDown);
        this.input.addEventListener('keyup', this.onKeyUp);
        this.input.addEventListener('input', this.onInput);
        this.list = document.createElement('DATALIST');
        this.list.id = this.attributeValues.listId;
        this.input.insertAdjacentElement("afterend", this.list);
    }
}

class Options {
    constructor(options = {}) {
        this.id_prefix = "getAddress-autocomplete-native";
        this.output_fields = undefined;
        this.delay = 200;
        this.minimum_characters = 2;
        this.clear_list_on_select = true;
        this.select_on_focus = true;
        this.alt_autocomplete_url = undefined;
        this.alt_get_url = undefined;
        this.suggestion_count = 6;
        this.filter = undefined;
        this.bind_output_fields = true;
        this.input_focus_on_select = true;
        this.debug = false;
        this.enable_get = true;
        this.set_default_output_field_names = true;
        Object.assign(this, options);
    }
}

class Result {
    constructor(isSuccess) {
        this.isSuccess = isSuccess;
    }
}
class Success extends Result {
    constructor() {
        super(true);
    }
}
class AutocompleteSuccess extends Success {
    constructor(suggestions) {
        super();
        this.suggestions = suggestions;
    }
    toSuccess() {
        return this;
    }
    toFailed() {
        throw new Error('Did not fail');
    }
}
class LocationSuccess extends Success {
    constructor(suggestions) {
        super();
        this.suggestions = suggestions;
    }
    toSuccess() {
        return this;
    }
    toFailed() {
        throw new Error('Did not fail');
    }
}
class GetSuccess extends Success {
    constructor(address) {
        super();
        this.address = address;
    }
    toSuccess() {
        return this;
    }
    toFailed() {
        throw new Error('Did not fail');
    }
}
class GetLocationSuccess extends Success {
    constructor(location) {
        super();
        this.location = location;
    }
    toSuccess() {
        return this;
    }
    toFailed() {
        throw new Error('Did not fail');
    }
}
class GetLocationFailed extends Result {
    constructor(status, message) {
        super(false);
        this.status = status;
        this.message = message;
    }
    toSuccess() {
        throw new Error('Not a success');
    }
    toFailed() {
        return this;
    }
}
class AutocompleteFailed extends Result {
    constructor(status, message) {
        super(false);
        this.status = status;
        this.message = message;
    }
    toSuccess() {
        throw new Error('Not a success');
    }
    toFailed() {
        return this;
    }
}
class LocationFailed extends Result {
    constructor(status, message) {
        super(false);
        this.status = status;
        this.message = message;
    }
    toSuccess() {
        throw new Error('Not a success');
    }
    toFailed() {
        return this;
    }
}
class GetFailed extends Result {
    constructor(status, message) {
        super(false);
        this.status = status;
        this.message = message;
    }
    toSuccess() {
        throw new Error('Not a success');
    }
    toFailed() {
        return this;
    }
}
class FindSuccess extends Success {
    constructor(addresses) {
        super();
        this.addresses = addresses;
    }
    toSuccess() {
        return this;
    }
    toFailed() {
        throw new Error('failed');
    }
}
class FindFailed extends Result {
    constructor(status, message) {
        super(false);
        this.status = status;
        this.message = message;
    }
    toSuccess() {
        throw new Error('failed');
    }
    toFailed() {
        return this;
    }
}
class TypeaheadSuccess extends Success {
    constructor(results) {
        super();
        this.results = results;
    }
    toSuccess() {
        return this;
    }
    toFailed() {
        throw new Error('failed');
    }
}
class TypeaheadFailed extends Result {
    constructor(status, message) {
        super(false);
        this.status = status;
        this.message = message;
    }
    toSuccess() {
        throw new Error('failed');
    }
    toFailed() {
        return this;
    }
}

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Client {
    constructor(api_key, autocomplete_url = 'https://api.getaddress.io/autocomplete/{query}', get_url = 'https://api.getaddress.io/get/{id}', location_url = 'https://api.getaddress.io/location/{query}', get_location_url = 'https://api.getaddress.io/get-location/{id}', typeahead_url = 'https://api.getaddress.io/typeahead/{term}') {
        this.api_key = api_key;
        this.autocomplete_url = autocomplete_url;
        this.get_url = get_url;
        this.location_url = location_url;
        this.get_location_url = get_location_url;
        this.typeahead_url = typeahead_url;
        this.autocompleteResponse = undefined;
        this.getResponse = undefined;
        this.locationResponse = undefined;
        this.getLocationResponse = undefined;
        this.typeaheadResponse = undefined;
        this.autocompleteAbortController = new AbortController();
        this.getAbortController = new AbortController();
        this.typeaheadAbortController = new AbortController();
        this.locationAbortController = new AbortController();
        this.getLocationAbortController = new AbortController();
    }
    location(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, options = {}) {
            try {
                const combinedOptions = Object.assign({ all: true }, options);
                let url = this.location_url.replace(/{query}/i, query);
                if (this.api_key) {
                    if (url.includes('?')) {
                        url = `${url}&api-key=${this.api_key}`;
                    }
                    else {
                        url = `${url}?api-key=${this.api_key}`;
                    }
                }
                if (this.locationResponse !== undefined) {
                    this.locationResponse = undefined;
                    this.locationAbortController.abort();
                    this.locationAbortController = new AbortController();
                }
                this.locationResponse = yield fetch(url, {
                    method: 'post',
                    signal: this.locationAbortController.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(combinedOptions),
                });
                if (this.locationResponse.status === 200) {
                    const json = yield this.locationResponse.json();
                    const suggestions = json.suggestions;
                    return new LocationSuccess(suggestions);
                }
                const json = yield this.locationResponse.json();
                return new LocationFailed(this.locationResponse.status, json.Message);
            }
            catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'AbortError') {
                        return new LocationSuccess([]);
                    }
                    return new LocationFailed(401, err.message);
                }
                return new LocationFailed(401, 'Unauthorised');
            }
            finally {
                this.locationResponse = undefined;
            }
        });
    }
    getLocation(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = this.get_location_url.replace(/{id}/i, id);
                if (this.api_key) {
                    if (url.includes('?')) {
                        url = `${url}&api-key=${this.api_key}`;
                    }
                    else {
                        url = `${url}?api-key=${this.api_key}`;
                    }
                }
                if (this.getLocationResponse !== undefined) {
                    this.getResponse = undefined;
                    this.getLocationAbortController.abort();
                    this.getLocationAbortController = new AbortController();
                }
                this.getResponse = yield fetch(url, {
                    method: 'get',
                    signal: this.getLocationAbortController.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (this.getResponse.status === 200) {
                    const json = yield this.getResponse.json();
                    const loaction = json;
                    return new GetLocationSuccess(loaction);
                }
                const json = yield this.getResponse.json();
                return new GetLocationFailed(this.getResponse.status, json.Message);
            }
            catch (err) {
                if (err instanceof Error) {
                    return new GetLocationFailed(401, err.message);
                }
                return new GetLocationFailed(401, 'Unauthorised');
            }
            finally {
                this.getResponse = undefined;
            }
        });
    }
    autocomplete(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, options = {}) {
            try {
                const combinedOptions = Object.assign({ all: true }, options);
                let url = this.autocomplete_url.replace(/{query}/i, query);
                if (this.api_key) {
                    if (url.includes('?')) {
                        url = `${url}&api-key=${this.api_key}`;
                    }
                    else {
                        url = `${url}?api-key=${this.api_key}`;
                    }
                }
                if (this.autocompleteResponse !== undefined) {
                    this.autocompleteResponse = undefined;
                    this.autocompleteAbortController.abort();
                    this.autocompleteAbortController = new AbortController();
                }
                this.autocompleteResponse = yield fetch(url, {
                    method: 'post',
                    signal: this.autocompleteAbortController.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(combinedOptions),
                });
                if (this.autocompleteResponse.status === 200) {
                    const json = yield this.autocompleteResponse.json();
                    const suggestions = json.suggestions;
                    return new AutocompleteSuccess(suggestions);
                }
                const json = yield this.autocompleteResponse.json();
                return new AutocompleteFailed(this.autocompleteResponse.status, json.Message);
            }
            catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'AbortError') {
                        return new AutocompleteSuccess([]);
                    }
                    return new AutocompleteFailed(401, err.message);
                }
                return new AutocompleteFailed(401, 'Unauthorised');
            }
            finally {
                this.autocompleteResponse = undefined;
            }
        });
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = this.get_url.replace(/{id}/i, id);
                if (this.api_key) {
                    if (url.includes('?')) {
                        url = `${url}&api-key=${this.api_key}`;
                    }
                    else {
                        url = `${url}?api-key=${this.api_key}`;
                    }
                }
                if (this.getResponse !== undefined) {
                    this.getResponse = undefined;
                    this.getAbortController.abort();
                    this.getAbortController = new AbortController();
                }
                this.getResponse = yield fetch(url, {
                    method: 'get',
                    signal: this.getAbortController.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (this.getResponse.status === 200) {
                    const json = yield this.getResponse.json();
                    const address = json;
                    return new GetSuccess(address);
                }
                const json = yield this.getResponse.json();
                return new GetFailed(this.getResponse.status, json.Message);
            }
            catch (err) {
                if (err instanceof Error) {
                    return new GetFailed(401, err.message);
                }
                return new GetFailed(401, 'Unauthorised');
            }
            finally {
                this.getResponse = undefined;
            }
        });
    }
    find(postcode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(`https://api.getaddress.io/find/${postcode}?api-key=${this.api_key}&expand=true`);
                if (response.status === 200) {
                    const json = yield response.json();
                    const addresses = json;
                    return new FindSuccess(addresses);
                }
                const json = yield response.json();
                return new FindFailed(response.status, json.Message);
            }
            catch (err) {
                if (err instanceof Error) {
                    return new FindFailed(401, err.message);
                }
                return new FindFailed(401, 'Unauthorised');
            }
        });
    }
    typeahead(term_1) {
        return __awaiter(this, arguments, void 0, function* (term, options = {}) {
            try {
                let url = this.typeahead_url.replace(/{term}/i, term);
                if (this.api_key) {
                    if (url.includes('?')) {
                        url = `${url}&api-key=${this.api_key}`;
                    }
                    else {
                        url = `${url}?api-key=${this.api_key}`;
                    }
                }
                if (this.typeaheadResponse !== undefined) {
                    this.typeaheadResponse = undefined;
                    this.typeaheadAbortController.abort();
                    this.typeaheadAbortController = new AbortController();
                }
                this.typeaheadResponse = yield fetch(url, {
                    method: 'post',
                    signal: this.autocompleteAbortController.signal,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(options),
                });
                if (this.typeaheadResponse.status === 200) {
                    const json = yield this.typeaheadResponse.json();
                    const results = json;
                    return new TypeaheadSuccess(results);
                }
                const json = yield this.typeaheadResponse.json();
                return new TypeaheadFailed(this.typeaheadResponse.status, json.Message);
            }
            catch (err) {
                if (err instanceof Error) {
                    if (err.name === 'AbortError') {
                        return new TypeaheadSuccess([]);
                    }
                    return new TypeaheadFailed(401, err.message);
                }
                return new TypeaheadFailed(401, 'Unauthorised');
            }
            finally {
                this.typeaheadResponse = undefined;
            }
        });
    }
}

class OutputFields {
    constructor(outputFields = {}) {
        Object.assign(this, outputFields);
    }
}

class AttributeValues {
    constructor(options, index) {
        this.options = options;
        let suffix = "";
        if (index > 0) {
            suffix = `-${index}`;
        }
        this.id_prefix = options.id_prefix;
        this.listId = `${this.id_prefix}-list${suffix}`;
    }
}

class InstanceCounter {
    static add(autocomplete) {
        this.instances.push(autocomplete);
    }
}
InstanceCounter.instances = [];
function autocomplete(id, api_key, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    if (!id) {
        return;
    }
    const allOptions = new Options(options);
    let textbox = document.getElementById(id);
    if (!textbox) {
        textbox = document.querySelector(id);
    }
    if (!textbox) {
        return;
    }
    const client = new Client(api_key, allOptions.alt_autocomplete_url, allOptions.alt_get_url);
    const outputFields = new OutputFields(allOptions.output_fields);
    if (allOptions.set_default_output_field_names) {
        outputFields.formatted_address_0 = (_a = outputFields.formatted_address_0) !== null && _a !== void 0 ? _a : "";
        outputFields.formatted_address_1 = (_b = outputFields.formatted_address_1) !== null && _b !== void 0 ? _b : "formatted_address_1";
        outputFields.formatted_address_2 = (_c = outputFields.formatted_address_2) !== null && _c !== void 0 ? _c : "formatted_address_2";
        outputFields.formatted_address_3 = (_d = outputFields.formatted_address_3) !== null && _d !== void 0 ? _d : "formatted_address_3";
        outputFields.formatted_address_4 = (_e = outputFields.formatted_address_4) !== null && _e !== void 0 ? _e : "formatted_address_4";
        outputFields.line_1 = (_f = outputFields.line_1) !== null && _f !== void 0 ? _f : "line_1";
        outputFields.line_2 = (_g = outputFields.line_2) !== null && _g !== void 0 ? _g : "line_2";
        outputFields.line_3 = (_h = outputFields.line_3) !== null && _h !== void 0 ? _h : "line_3";
        outputFields.line_4 = (_j = outputFields.line_4) !== null && _j !== void 0 ? _j : "line_4";
        outputFields.town_or_city = (_k = outputFields.town_or_city) !== null && _k !== void 0 ? _k : "town_or_city";
        outputFields.county = (_l = outputFields.county) !== null && _l !== void 0 ? _l : "county";
        outputFields.country = (_m = outputFields.country) !== null && _m !== void 0 ? _m : "country";
        outputFields.postcode = (_o = outputFields.postcode) !== null && _o !== void 0 ? _o : "postcode";
        outputFields.latitude = (_p = outputFields.latitude) !== null && _p !== void 0 ? _p : "latitude";
        outputFields.longitude = (_q = outputFields.longitude) !== null && _q !== void 0 ? _q : "longitude";
        outputFields.building_number = (_r = outputFields.building_number) !== null && _r !== void 0 ? _r : "building_number";
        outputFields.building_name = (_s = outputFields.building_name) !== null && _s !== void 0 ? _s : "building_name";
        outputFields.sub_building_number = (_t = outputFields.sub_building_number) !== null && _t !== void 0 ? _t : "sub_building_number";
        outputFields.sub_building_name = (_u = outputFields.sub_building_name) !== null && _u !== void 0 ? _u : "sub_building_name";
        outputFields.thoroughfare = (_v = outputFields.thoroughfare) !== null && _v !== void 0 ? _v : 'thoroughfare';
        outputFields.locality = (_w = outputFields.locality) !== null && _w !== void 0 ? _w : "locality";
        outputFields.district = (_x = outputFields.district) !== null && _x !== void 0 ? _x : "district";
        outputFields.residential = (_y = outputFields.residential) !== null && _y !== void 0 ? _y : "residential";
    }
    if (!outputFields.formatted_address_0) {
        outputFields.formatted_address_0 = id;
    }
    const index = InstanceCounter.instances.length;
    const attributeValues = new AttributeValues(allOptions, index);
    const autocomplete = new Autocomplete(textbox, client, outputFields, attributeValues);
    autocomplete.build();
    InstanceCounter.add(autocomplete);
}
function destroy() {
    for (const instance of InstanceCounter.instances) {
        instance.destroy();
    }
    InstanceCounter.instances = [];
}

export { Options, autocomplete, destroy };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtbmF0aXZlLTEuMS4xLm1qcyIsInNvdXJjZXMiOlsiLi4vbGliL0V2ZW50cy5qcyIsIi4uL2xpYi9BdXRvY29tcGxldGUuanMiLCIuLi9saWIvT3B0aW9ucy5qcyIsIi4uL25vZGVfbW9kdWxlcy9nZXRhZGRyZXNzLWFwaS9saWIvVHlwZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvZ2V0YWRkcmVzcy1hcGkvbGliL0luZGV4LmpzIiwiLi4vbGliL091dHB1dEZpZWxkcy5qcyIsIi4uL2xpYi9BdHRyaWJ1dGVWYWx1ZXMuanMiLCIuLi9saWIvSW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEFkZHJlc3NTZWxlY3RlZEV2ZW50IHtcbiAgICBzdGF0aWMgZGlzcGF0Y2goZWxlbWVudCwgaWQsIGFkZHJlc3MpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtYWRkcmVzcy1zZWxlY3RlZFwiLCB7IGJ1YmJsZXM6IHRydWUgfSk7XG4gICAgICAgIGV2dFtcImFkZHJlc3NcIl0gPSBhZGRyZXNzO1xuICAgICAgICBldnRbXCJpZFwiXSA9IGlkO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQWRkcmVzc1NlbGVjdGVkRmFpbGVkRXZlbnQge1xuICAgIHN0YXRpYyBkaXNwYXRjaChlbGVtZW50LCBpZCwgc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGV2dCA9IG5ldyBFdmVudChcImdldGFkZHJlc3MtYXV0b2NvbXBsZXRlLWFkZHJlc3Mtc2VsZWN0ZWQtZmFpbGVkXCIsIHsgYnViYmxlczogdHJ1ZSB9KTtcbiAgICAgICAgZXZ0W1wic3RhdHVzXCJdID0gc3RhdHVzO1xuICAgICAgICBldnRbXCJtZXNzYWdlXCJdID0gbWVzc2FnZTtcbiAgICAgICAgZXZ0W1wiaWRcIl0gPSBpZDtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFN1Z2dlc3Rpb25zRXZlbnQge1xuICAgIHN0YXRpYyBkaXNwYXRjaChlbGVtZW50LCBxdWVyeSwgc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbnNcIiwgeyBidWJibGVzOiB0cnVlIH0pO1xuICAgICAgICBldnRbXCJzdWdnZXN0aW9uc1wiXSA9IHN1Z2dlc3Rpb25zO1xuICAgICAgICBldnRbXCJxdWVyeVwiXSA9IHF1ZXJ5O1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU3VnZ2VzdGlvbnNGYWlsZWRFdmVudCB7XG4gICAgc3RhdGljIGRpc3BhdGNoKGVsZW1lbnQsIHF1ZXJ5LCBzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbnMtZmFpbGVkXCIsIHsgYnViYmxlczogdHJ1ZSB9KTtcbiAgICAgICAgZXZ0W1wic3RhdHVzXCJdID0gc3RhdHVzO1xuICAgICAgICBldnRbXCJtZXNzYWdlXCJdID0gbWVzc2FnZTtcbiAgICAgICAgZXZ0W1wicXVlcnlcIl0gPSBxdWVyeTtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RXZlbnRzLmpzLm1hcCIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuaW1wb3J0IHsgQWRkcmVzc1NlbGVjdGVkRXZlbnQsIEFkZHJlc3NTZWxlY3RlZEZhaWxlZEV2ZW50LCBTdWdnZXN0aW9uc0V2ZW50LCBTdWdnZXN0aW9uc0ZhaWxlZEV2ZW50IH0gZnJvbSBcIi4vRXZlbnRzXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRvY29tcGxldGUge1xuICAgIGNvbnN0cnVjdG9yKGlucHV0LCBjbGllbnQsIG91dHB1dF9maWVsZHMsIGF0dHJpYnV0ZVZhbHVlcykge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuICAgICAgICB0aGlzLm91dHB1dF9maWVsZHMgPSBvdXRwdXRfZmllbGRzO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZVZhbHVlcyA9IGF0dHJpYnV0ZVZhbHVlcztcbiAgICAgICAgdGhpcy5vbklucHV0Rm9jdXMgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5zZWxlY3Rfb25fZm9jdXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uSW5wdXRQYXN0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnBvcHVsYXRlTGlzdCgpOyB9LCAxMDApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uSW5wdXQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubGlzdCAmJiAoZSBpbnN0YW5jZW9mIElucHV0RXZlbnQgPT0gZmFsc2UpICYmIGUudGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgQXJyYXkuZnJvbSh0aGlzLmxpc3QucXVlcnlTZWxlY3RvckFsbChcIm9wdGlvblwiKSlcbiAgICAgICAgICAgICAgICAgICAgLmV2ZXJ5KChvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLmlubmVyVGV4dCA9PT0gaW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3VnZ2VzdGlvblNlbGVjdGVkKG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uS2V5VXAgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlVcChldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25LZXlEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkRlZmF1bHQoZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmRlYnVnID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlQ29tcG9uZW50Qmx1ciA9IChmb3JjZSA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5ibHVyVGltZXIpO1xuICAgICAgICAgICAgY29uc3QgZGVsYXkgPSBmb3JjZSA/IDAgOiAxMDA7XG4gICAgICAgICAgICB0aGlzLmJsdXJUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlU3VnZ2VzdGlvblNlbGVjdGVkID0gKHN1Z2dlc3Rpb24pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5lbmFibGVfZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5jbGVhcl9saXN0X29uX3NlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTGlzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IHN1Z2dlc3Rpb24uZGF0YXNldC5pZDtcbiAgICAgICAgICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkcmVzc1Jlc3VsdCA9IHlpZWxkIHRoaXMuY2xpZW50LmdldChpZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzUmVzdWx0LmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSBhZGRyZXNzUmVzdWx0LnRvU3VjY2VzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kKHN1Y2Nlc3MuYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzU2VsZWN0ZWRFdmVudC5kaXNwYXRjaCh0aGlzLmlucHV0LCBpZCwgc3VjY2Vzcy5hZGRyZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmlucHV0X2ZvY3VzX29uX3NlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGlvblJhbmdlKHRoaXMuaW5wdXQudmFsdWUubGVuZ3RoLCB0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gYWRkcmVzc1Jlc3VsdC50b0ZhaWxlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzc1NlbGVjdGVkRmFpbGVkRXZlbnQuZGlzcGF0Y2godGhpcy5pbnB1dCwgaWQsIGZhaWxlZC5zdGF0dXMsIGZhaWxlZC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYmluZCA9IChhZGRyZXNzKSA9PiB7XG4gICAgICAgICAgICBpZiAoYWRkcmVzcyAmJiB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmJpbmRfb3V0cHV0X2ZpZWxkcykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmJ1aWxkaW5nX25hbWUsIGFkZHJlc3MuYnVpbGRpbmdfbmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuYnVpbGRpbmdfbnVtYmVyLCBhZGRyZXNzLmJ1aWxkaW5nX251bWJlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMubGF0aXR1ZGUsIGFkZHJlc3MubGF0aXR1ZGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMubG9uZ2l0dWRlLCBhZGRyZXNzLmxvbmdpdHVkZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzEsIGFkZHJlc3MubGluZV8xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzIsIGFkZHJlc3MubGluZV8yKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzMsIGFkZHJlc3MubGluZV8zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzQsIGFkZHJlc3MubGluZV80KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5jb3VudHJ5LCBhZGRyZXNzLmNvdW50cnkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmNvdW50eSwgYWRkcmVzcy5jb3VudHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzAsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbMF0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzEsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbMV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzIsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbMl0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzMsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbM10pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzQsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbNF0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLnRvd25fb3JfY2l0eSwgYWRkcmVzcy50b3duX29yX2NpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxvY2FsaXR5LCBhZGRyZXNzLmxvY2FsaXR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5kaXN0cmljdCwgYWRkcmVzcy5kaXN0cmljdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMucmVzaWRlbnRpYWwsIGFkZHJlc3MucmVzaWRlbnRpYWwudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuc3ViX2J1aWxkaW5nX25hbWUsIGFkZHJlc3Muc3ViX2J1aWxkaW5nX25hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLnN1Yl9idWlsZGluZ19udW1iZXIsIGFkZHJlc3Muc3ViX2J1aWxkaW5nX251bWJlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMudGhvcm91Z2hmYXJlLCBhZGRyZXNzLnRob3JvdWdoZmFyZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMucG9zdGNvZGUsIGFkZHJlc3MucG9zdGNvZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkID0gKGZpZWxkTmFtZSwgZmllbGRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaWVsZE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZpZWxkTmFtZSk7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihmaWVsZE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVyVGV4dCA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkRlZmF1bHQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBpc1ByaW50YWJsZUtleSA9IGV2ZW50LmtleSAmJiAoZXZlbnQua2V5Lmxlbmd0aCA9PT0gMSB8fCBldmVudC5rZXkgPT09ICdVbmlkZW50aWZpZWQnKTtcbiAgICAgICAgICAgIGlmIChpc1ByaW50YWJsZUtleSkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmZpbHRlclRpbWVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCA+PSB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLm1pbmltdW1fY2hhcmFjdGVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZUxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmRlbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVLZXlVcCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdCYWNrc3BhY2UnIHx8IGV2ZW50LmNvZGUgPT09ICdEZWxldGUnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldCA9PSB0aGlzLmlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGggPCB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLm1pbmltdW1fY2hhcmFjdGVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnBvcHVsYXRlTGlzdCA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGNvbnN0IGF1dG9jb21wbGV0ZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgYWxsOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRvcDogdGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5zdWdnZXN0aW9uX2NvdW50LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBcIntmb3JtYXR0ZWRfYWRkcmVzc317cG9zdGNvZGUsLCB9e3Bvc3Rjb2RlfVwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlT3B0aW9ucy5maWx0ZXIgPSB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmZpbHRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gKF9hID0gdGhpcy5pbnB1dC52YWx1ZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHlpZWxkIHRoaXMuY2xpZW50LmF1dG9jb21wbGV0ZShxdWVyeSwgYXV0b2NvbXBsZXRlT3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSByZXN1bHQudG9TdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saXN0ICYmIHN1Y2Nlc3Muc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VjY2Vzcy5zdWdnZXN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGkgPSB0aGlzLmdldExpc3RJdGVtKHN1Y2Nlc3Muc3VnZ2VzdGlvbnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbXMucHVzaChsaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0LnJlcGxhY2VDaGlsZHJlbiguLi5uZXdJdGVtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTGlzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBTdWdnZXN0aW9uc0V2ZW50LmRpc3BhdGNoKHRoaXMuaW5wdXQsIHF1ZXJ5LCBzdWNjZXNzLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZhaWxlZCA9IHJlc3VsdC50b0ZhaWxlZCgpO1xuICAgICAgICAgICAgICAgIFN1Z2dlc3Rpb25zRmFpbGVkRXZlbnQuZGlzcGF0Y2godGhpcy5pbnB1dCwgcXVlcnksIGZhaWxlZC5zdGF0dXMsIGZhaWxlZC5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xlYXJMaXN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdC5yZXBsYWNlQ2hpbGRyZW4oLi4uW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldExpc3RJdGVtID0gKHN1Z2dlc3Rpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ09QVElPTicpO1xuICAgICAgICAgICAgbGV0IGFkZHJlc3MgPSBzdWdnZXN0aW9uLmFkZHJlc3M7XG4gICAgICAgICAgICBvcHRpb24uaW5uZXJUZXh0ID0gYWRkcmVzcztcbiAgICAgICAgICAgIG9wdGlvbi5kYXRhc2V0LmlkID0gc3VnZ2VzdGlvbi5pZDtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb247XG4gICAgICAgIH07XG4gICAgfVxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZGVzdHJveUlucHV0KCk7XG4gICAgICAgIHRoaXMuZGVzdHJveUxpc3QoKTtcbiAgICB9XG4gICAgZGVzdHJveUxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3QpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95SW5wdXQoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlQXR0cmlidXRlKCdsaXN0Jyk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLm9uSW5wdXRGb2N1cyk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGFzdGUnLCB0aGlzLm9uSW5wdXRQYXN0ZSk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcCk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLm9uSW5wdXQpO1xuICAgIH1cbiAgICBidWlsZCgpIHtcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ2xpc3QnLCBgJHt0aGlzLmF0dHJpYnV0ZVZhbHVlcy5saXN0SWR9YCk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLm9uSW5wdXRGb2N1cyk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigncGFzdGUnLCB0aGlzLm9uSW5wdXRQYXN0ZSk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcCk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLm9uSW5wdXQpO1xuICAgICAgICB0aGlzLmxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdEQVRBTElTVCcpO1xuICAgICAgICB0aGlzLmxpc3QuaWQgPSB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5saXN0SWQ7XG4gICAgICAgIHRoaXMuaW5wdXQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYWZ0ZXJlbmRcIiwgdGhpcy5saXN0KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1BdXRvY29tcGxldGUuanMubWFwIiwiZXhwb3J0IGNsYXNzIE9wdGlvbnMge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmlkX3ByZWZpeCA9IFwiZ2V0QWRkcmVzcy1hdXRvY29tcGxldGUtbmF0aXZlXCI7XG4gICAgICAgIHRoaXMub3V0cHV0X2ZpZWxkcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDIwMDtcbiAgICAgICAgdGhpcy5taW5pbXVtX2NoYXJhY3RlcnMgPSAyO1xuICAgICAgICB0aGlzLmNsZWFyX2xpc3Rfb25fc2VsZWN0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZWxlY3Rfb25fZm9jdXMgPSB0cnVlO1xuICAgICAgICB0aGlzLmFsdF9hdXRvY29tcGxldGVfdXJsID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmFsdF9nZXRfdXJsID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25fY291bnQgPSA2O1xuICAgICAgICB0aGlzLmZpbHRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5iaW5kX291dHB1dF9maWVsZHMgPSB0cnVlO1xuICAgICAgICB0aGlzLmlucHV0X2ZvY3VzX29uX3NlbGVjdCA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVidWcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbmFibGVfZ2V0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRfZGVmYXVsdF9vdXRwdXRfZmllbGRfbmFtZXMgPSB0cnVlO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU9wdGlvbnMuanMubWFwIiwiZXhwb3J0IGNsYXNzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IoaXNTdWNjZXNzKSB7XG4gICAgICAgIHRoaXMuaXNTdWNjZXNzID0gaXNTdWNjZXNzO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTdWNjZXNzIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIodHJ1ZSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEF1dG9jb21wbGV0ZVN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihzdWdnZXN0aW9ucykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBMb2NhdGlvblN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihzdWdnZXN0aW9ucykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHZXRTdWNjZXNzIGV4dGVuZHMgU3VjY2VzcyB7XG4gICAgY29uc3RydWN0b3IoYWRkcmVzcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZHJlc3MgPSBhZGRyZXNzO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaWQgbm90IGZhaWwnKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgR2V0TG9jYXRpb25TdWNjZXNzIGV4dGVuZHMgU3VjY2VzcyB7XG4gICAgY29uc3RydWN0b3IobG9jYXRpb24pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaWQgbm90IGZhaWwnKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgR2V0TG9jYXRpb25GYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGEgc3VjY2VzcycpO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEF1dG9jb21wbGV0ZUZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTG9jYXRpb25GYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGEgc3VjY2VzcycpO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEdldEZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRmluZFN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihhZGRyZXNzZXMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZGRyZXNzZXMgPSBhZGRyZXNzZXM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBGaW5kRmFpbGVkIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCcpO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFR5cGVhaGVhZFN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHRzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBUeXBlYWhlYWRGYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmltcG9ydCB7IEdldEZhaWxlZCwgUmVzdWx0LCBBdXRvY29tcGxldGVTdWNjZXNzLCBHZXRTdWNjZXNzLCBBdXRvY29tcGxldGVGYWlsZWQsIEZpbmRTdWNjZXNzLCBGaW5kRmFpbGVkLCBUeXBlYWhlYWRTdWNjZXNzLCBUeXBlYWhlYWRGYWlsZWQsIExvY2F0aW9uU3VjY2VzcywgTG9jYXRpb25GYWlsZWQsIEdldExvY2F0aW9uU3VjY2VzcywgR2V0TG9jYXRpb25GYWlsZWQgfSBmcm9tICcuL1R5cGVzJztcbmNsYXNzIENsaWVudCB7XG4gICAgY29uc3RydWN0b3IoYXBpX2tleSwgYXV0b2NvbXBsZXRlX3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL2F1dG9jb21wbGV0ZS97cXVlcnl9JywgZ2V0X3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL2dldC97aWR9JywgbG9jYXRpb25fdXJsID0gJ2h0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vbG9jYXRpb24ve3F1ZXJ5fScsIGdldF9sb2NhdGlvbl91cmwgPSAnaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby9nZXQtbG9jYXRpb24ve2lkfScsIHR5cGVhaGVhZF91cmwgPSAnaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby90eXBlYWhlYWQve3Rlcm19Jykge1xuICAgICAgICB0aGlzLmFwaV9rZXkgPSBhcGlfa2V5O1xuICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZV91cmwgPSBhdXRvY29tcGxldGVfdXJsO1xuICAgICAgICB0aGlzLmdldF91cmwgPSBnZXRfdXJsO1xuICAgICAgICB0aGlzLmxvY2F0aW9uX3VybCA9IGxvY2F0aW9uX3VybDtcbiAgICAgICAgdGhpcy5nZXRfbG9jYXRpb25fdXJsID0gZ2V0X2xvY2F0aW9uX3VybDtcbiAgICAgICAgdGhpcy50eXBlYWhlYWRfdXJsID0gdHlwZWFoZWFkX3VybDtcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5sb2NhdGlvblJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmdldExvY2F0aW9uUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudHlwZWFoZWFkUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICB0aGlzLmdldEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgdGhpcy50eXBlYWhlYWRBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIHRoaXMubG9jYXRpb25BYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIHRoaXMuZ2V0TG9jYXRpb25BYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxuICAgIGxvY2F0aW9uKHF1ZXJ5XzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qIChxdWVyeSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBhbGw6IHRydWUgfSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMubG9jYXRpb25fdXJsLnJlcGxhY2UoL3txdWVyeX0vaSwgcXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFwaV9rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9JmFwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0/YXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvY2F0aW9uUmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25BYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvblJlc3BvbnNlID0geWllbGQgZmV0Y2godXJsLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMubG9jYXRpb25BYm9ydENvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShjb21iaW5lZE9wdGlvbnMpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvY2F0aW9uUmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMubG9jYXRpb25SZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Z2dlc3Rpb25zID0ganNvbi5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMb2NhdGlvblN1Y2Nlc3Moc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5sb2NhdGlvblJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uRmFpbGVkKHRoaXMubG9jYXRpb25SZXNwb25zZS5zdGF0dXMsIGpzb24uTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uU3VjY2VzcyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMb2NhdGlvbkZhaWxlZCg0MDEsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMb2NhdGlvbkZhaWxlZCg0MDEsICdVbmF1dGhvcmlzZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25SZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldExvY2F0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmdldF9sb2NhdGlvbl91cmwucmVwbGFjZSgve2lkfS9pLCBpZCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0TG9jYXRpb25SZXNwb25zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0TG9jYXRpb25BYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMuZ2V0TG9jYXRpb25BYm9ydENvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldFJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmdldFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hY3Rpb24gPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uU3VjY2Vzcyhsb2FjdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmdldFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uRmFpbGVkKHRoaXMuZ2V0UmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uRmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGF1dG9jb21wbGV0ZShxdWVyeV8xKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uKiAocXVlcnksIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21iaW5lZE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHsgYWxsOiB0cnVlIH0sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmF1dG9jb21wbGV0ZV91cmwucmVwbGFjZSgve3F1ZXJ5fS9pLCBxdWVyeSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNvbWJpbmVkT3B0aW9ucyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWdnZXN0aW9ucyA9IGpzb24uc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlU3VjY2VzcyhzdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEF1dG9jb21wbGV0ZUZhaWxlZCh0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlU3VjY2VzcyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldChpZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5nZXRfdXJsLnJlcGxhY2UoL3tpZH0vaSwgaWQpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFwaV9rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9JmFwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0/YXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldFJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRBYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzcG9uc2UgPSB5aWVsZCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiB0aGlzLmdldEFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuZ2V0UmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzID0ganNvbjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHZXRTdWNjZXNzKGFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5nZXRSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHZXRGYWlsZWQodGhpcy5nZXRSZXNwb25zZS5zdGF0dXMsIGpzb24uTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0RmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldEZhaWxlZCg0MDEsICdVbmF1dGhvcmlzZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmaW5kKHBvc3Rjb2RlKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgZmV0Y2goYGh0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vZmluZC8ke3Bvc3Rjb2RlfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fSZleHBhbmQ9dHJ1ZWApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzZXMgPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRTdWNjZXNzKGFkZHJlc3Nlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaW5kRmFpbGVkKHJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaW5kRmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRGYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0eXBlYWhlYWQodGVybV8xKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uKiAodGVybSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLnR5cGVhaGVhZF91cmwucmVwbGFjZSgve3Rlcm19L2ksIHRlcm0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFwaV9rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9JmFwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0/YXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnR5cGVhaGVhZFJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRBYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudHlwZWFoZWFkUmVzcG9uc2UgPSB5aWVsZCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbDogdGhpcy5hdXRvY29tcGxldGVBYm9ydENvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShvcHRpb25zKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlYWhlYWRSZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy50eXBlYWhlYWRSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFR5cGVhaGVhZFN1Y2Nlc3MocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFR5cGVhaGVhZEZhaWxlZCh0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkU3VjY2VzcyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUeXBlYWhlYWRGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQ2xpZW50O1xuZXhwb3J0IHsgQ2xpZW50LCBHZXRGYWlsZWQsIEdldExvY2F0aW9uRmFpbGVkLCBSZXN1bHQsIEF1dG9jb21wbGV0ZVN1Y2Nlc3MsIExvY2F0aW9uU3VjY2VzcywgR2V0U3VjY2VzcywgR2V0TG9jYXRpb25TdWNjZXNzLCBBdXRvY29tcGxldGVGYWlsZWQsIExvY2F0aW9uRmFpbGVkLCBGaW5kU3VjY2VzcywgRmluZEZhaWxlZCwgVHlwZWFoZWFkRmFpbGVkLCBUeXBlYWhlYWRTdWNjZXNzLCB9O1xuIiwiZXhwb3J0IGNsYXNzIE91dHB1dEZpZWxkcyB7XG4gICAgY29uc3RydWN0b3Iob3V0cHV0RmllbGRzID0ge30pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBvdXRwdXRGaWVsZHMpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU91dHB1dEZpZWxkcy5qcy5tYXAiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBBdHRyaWJ1dGVWYWx1ZXMge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMsIGluZGV4KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIGxldCBzdWZmaXggPSBcIlwiO1xuICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICBzdWZmaXggPSBgLSR7aW5kZXh9YDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlkX3ByZWZpeCA9IG9wdGlvbnMuaWRfcHJlZml4O1xuICAgICAgICB0aGlzLmxpc3RJZCA9IGAke3RoaXMuaWRfcHJlZml4fS1saXN0JHtzdWZmaXh9YDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1BdHRyaWJ1dGVWYWx1ZXMuanMubWFwIiwiaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tIFwiLi9BdXRvY29tcGxldGVcIjtcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tIFwiLi9PcHRpb25zXCI7XG5pbXBvcnQgQ2xpZW50IGZyb20gJ2dldGFkZHJlc3MtYXBpJztcbmltcG9ydCB7IE91dHB1dEZpZWxkcyB9IGZyb20gXCIuL091dHB1dEZpZWxkc1wiO1xuaW1wb3J0IEF0dHJpYnV0ZVZhbHVlcyBmcm9tIFwiLi9BdHRyaWJ1dGVWYWx1ZXNcIjtcbmNsYXNzIEluc3RhbmNlQ291bnRlciB7XG4gICAgc3RhdGljIGFkZChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZXMucHVzaChhdXRvY29tcGxldGUpO1xuICAgIH1cbn1cbkluc3RhbmNlQ291bnRlci5pbnN0YW5jZXMgPSBbXTtcbmZ1bmN0aW9uIGF1dG9jb21wbGV0ZShpZCwgYXBpX2tleSwgb3B0aW9ucykge1xuICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mLCBfZywgX2gsIF9qLCBfaywgX2wsIF9tLCBfbywgX3AsIF9xLCBfciwgX3MsIF90LCBfdSwgX3YsIF93LCBfeCwgX3k7XG4gICAgaWYgKCFpZCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGFsbE9wdGlvbnMgPSBuZXcgT3B0aW9ucyhvcHRpb25zKTtcbiAgICBsZXQgdGV4dGJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICBpZiAoIXRleHRib3gpIHtcbiAgICAgICAgdGV4dGJveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpO1xuICAgIH1cbiAgICBpZiAoIXRleHRib3gpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjbGllbnQgPSBuZXcgQ2xpZW50KGFwaV9rZXksIGFsbE9wdGlvbnMuYWx0X2F1dG9jb21wbGV0ZV91cmwsIGFsbE9wdGlvbnMuYWx0X2dldF91cmwpO1xuICAgIGNvbnN0IG91dHB1dEZpZWxkcyA9IG5ldyBPdXRwdXRGaWVsZHMoYWxsT3B0aW9ucy5vdXRwdXRfZmllbGRzKTtcbiAgICBpZiAoYWxsT3B0aW9ucy5zZXRfZGVmYXVsdF9vdXRwdXRfZmllbGRfbmFtZXMpIHtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzAgPSAoX2EgPSBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMCkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogXCJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzEgPSAoX2IgPSBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMSkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogXCJmb3JtYXR0ZWRfYWRkcmVzc18xXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18yID0gKF9jID0gb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzIpICE9PSBudWxsICYmIF9jICE9PSB2b2lkIDAgPyBfYyA6IFwiZm9ybWF0dGVkX2FkZHJlc3NfMlwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMyA9IChfZCA9IG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18zKSAhPT0gbnVsbCAmJiBfZCAhPT0gdm9pZCAwID8gX2QgOiBcImZvcm1hdHRlZF9hZGRyZXNzXzNcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzQgPSAoX2UgPSBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfNCkgIT09IG51bGwgJiYgX2UgIT09IHZvaWQgMCA/IF9lIDogXCJmb3JtYXR0ZWRfYWRkcmVzc180XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5saW5lXzEgPSAoX2YgPSBvdXRwdXRGaWVsZHMubGluZV8xKSAhPT0gbnVsbCAmJiBfZiAhPT0gdm9pZCAwID8gX2YgOiBcImxpbmVfMVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMubGluZV8yID0gKF9nID0gb3V0cHV0RmllbGRzLmxpbmVfMikgIT09IG51bGwgJiYgX2cgIT09IHZvaWQgMCA/IF9nIDogXCJsaW5lXzJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxpbmVfMyA9IChfaCA9IG91dHB1dEZpZWxkcy5saW5lXzMpICE9PSBudWxsICYmIF9oICE9PSB2b2lkIDAgPyBfaCA6IFwibGluZV8zXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5saW5lXzQgPSAoX2ogPSBvdXRwdXRGaWVsZHMubGluZV80KSAhPT0gbnVsbCAmJiBfaiAhPT0gdm9pZCAwID8gX2ogOiBcImxpbmVfNFwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMudG93bl9vcl9jaXR5ID0gKF9rID0gb3V0cHV0RmllbGRzLnRvd25fb3JfY2l0eSkgIT09IG51bGwgJiYgX2sgIT09IHZvaWQgMCA/IF9rIDogXCJ0b3duX29yX2NpdHlcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmNvdW50eSA9IChfbCA9IG91dHB1dEZpZWxkcy5jb3VudHkpICE9PSBudWxsICYmIF9sICE9PSB2b2lkIDAgPyBfbCA6IFwiY291bnR5XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5jb3VudHJ5ID0gKF9tID0gb3V0cHV0RmllbGRzLmNvdW50cnkpICE9PSBudWxsICYmIF9tICE9PSB2b2lkIDAgPyBfbSA6IFwiY291bnRyeVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMucG9zdGNvZGUgPSAoX28gPSBvdXRwdXRGaWVsZHMucG9zdGNvZGUpICE9PSBudWxsICYmIF9vICE9PSB2b2lkIDAgPyBfbyA6IFwicG9zdGNvZGVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxhdGl0dWRlID0gKF9wID0gb3V0cHV0RmllbGRzLmxhdGl0dWRlKSAhPT0gbnVsbCAmJiBfcCAhPT0gdm9pZCAwID8gX3AgOiBcImxhdGl0dWRlXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5sb25naXR1ZGUgPSAoX3EgPSBvdXRwdXRGaWVsZHMubG9uZ2l0dWRlKSAhPT0gbnVsbCAmJiBfcSAhPT0gdm9pZCAwID8gX3EgOiBcImxvbmdpdHVkZVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuYnVpbGRpbmdfbnVtYmVyID0gKF9yID0gb3V0cHV0RmllbGRzLmJ1aWxkaW5nX251bWJlcikgIT09IG51bGwgJiYgX3IgIT09IHZvaWQgMCA/IF9yIDogXCJidWlsZGluZ19udW1iZXJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmJ1aWxkaW5nX25hbWUgPSAoX3MgPSBvdXRwdXRGaWVsZHMuYnVpbGRpbmdfbmFtZSkgIT09IG51bGwgJiYgX3MgIT09IHZvaWQgMCA/IF9zIDogXCJidWlsZGluZ19uYW1lXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5zdWJfYnVpbGRpbmdfbnVtYmVyID0gKF90ID0gb3V0cHV0RmllbGRzLnN1Yl9idWlsZGluZ19udW1iZXIpICE9PSBudWxsICYmIF90ICE9PSB2b2lkIDAgPyBfdCA6IFwic3ViX2J1aWxkaW5nX251bWJlclwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuc3ViX2J1aWxkaW5nX25hbWUgPSAoX3UgPSBvdXRwdXRGaWVsZHMuc3ViX2J1aWxkaW5nX25hbWUpICE9PSBudWxsICYmIF91ICE9PSB2b2lkIDAgPyBfdSA6IFwic3ViX2J1aWxkaW5nX25hbWVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnRob3JvdWdoZmFyZSA9IChfdiA9IG91dHB1dEZpZWxkcy50aG9yb3VnaGZhcmUpICE9PSBudWxsICYmIF92ICE9PSB2b2lkIDAgPyBfdiA6ICd0aG9yb3VnaGZhcmUnO1xuICAgICAgICBvdXRwdXRGaWVsZHMubG9jYWxpdHkgPSAoX3cgPSBvdXRwdXRGaWVsZHMubG9jYWxpdHkpICE9PSBudWxsICYmIF93ICE9PSB2b2lkIDAgPyBfdyA6IFwibG9jYWxpdHlcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmRpc3RyaWN0ID0gKF94ID0gb3V0cHV0RmllbGRzLmRpc3RyaWN0KSAhPT0gbnVsbCAmJiBfeCAhPT0gdm9pZCAwID8gX3ggOiBcImRpc3RyaWN0XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5yZXNpZGVudGlhbCA9IChfeSA9IG91dHB1dEZpZWxkcy5yZXNpZGVudGlhbCkgIT09IG51bGwgJiYgX3kgIT09IHZvaWQgMCA/IF95IDogXCJyZXNpZGVudGlhbFwiO1xuICAgIH1cbiAgICBpZiAoIW91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18wKSB7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18wID0gaWQ7XG4gICAgfVxuICAgIGNvbnN0IGluZGV4ID0gSW5zdGFuY2VDb3VudGVyLmluc3RhbmNlcy5sZW5ndGg7XG4gICAgY29uc3QgYXR0cmlidXRlVmFsdWVzID0gbmV3IEF0dHJpYnV0ZVZhbHVlcyhhbGxPcHRpb25zLCBpbmRleCk7XG4gICAgY29uc3QgYXV0b2NvbXBsZXRlID0gbmV3IEF1dG9jb21wbGV0ZSh0ZXh0Ym94LCBjbGllbnQsIG91dHB1dEZpZWxkcywgYXR0cmlidXRlVmFsdWVzKTtcbiAgICBhdXRvY29tcGxldGUuYnVpbGQoKTtcbiAgICBJbnN0YW5jZUNvdW50ZXIuYWRkKGF1dG9jb21wbGV0ZSk7XG59XG5mdW5jdGlvbiBkZXN0cm95KCkge1xuICAgIGZvciAoY29uc3QgaW5zdGFuY2Ugb2YgSW5zdGFuY2VDb3VudGVyLmluc3RhbmNlcykge1xuICAgICAgICBpbnN0YW5jZS5kZXN0cm95KCk7XG4gICAgfVxuICAgIEluc3RhbmNlQ291bnRlci5pbnN0YW5jZXMgPSBbXTtcbn1cbmV4cG9ydCB7IGF1dG9jb21wbGV0ZSwgZGVzdHJveSwgT3B0aW9ucyB9O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9SW5kZXguanMubWFwIl0sIm5hbWVzIjpbIl9fYXdhaXRlciIsInRoaXMiXSwibWFwcGluZ3MiOiJBQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDbEMsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtBQUMxQyxRQUFRLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLDBDQUEwQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDN0YsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2pDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN2QixRQUFRLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsS0FBSztBQUNMLENBQUM7QUFDTSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hDLElBQUksT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ2xELFFBQVEsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsaURBQWlELEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNwRyxRQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDL0IsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2pDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN2QixRQUFRLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsS0FBSztBQUNMLENBQUM7QUFDTSxNQUFNLGdCQUFnQixDQUFDO0FBQzlCLElBQUksT0FBTyxRQUFRLENBQUMs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
