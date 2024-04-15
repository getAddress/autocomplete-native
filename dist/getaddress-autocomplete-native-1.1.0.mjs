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
        outputFields.formatted_address_0 = "";
        outputFields.formatted_address_1 = "formatted_address_1";
        outputFields.formatted_address_2 = "formatted_address_2";
        outputFields.formatted_address_3 = "formatted_address_3";
        outputFields.formatted_address_4 = "formatted_address_4";
        outputFields.line_1 = "line_1";
        outputFields.line_2 = "line_2";
        outputFields.line_3 = "line_3";
        outputFields.line_4 = "line_4";
        outputFields.town_or_city = "town_or_city";
        outputFields.county = "county";
        outputFields.country = "country";
        outputFields.postcode = "postcode";
        outputFields.latitude = "latitude";
        outputFields.longitude = "longitude";
        outputFields.building_number = "building_number";
        outputFields.building_name = "building_name";
        outputFields.sub_building_number = "sub_building_number";
        outputFields.sub_building_name = "sub_building_name";
        outputFields.thoroughfare = 'thoroughfare';
        outputFields.locality = "locality";
        outputFields.district = "district";
        outputFields.residential = "residential";
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

export { autocomplete, destroy };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtbmF0aXZlLTEuMS4wLm1qcyIsInNvdXJjZXMiOlsiLi4vbGliL0V2ZW50cy5qcyIsIi4uL2xpYi9BdXRvY29tcGxldGUuanMiLCIuLi9saWIvT3B0aW9ucy5qcyIsIi4uL25vZGVfbW9kdWxlcy9nZXRhZGRyZXNzLWFwaS9saWIvVHlwZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvZ2V0YWRkcmVzcy1hcGkvbGliL0luZGV4LmpzIiwiLi4vbGliL091dHB1dEZpZWxkcy5qcyIsIi4uL2xpYi9BdHRyaWJ1dGVWYWx1ZXMuanMiLCIuLi9saWIvSW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIEFkZHJlc3NTZWxlY3RlZEV2ZW50IHtcbiAgICBzdGF0aWMgZGlzcGF0Y2goZWxlbWVudCwgaWQsIGFkZHJlc3MpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtYWRkcmVzcy1zZWxlY3RlZFwiLCB7IGJ1YmJsZXM6IHRydWUgfSk7XG4gICAgICAgIGV2dFtcImFkZHJlc3NcIl0gPSBhZGRyZXNzO1xuICAgICAgICBldnRbXCJpZFwiXSA9IGlkO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQWRkcmVzc1NlbGVjdGVkRmFpbGVkRXZlbnQge1xuICAgIHN0YXRpYyBkaXNwYXRjaChlbGVtZW50LCBpZCwgc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IGV2dCA9IG5ldyBFdmVudChcImdldGFkZHJlc3MtYXV0b2NvbXBsZXRlLWFkZHJlc3Mtc2VsZWN0ZWQtZmFpbGVkXCIsIHsgYnViYmxlczogdHJ1ZSB9KTtcbiAgICAgICAgZXZ0W1wic3RhdHVzXCJdID0gc3RhdHVzO1xuICAgICAgICBldnRbXCJtZXNzYWdlXCJdID0gbWVzc2FnZTtcbiAgICAgICAgZXZ0W1wiaWRcIl0gPSBpZDtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFN1Z2dlc3Rpb25zRXZlbnQge1xuICAgIHN0YXRpYyBkaXNwYXRjaChlbGVtZW50LCBxdWVyeSwgc3VnZ2VzdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbnNcIiwgeyBidWJibGVzOiB0cnVlIH0pO1xuICAgICAgICBldnRbXCJzdWdnZXN0aW9uc1wiXSA9IHN1Z2dlc3Rpb25zO1xuICAgICAgICBldnRbXCJxdWVyeVwiXSA9IHF1ZXJ5O1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU3VnZ2VzdGlvbnNGYWlsZWRFdmVudCB7XG4gICAgc3RhdGljIGRpc3BhdGNoKGVsZW1lbnQsIHF1ZXJ5LCBzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtc3VnZ2VzdGlvbnMtZmFpbGVkXCIsIHsgYnViYmxlczogdHJ1ZSB9KTtcbiAgICAgICAgZXZ0W1wic3RhdHVzXCJdID0gc3RhdHVzO1xuICAgICAgICBldnRbXCJtZXNzYWdlXCJdID0gbWVzc2FnZTtcbiAgICAgICAgZXZ0W1wicXVlcnlcIl0gPSBxdWVyeTtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9RXZlbnRzLmpzLm1hcCIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuaW1wb3J0IHsgQWRkcmVzc1NlbGVjdGVkRXZlbnQsIEFkZHJlc3NTZWxlY3RlZEZhaWxlZEV2ZW50LCBTdWdnZXN0aW9uc0V2ZW50LCBTdWdnZXN0aW9uc0ZhaWxlZEV2ZW50IH0gZnJvbSBcIi4vRXZlbnRzXCI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdXRvY29tcGxldGUge1xuICAgIGNvbnN0cnVjdG9yKGlucHV0LCBjbGllbnQsIG91dHB1dF9maWVsZHMsIGF0dHJpYnV0ZVZhbHVlcykge1xuICAgICAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50O1xuICAgICAgICB0aGlzLm91dHB1dF9maWVsZHMgPSBvdXRwdXRfZmllbGRzO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZVZhbHVlcyA9IGF0dHJpYnV0ZVZhbHVlcztcbiAgICAgICAgdGhpcy5vbklucHV0Rm9jdXMgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5zZWxlY3Rfb25fZm9jdXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uSW5wdXRQYXN0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnBvcHVsYXRlTGlzdCgpOyB9LCAxMDApO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uSW5wdXQgPSAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubGlzdCAmJiAoZSBpbnN0YW5jZW9mIElucHV0RXZlbnQgPT0gZmFsc2UpICYmIGUudGFyZ2V0IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgQXJyYXkuZnJvbSh0aGlzLmxpc3QucXVlcnlTZWxlY3RvckFsbChcIm9wdGlvblwiKSlcbiAgICAgICAgICAgICAgICAgICAgLmV2ZXJ5KChvKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvLmlubmVyVGV4dCA9PT0gaW5wdXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlU3VnZ2VzdGlvblNlbGVjdGVkKG8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLm9uS2V5VXAgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlVcChldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25LZXlEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmRlYnVnKGV2ZW50KTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkRlZmF1bHQoZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmRlYnVnID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmRlYnVnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlQ29tcG9uZW50Qmx1ciA9IChmb3JjZSA9IGZhbHNlKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5ibHVyVGltZXIpO1xuICAgICAgICAgICAgY29uc3QgZGVsYXkgPSBmb3JjZSA/IDAgOiAxMDA7XG4gICAgICAgICAgICB0aGlzLmJsdXJUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlU3VnZ2VzdGlvblNlbGVjdGVkID0gKHN1Z2dlc3Rpb24pID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5lbmFibGVfZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5jbGVhcl9saXN0X29uX3NlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTGlzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IHN1Z2dlc3Rpb24uZGF0YXNldC5pZDtcbiAgICAgICAgICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWRkcmVzc1Jlc3VsdCA9IHlpZWxkIHRoaXMuY2xpZW50LmdldChpZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzUmVzdWx0LmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSBhZGRyZXNzUmVzdWx0LnRvU3VjY2VzcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kKHN1Y2Nlc3MuYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzU2VsZWN0ZWRFdmVudC5kaXNwYXRjaCh0aGlzLmlucHV0LCBpZCwgc3VjY2Vzcy5hZGRyZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmlucHV0X2ZvY3VzX29uX3NlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlucHV0LnNldFNlbGVjdGlvblJhbmdlKHRoaXMuaW5wdXQudmFsdWUubGVuZ3RoLCB0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gYWRkcmVzc1Jlc3VsdC50b0ZhaWxlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgQWRkcmVzc1NlbGVjdGVkRmFpbGVkRXZlbnQuZGlzcGF0Y2godGhpcy5pbnB1dCwgaWQsIGZhaWxlZC5zdGF0dXMsIGZhaWxlZC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYmluZCA9IChhZGRyZXNzKSA9PiB7XG4gICAgICAgICAgICBpZiAoYWRkcmVzcyAmJiB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmJpbmRfb3V0cHV0X2ZpZWxkcykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmJ1aWxkaW5nX25hbWUsIGFkZHJlc3MuYnVpbGRpbmdfbmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuYnVpbGRpbmdfbnVtYmVyLCBhZGRyZXNzLmJ1aWxkaW5nX251bWJlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMubGF0aXR1ZGUsIGFkZHJlc3MubGF0aXR1ZGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMubG9uZ2l0dWRlLCBhZGRyZXNzLmxvbmdpdHVkZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzEsIGFkZHJlc3MubGluZV8xKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzIsIGFkZHJlc3MubGluZV8yKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzMsIGFkZHJlc3MubGluZV8zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5saW5lXzQsIGFkZHJlc3MubGluZV80KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5jb3VudHJ5LCBhZGRyZXNzLmNvdW50cnkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmNvdW50eSwgYWRkcmVzcy5jb3VudHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzAsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbMF0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzEsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbMV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzIsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbMl0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzMsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbM10pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzQsIGFkZHJlc3MuZm9ybWF0dGVkX2FkZHJlc3NbNF0pO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLnRvd25fb3JfY2l0eSwgYWRkcmVzcy50b3duX29yX2NpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxvY2FsaXR5LCBhZGRyZXNzLmxvY2FsaXR5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5kaXN0cmljdCwgYWRkcmVzcy5kaXN0cmljdCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMucmVzaWRlbnRpYWwsIGFkZHJlc3MucmVzaWRlbnRpYWwudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuc3ViX2J1aWxkaW5nX25hbWUsIGFkZHJlc3Muc3ViX2J1aWxkaW5nX25hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLnN1Yl9idWlsZGluZ19udW1iZXIsIGFkZHJlc3Muc3ViX2J1aWxkaW5nX251bWJlcik7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMudGhvcm91Z2hmYXJlLCBhZGRyZXNzLnRob3JvdWdoZmFyZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMucG9zdGNvZGUsIGFkZHJlc3MucG9zdGNvZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkID0gKGZpZWxkTmFtZSwgZmllbGRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaWVsZE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGZpZWxkTmFtZSk7XG4gICAgICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihmaWVsZE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmlubmVyVGV4dCA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bkRlZmF1bHQgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGxldCBpc1ByaW50YWJsZUtleSA9IGV2ZW50LmtleSAmJiAoZXZlbnQua2V5Lmxlbmd0aCA9PT0gMSB8fCBldmVudC5rZXkgPT09ICdVbmlkZW50aWZpZWQnKTtcbiAgICAgICAgICAgIGlmIChpc1ByaW50YWJsZUtleSkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmZpbHRlclRpbWVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlclRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCA+PSB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLm1pbmltdW1fY2hhcmFjdGVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZUxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmRlbGF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVLZXlVcCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdCYWNrc3BhY2UnIHx8IGV2ZW50LmNvZGUgPT09ICdEZWxldGUnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldCA9PSB0aGlzLmlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGggPCB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLm1pbmltdW1fY2hhcmFjdGVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnBvcHVsYXRlTGlzdCA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGNvbnN0IGF1dG9jb21wbGV0ZU9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgYWxsOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRvcDogdGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5zdWdnZXN0aW9uX2NvdW50LFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBcIntmb3JtYXR0ZWRfYWRkcmVzc317cG9zdGNvZGUsLCB9e3Bvc3Rjb2RlfVwiXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlT3B0aW9ucy5maWx0ZXIgPSB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmZpbHRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gKF9hID0gdGhpcy5pbnB1dC52YWx1ZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHlpZWxkIHRoaXMuY2xpZW50LmF1dG9jb21wbGV0ZShxdWVyeSwgYXV0b2NvbXBsZXRlT3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmlzU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1Y2Nlc3MgPSByZXN1bHQudG9TdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SXRlbXMgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saXN0ICYmIHN1Y2Nlc3Muc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VjY2Vzcy5zdWdnZXN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGkgPSB0aGlzLmdldExpc3RJdGVtKHN1Y2Nlc3Muc3VnZ2VzdGlvbnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3SXRlbXMucHVzaChsaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0LnJlcGxhY2VDaGlsZHJlbiguLi5uZXdJdGVtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTGlzdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBTdWdnZXN0aW9uc0V2ZW50LmRpc3BhdGNoKHRoaXMuaW5wdXQsIHF1ZXJ5LCBzdWNjZXNzLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZhaWxlZCA9IHJlc3VsdC50b0ZhaWxlZCgpO1xuICAgICAgICAgICAgICAgIFN1Z2dlc3Rpb25zRmFpbGVkRXZlbnQuZGlzcGF0Y2godGhpcy5pbnB1dCwgcXVlcnksIGZhaWxlZC5zdGF0dXMsIGZhaWxlZC5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xlYXJMaXN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMubGlzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdC5yZXBsYWNlQ2hpbGRyZW4oLi4uW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldExpc3RJdGVtID0gKHN1Z2dlc3Rpb24pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ09QVElPTicpO1xuICAgICAgICAgICAgbGV0IGFkZHJlc3MgPSBzdWdnZXN0aW9uLmFkZHJlc3M7XG4gICAgICAgICAgICBvcHRpb24uaW5uZXJUZXh0ID0gYWRkcmVzcztcbiAgICAgICAgICAgIG9wdGlvbi5kYXRhc2V0LmlkID0gc3VnZ2VzdGlvbi5pZDtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb247XG4gICAgICAgIH07XG4gICAgfVxuICAgIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuZGVzdHJveUlucHV0KCk7XG4gICAgICAgIHRoaXMuZGVzdHJveUxpc3QoKTtcbiAgICB9XG4gICAgZGVzdHJveUxpc3QoKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3QpIHtcbiAgICAgICAgICAgIHRoaXMubGlzdC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBkZXN0cm95SW5wdXQoKSB7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlQXR0cmlidXRlKCdsaXN0Jyk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLm9uSW5wdXRGb2N1cyk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGFzdGUnLCB0aGlzLm9uSW5wdXRQYXN0ZSk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcCk7XG4gICAgICAgIHRoaXMuaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLm9uSW5wdXQpO1xuICAgIH1cbiAgICBidWlsZCgpIHtcbiAgICAgICAgdGhpcy5pbnB1dC5zZXRBdHRyaWJ1dGUoJ2xpc3QnLCBgJHt0aGlzLmF0dHJpYnV0ZVZhbHVlcy5saXN0SWR9YCk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLm9uSW5wdXRGb2N1cyk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigncGFzdGUnLCB0aGlzLm9uSW5wdXRQYXN0ZSk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHRoaXMub25LZXlVcCk7XG4gICAgICAgIHRoaXMuaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCB0aGlzLm9uSW5wdXQpO1xuICAgICAgICB0aGlzLmxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdEQVRBTElTVCcpO1xuICAgICAgICB0aGlzLmxpc3QuaWQgPSB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5saXN0SWQ7XG4gICAgICAgIHRoaXMuaW5wdXQuaW5zZXJ0QWRqYWNlbnRFbGVtZW50KFwiYWZ0ZXJlbmRcIiwgdGhpcy5saXN0KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1BdXRvY29tcGxldGUuanMubWFwIiwiZXhwb3J0IGNsYXNzIE9wdGlvbnMge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICB0aGlzLmlkX3ByZWZpeCA9IFwiZ2V0QWRkcmVzcy1hdXRvY29tcGxldGUtbmF0aXZlXCI7XG4gICAgICAgIHRoaXMub3V0cHV0X2ZpZWxkcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDIwMDtcbiAgICAgICAgdGhpcy5taW5pbXVtX2NoYXJhY3RlcnMgPSAyO1xuICAgICAgICB0aGlzLmNsZWFyX2xpc3Rfb25fc2VsZWN0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZWxlY3Rfb25fZm9jdXMgPSB0cnVlO1xuICAgICAgICB0aGlzLmFsdF9hdXRvY29tcGxldGVfdXJsID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmFsdF9nZXRfdXJsID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25fY291bnQgPSA2O1xuICAgICAgICB0aGlzLmZpbHRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5iaW5kX291dHB1dF9maWVsZHMgPSB0cnVlO1xuICAgICAgICB0aGlzLmlucHV0X2ZvY3VzX29uX3NlbGVjdCA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVidWcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbmFibGVfZ2V0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zZXRfZGVmYXVsdF9vdXRwdXRfZmllbGRfbmFtZXMgPSB0cnVlO1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIG9wdGlvbnMpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU9wdGlvbnMuanMubWFwIiwiZXhwb3J0IGNsYXNzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3IoaXNTdWNjZXNzKSB7XG4gICAgICAgIHRoaXMuaXNTdWNjZXNzID0gaXNTdWNjZXNzO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTdWNjZXNzIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIodHJ1ZSk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEF1dG9jb21wbGV0ZVN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihzdWdnZXN0aW9ucykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBMb2NhdGlvblN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihzdWdnZXN0aW9ucykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gc3VnZ2VzdGlvbnM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHZXRTdWNjZXNzIGV4dGVuZHMgU3VjY2VzcyB7XG4gICAgY29uc3RydWN0b3IoYWRkcmVzcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZHJlc3MgPSBhZGRyZXNzO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaWQgbm90IGZhaWwnKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgR2V0TG9jYXRpb25TdWNjZXNzIGV4dGVuZHMgU3VjY2VzcyB7XG4gICAgY29uc3RydWN0b3IobG9jYXRpb24pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5sb2NhdGlvbiA9IGxvY2F0aW9uO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEaWQgbm90IGZhaWwnKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgR2V0TG9jYXRpb25GYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGEgc3VjY2VzcycpO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEF1dG9jb21wbGV0ZUZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgTG9jYXRpb25GYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm90IGEgc3VjY2VzcycpO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEdldEZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgRmluZFN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihhZGRyZXNzZXMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZGRyZXNzZXMgPSBhZGRyZXNzZXM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBGaW5kRmFpbGVkIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCcpO1xuICAgIH1cbiAgICB0b0ZhaWxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFR5cGVhaGVhZFN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihyZXN1bHRzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMucmVzdWx0cyA9IHJlc3VsdHM7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBUeXBlYWhlYWRGYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG4iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmltcG9ydCB7IEdldEZhaWxlZCwgUmVzdWx0LCBBdXRvY29tcGxldGVTdWNjZXNzLCBHZXRTdWNjZXNzLCBBdXRvY29tcGxldGVGYWlsZWQsIEZpbmRTdWNjZXNzLCBGaW5kRmFpbGVkLCBUeXBlYWhlYWRTdWNjZXNzLCBUeXBlYWhlYWRGYWlsZWQsIExvY2F0aW9uU3VjY2VzcywgTG9jYXRpb25GYWlsZWQsIEdldExvY2F0aW9uU3VjY2VzcywgR2V0TG9jYXRpb25GYWlsZWQgfSBmcm9tICcuL1R5cGVzJztcbmNsYXNzIENsaWVudCB7XG4gICAgY29uc3RydWN0b3IoYXBpX2tleSwgYXV0b2NvbXBsZXRlX3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL2F1dG9jb21wbGV0ZS97cXVlcnl9JywgZ2V0X3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL2dldC97aWR9JywgbG9jYXRpb25fdXJsID0gJ2h0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vbG9jYXRpb24ve3F1ZXJ5fScsIGdldF9sb2NhdGlvbl91cmwgPSAnaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby9nZXQtbG9jYXRpb24ve2lkfScsIHR5cGVhaGVhZF91cmwgPSAnaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby90eXBlYWhlYWQve3Rlcm19Jykge1xuICAgICAgICB0aGlzLmFwaV9rZXkgPSBhcGlfa2V5O1xuICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZV91cmwgPSBhdXRvY29tcGxldGVfdXJsO1xuICAgICAgICB0aGlzLmdldF91cmwgPSBnZXRfdXJsO1xuICAgICAgICB0aGlzLmxvY2F0aW9uX3VybCA9IGxvY2F0aW9uX3VybDtcbiAgICAgICAgdGhpcy5nZXRfbG9jYXRpb25fdXJsID0gZ2V0X2xvY2F0aW9uX3VybDtcbiAgICAgICAgdGhpcy50eXBlYWhlYWRfdXJsID0gdHlwZWFoZWFkX3VybDtcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5sb2NhdGlvblJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmdldExvY2F0aW9uUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudHlwZWFoZWFkUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICB0aGlzLmdldEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgdGhpcy50eXBlYWhlYWRBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIHRoaXMubG9jYXRpb25BYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIHRoaXMuZ2V0TG9jYXRpb25BYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgfVxuICAgIGxvY2F0aW9uKHF1ZXJ5XzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qIChxdWVyeSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBhbGw6IHRydWUgfSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMubG9jYXRpb25fdXJsLnJlcGxhY2UoL3txdWVyeX0vaSwgcXVlcnkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFwaV9rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9JmFwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0/YXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvY2F0aW9uUmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25BYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvblJlc3BvbnNlID0geWllbGQgZmV0Y2godXJsLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMubG9jYXRpb25BYm9ydENvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShjb21iaW5lZE9wdGlvbnMpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvY2F0aW9uUmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMubG9jYXRpb25SZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Z2dlc3Rpb25zID0ganNvbi5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMb2NhdGlvblN1Y2Nlc3Moc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5sb2NhdGlvblJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uRmFpbGVkKHRoaXMubG9jYXRpb25SZXNwb25zZS5zdGF0dXMsIGpzb24uTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uU3VjY2VzcyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMb2NhdGlvbkZhaWxlZCg0MDEsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMb2NhdGlvbkZhaWxlZCg0MDEsICdVbmF1dGhvcmlzZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25SZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldExvY2F0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmdldF9sb2NhdGlvbl91cmwucmVwbGFjZSgve2lkfS9pLCBpZCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0TG9jYXRpb25SZXNwb25zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0TG9jYXRpb25BYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMuZ2V0TG9jYXRpb25BYm9ydENvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldFJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmdldFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbG9hY3Rpb24gPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uU3VjY2Vzcyhsb2FjdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmdldFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uRmFpbGVkKHRoaXMuZ2V0UmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uRmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldExvY2F0aW9uRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGF1dG9jb21wbGV0ZShxdWVyeV8xKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uKiAocXVlcnksIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21iaW5lZE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHsgYWxsOiB0cnVlIH0sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmF1dG9jb21wbGV0ZV91cmwucmVwbGFjZSgve3F1ZXJ5fS9pLCBxdWVyeSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNvbWJpbmVkT3B0aW9ucyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWdnZXN0aW9ucyA9IGpzb24uc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlU3VjY2VzcyhzdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEF1dG9jb21wbGV0ZUZhaWxlZCh0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlU3VjY2VzcyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldChpZCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5nZXRfdXJsLnJlcGxhY2UoL3tpZH0vaSwgaWQpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFwaV9rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9JmFwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0/YXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldFJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRBYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzcG9uc2UgPSB5aWVsZCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiB0aGlzLmdldEFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuZ2V0UmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzID0ganNvbjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHZXRTdWNjZXNzKGFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5nZXRSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHZXRGYWlsZWQodGhpcy5nZXRSZXNwb25zZS5zdGF0dXMsIGpzb24uTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0RmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldEZhaWxlZCg0MDEsICdVbmF1dGhvcmlzZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBmaW5kKHBvc3Rjb2RlKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0geWllbGQgZmV0Y2goYGh0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vZmluZC8ke3Bvc3Rjb2RlfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fSZleHBhbmQ9dHJ1ZWApO1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzZXMgPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRTdWNjZXNzKGFkZHJlc3Nlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaW5kRmFpbGVkKHJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaW5kRmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRGYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0eXBlYWhlYWQodGVybV8xKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uKiAodGVybSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLnR5cGVhaGVhZF91cmwucmVwbGFjZSgve3Rlcm19L2ksIHRlcm0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFwaV9rZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVybC5pbmNsdWRlcygnPycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9JmFwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0/YXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnR5cGVhaGVhZFJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRBYm9ydENvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudHlwZWFoZWFkUmVzcG9uc2UgPSB5aWVsZCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbDogdGhpcy5hdXRvY29tcGxldGVBYm9ydENvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShvcHRpb25zKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50eXBlYWhlYWRSZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy50eXBlYWhlYWRSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdHMgPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFR5cGVhaGVhZFN1Y2Nlc3MocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFR5cGVhaGVhZEZhaWxlZCh0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkU3VjY2VzcyhbXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUeXBlYWhlYWRGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQ2xpZW50O1xuZXhwb3J0IHsgQ2xpZW50LCBHZXRGYWlsZWQsIEdldExvY2F0aW9uRmFpbGVkLCBSZXN1bHQsIEF1dG9jb21wbGV0ZVN1Y2Nlc3MsIExvY2F0aW9uU3VjY2VzcywgR2V0U3VjY2VzcywgR2V0TG9jYXRpb25TdWNjZXNzLCBBdXRvY29tcGxldGVGYWlsZWQsIExvY2F0aW9uRmFpbGVkLCBGaW5kU3VjY2VzcywgRmluZEZhaWxlZCwgVHlwZWFoZWFkRmFpbGVkLCBUeXBlYWhlYWRTdWNjZXNzLCB9O1xuIiwiZXhwb3J0IGNsYXNzIE91dHB1dEZpZWxkcyB7XG4gICAgY29uc3RydWN0b3Iob3V0cHV0RmllbGRzID0ge30pIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCBvdXRwdXRGaWVsZHMpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPU91dHB1dEZpZWxkcy5qcy5tYXAiLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBBdHRyaWJ1dGVWYWx1ZXMge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMsIGluZGV4KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIGxldCBzdWZmaXggPSBcIlwiO1xuICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICBzdWZmaXggPSBgLSR7aW5kZXh9YDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlkX3ByZWZpeCA9IG9wdGlvbnMuaWRfcHJlZml4O1xuICAgICAgICB0aGlzLmxpc3RJZCA9IGAke3RoaXMuaWRfcHJlZml4fS1saXN0JHtzdWZmaXh9YDtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1BdHRyaWJ1dGVWYWx1ZXMuanMubWFwIiwiaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tIFwiLi9BdXRvY29tcGxldGVcIjtcbmltcG9ydCB7IE9wdGlvbnMgfSBmcm9tIFwiLi9PcHRpb25zXCI7XG5pbXBvcnQgQ2xpZW50IGZyb20gJ2dldGFkZHJlc3MtYXBpJztcbmltcG9ydCB7IE91dHB1dEZpZWxkcyB9IGZyb20gXCIuL091dHB1dEZpZWxkc1wiO1xuaW1wb3J0IEF0dHJpYnV0ZVZhbHVlcyBmcm9tIFwiLi9BdHRyaWJ1dGVWYWx1ZXNcIjtcbmNsYXNzIEluc3RhbmNlQ291bnRlciB7XG4gICAgc3RhdGljIGFkZChhdXRvY29tcGxldGUpIHtcbiAgICAgICAgdGhpcy5pbnN0YW5jZXMucHVzaChhdXRvY29tcGxldGUpO1xuICAgIH1cbn1cbkluc3RhbmNlQ291bnRlci5pbnN0YW5jZXMgPSBbXTtcbmV4cG9ydCBmdW5jdGlvbiBhdXRvY29tcGxldGUoaWQsIGFwaV9rZXksIG9wdGlvbnMpIHtcbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYWxsT3B0aW9ucyA9IG5ldyBPcHRpb25zKG9wdGlvbnMpO1xuICAgIGxldCB0ZXh0Ym94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmICghdGV4dGJveCkge1xuICAgICAgICB0ZXh0Ym94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCk7XG4gICAgfVxuICAgIGlmICghdGV4dGJveCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoYXBpX2tleSwgYWxsT3B0aW9ucy5hbHRfYXV0b2NvbXBsZXRlX3VybCwgYWxsT3B0aW9ucy5hbHRfZ2V0X3VybCk7XG4gICAgY29uc3Qgb3V0cHV0RmllbGRzID0gbmV3IE91dHB1dEZpZWxkcyhhbGxPcHRpb25zLm91dHB1dF9maWVsZHMpO1xuICAgIGlmIChhbGxPcHRpb25zLnNldF9kZWZhdWx0X291dHB1dF9maWVsZF9uYW1lcykge1xuICAgICAgICBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMCA9IFwiXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18xID0gXCJmb3JtYXR0ZWRfYWRkcmVzc18xXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18yID0gXCJmb3JtYXR0ZWRfYWRkcmVzc18yXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18zID0gXCJmb3JtYXR0ZWRfYWRkcmVzc18zXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc180ID0gXCJmb3JtYXR0ZWRfYWRkcmVzc180XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5saW5lXzEgPSBcImxpbmVfMVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMubGluZV8yID0gXCJsaW5lXzJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxpbmVfMyA9IFwibGluZV8zXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5saW5lXzQgPSBcImxpbmVfNFwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMudG93bl9vcl9jaXR5ID0gXCJ0b3duX29yX2NpdHlcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmNvdW50eSA9IFwiY291bnR5XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5jb3VudHJ5ID0gXCJjb3VudHJ5XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5wb3N0Y29kZSA9IFwicG9zdGNvZGVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxhdGl0dWRlID0gXCJsYXRpdHVkZVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMubG9uZ2l0dWRlID0gXCJsb25naXR1ZGVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmJ1aWxkaW5nX251bWJlciA9IFwiYnVpbGRpbmdfbnVtYmVyXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5idWlsZGluZ19uYW1lID0gXCJidWlsZGluZ19uYW1lXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5zdWJfYnVpbGRpbmdfbnVtYmVyID0gXCJzdWJfYnVpbGRpbmdfbnVtYmVyXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5zdWJfYnVpbGRpbmdfbmFtZSA9IFwic3ViX2J1aWxkaW5nX25hbWVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnRob3JvdWdoZmFyZSA9ICd0aG9yb3VnaGZhcmUnO1xuICAgICAgICBvdXRwdXRGaWVsZHMubG9jYWxpdHkgPSBcImxvY2FsaXR5XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5kaXN0cmljdCA9IFwiZGlzdHJpY3RcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnJlc2lkZW50aWFsID0gXCJyZXNpZGVudGlhbFwiO1xuICAgIH1cbiAgICBpZiAoIW91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18wKSB7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18wID0gaWQ7XG4gICAgfVxuICAgIGNvbnN0IGluZGV4ID0gSW5zdGFuY2VDb3VudGVyLmluc3RhbmNlcy5sZW5ndGg7XG4gICAgY29uc3QgYXR0cmlidXRlVmFsdWVzID0gbmV3IEF0dHJpYnV0ZVZhbHVlcyhhbGxPcHRpb25zLCBpbmRleCk7XG4gICAgY29uc3QgYXV0b2NvbXBsZXRlID0gbmV3IEF1dG9jb21wbGV0ZSh0ZXh0Ym94LCBjbGllbnQsIG91dHB1dEZpZWxkcywgYXR0cmlidXRlVmFsdWVzKTtcbiAgICBhdXRvY29tcGxldGUuYnVpbGQoKTtcbiAgICBJbnN0YW5jZUNvdW50ZXIuYWRkKGF1dG9jb21wbGV0ZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICBmb3IgKGNvbnN0IGluc3RhbmNlIG9mIEluc3RhbmNlQ291bnRlci5pbnN0YW5jZXMpIHtcbiAgICAgICAgaW5zdGFuY2UuZGVzdHJveSgpO1xuICAgIH1cbiAgICBJbnN0YW5jZUNvdW50ZXIuaW5zdGFuY2VzID0gW107XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1JbmRleC5qcy5tYXAiXSwibmFtZXMiOlsiX19hd2FpdGVyIiwidGhpcyJdLCJtYXBwaW5ncyI6IkFBQU8sTUFBTSxvQkFBb0IsQ0FBQztBQUNsQyxJQUFJLE9BQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0FBQzFDLFFBQVEsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsMENBQTBDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM3RixRQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDakMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFFBQVEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxLQUFLO0FBQ0wsQ0FBQztBQUNNLE1BQU0sMEJBQTBCLENBQUM7QUFDeEMsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFDbEQsUUFBUSxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxpREFBaUQsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3BHLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUMvQixRQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7QUFDakMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFFBQVEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxLQUFLO0FBQ0wsQ0FBQztBQUNNLE1BQU0sZ0JBQWdCLENBQUM7QUFDOUIsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtBQUNqRCxRQUFRLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDeEYsUUFBUSxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsV0FBVyxDQUFDO0FBQ3pDLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUM3QixRQUFRLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsS0FBSztBQUNMLENBQUM7QUFDTSxNQUFNLHNCQUFzQixDQUFDO0FBQ3BDLElBQUksT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO0FBQ3JELFFBQVEsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsNENBQTRDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMvRixRQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDL0IsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2pDLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUM3QixRQUFRLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsS0FBSztBQUNMOztBQ2pDQSxJQUFJQSxXQUFTLEdBQUcsQ0FBQ0MsU0FBSSxJQUFJQSxTQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQ3pGLElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUNuRyxRQUFRLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUN0RyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUN0SCxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RSxLQUFLLENBQUMsQ0FBQztBQUNQLENBQUMs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LElBQUksU0FBUyxHQUFHLENBQUNDLFNBQUksSUFBSUEsU0FBSSxDQUFDLFNBQVMsS0FBSyxVQUFVLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUN6RixJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7QUFDdEcsUUFBUSxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7QUFDdEgsUUFBUSxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUUsS0FBSyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFFRixNQUFNLE1BQU0sQ0FBQztBQUNiLElBQUksV0FBVyxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsR0FBRyxnREFBZ0QsRUFBRSxPQUFPLEdBQUcsb0NBQW9DLEVBQUUsWUFBWSxHQUFHLDRDQUE0QyxFQUFFLGdCQUFnQixHQUFHLDZDQUE2QyxFQUFFLGFBQWEsR0FBRyw0Q0FBNEMsRUFBRTtBQUMzVSxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQy9CLFFBQVEsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBQ2pELFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDL0IsUUFBUSxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUN6QyxRQUFRLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztBQUNqRCxRQUFRLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBQzNDLFFBQVEsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztBQUMxQyxRQUFRLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxTQUFTLENBQUM7QUFDN0MsUUFBUSxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxDQUFDLDJCQUEyQixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7QUFDakUsUUFBUSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztBQUN4RCxRQUFRLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0FBQzlELFFBQVEsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7QUFDN0QsUUFBUSxJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztBQUNoRSxLQUFLO0FBQ0wsSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFO0FBQ3RCLFFBQVEsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLEtBQUssRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFO0FBQ2xGLFlBQVksSUFBSTtBQUNoQixnQkFBZ0IsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5RSxnQkFBZ0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFnQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDbEMsb0JBQW9CLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMzQyx3QkFBd0IsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQy9ELHFCQUFxQjtBQUNyQix5QkFBeUI7QUFDekIsd0JBQXdCLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMvRCxxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7QUFDekQsb0JBQW9CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLENBQUM7QUFDdEQsb0JBQW9CLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN6RCxvQkFBb0IsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7QUFDekUsaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQ3pELG9CQUFvQixNQUFNLEVBQUUsTUFBTTtBQUNsQyxvQkFBb0IsTUFBTSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNO0FBQy9ELG9CQUFvQixPQUFPLEVBQUU7QUFDN0Isd0JBQXdCLGNBQWMsRUFBRSxrQkFBa0I7QUFDMUQscUJBQXFCO0FBQ3JCLG9CQUFvQixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUM7QUFDekQsaUJBQWlCLENBQUMsQ0FBQztBQUNuQixnQkFBZ0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtBQUMxRCxvQkFBb0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEUsb0JBQW9CLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7QUFDekQsb0JBQW9CLE9BQU8sSUFBSSxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDNUQsaUJBQWlCO0FBQ2pCLGdCQUFnQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoRSxnQkFBZ0IsT0FBTyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0RixhQUFhO0FBQ2IsWUFBWSxPQUFPLEdBQUcsRUFBRTtBQUN4QixnQkFBZ0IsSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO0FBQzFDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO0FBQ25ELHdCQUF3QixPQUFPLElBQUksZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELHFCQUFxQjtBQUNyQixvQkFBb0IsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2hFLGlCQUFpQjtBQUNqQixnQkFBZ0IsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDL0QsYUFBYTtBQUNiLG9CQUFvQjtBQUNwQixnQkFBZ0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztBQUNsRCxhQUFhO0FBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWCxLQUFLO0FBQ0wsSUFBSSxXQUFXLENBQUMsRUFBRSxFQUFFO0FBQ3BCLFFBQVEsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLGFBQWE7QUFDNUQsWUFBWSxJQUFJO0FBQ2hCLGdCQUFnQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNyRSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2xDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDM0Msd0JBQXdCLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMvRCxxQkFBcUI7QUFDckIseUJBQXlCO0FBQ3pCLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDL0QscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQixnQkFBZ0IsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEtBQUssU0FBUyxFQUFFO0FBQzVELG9CQUFvQixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUNqRCxvQkFBb0IsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVELG9CQUFvQixJQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztBQUM1RSxpQkFBaUI7QUFDakIsZ0JBQWdCLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQ3BELG9CQUFvQixNQUFNLEVBQUUsS0FBSztBQUNqQyxvQkFBb0IsTUFBTSxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNO0FBQ2xFLG9CQUFvQixPQUFPLEVBQUU7QUFDN0Isd0JBQXdCLGNBQWMsRUFBRSxrQkFBa0I7QUFDMUQscUJBQXFCO0FBQ3JCLGlCQUFpQixDQUFDLENBQUM7QUFDbkIsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO0FBQ3JELG9CQUFvQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0Qsb0JBQW9CLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUMxQyxvQkFBb0IsT0FBTyxJQUFJLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzVELGlCQUFpQjtBQUNqQixnQkFBZ0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzNELGdCQUFnQixPQUFPLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BGLGFBQWE7QUFDYixZQUFZLE9BQU8sR0FBRyxFQUFFO0FBQ3hCLGdCQUFnQixJQUFJLEdBQUcsWUFBWSxLQUFLLEVBQUU7QUFDMUMsb0JBQW9CLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25FLGlCQUFpQjtBQUNqQixnQkFBZ0IsT0FBTyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUNsRSxhQUFhO0FBQ2Isb0JBQW9CO0FBQ3BCLGdCQUFnQixJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztBQUM3QyxhQUFhO0FBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWCxLQUFLO0FBQ0wsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFO0FBQzFCLFFBQVEsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLEtBQUssRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFO0FBQ2xGLFlBQVksSUFBSTtBQUNoQixnQkFBZ0IsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM5RSxnQkFBZ0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDM0UsZ0JBQWdCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNsQyxvQkFBb0IsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzNDLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDL0QscUJBQXFCO0FBQ3JCLHlCQUF5QjtBQUN6Qix3QkFBd0IsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQy9ELHFCQUFxQjtBQUNyQixpQkFBaUI7QUFDakIsZ0JBQWdCLElBQUksSUFBSSxDQUFDLG9CQUFvQixLQUFLLFNBQVMsRUFBRTtBQUM3RCxvQkFBb0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztBQUMxRCxvQkFBb0IsSUFBSSxDQUFDLDJCQUEyQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzdELG9CQUFvQixJQUFJLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztBQUM3RSxpQkFBaUI7QUFDakIsZ0JBQWdCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUU7QUFDN0Qsb0JBQW9CLE1BQU0sRUFBRSxNQUFNO0FBQ2xDLG9CQUFvQixNQUFNLEVBQUUsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU07QUFDbkUsb0JBQW9CLE9BQU8sRUFBRTtBQUM3Qix3QkFBd0IsY0FBYyxFQUFFLGtCQUFrQjtBQUMxRCxxQkFBcUI7QUFDckIsb0JBQW9CLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztBQUN6RCxpQkFBaUIsQ0FBQyxDQUFDO0FBQ25CLGdCQUFnQixJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO0FBQzlELG9CQUFvQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN4RSxvQkFBb0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUN6RCxvQkFBb0IsT0FBTyxJQUFJLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2hFLGlCQUFpQjtBQUNqQixnQkFBZ0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEUsZ0JBQWdCLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM5RixhQUFhO0FBQ2IsWUFBWSxPQUFPLEdBQUcsRUFBRTtBQUN4QixnQkFBZ0IsSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO0FBQzFDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO0FBQ25ELHdCQUF3QixPQUFPLElBQUksbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDM0QscUJBQXFCO0FBQ3JCLG9CQUFvQixPQUFPLElBQUksa0JBQWtCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwRSxpQkFBaUI7QUFDakIsZ0JBQWdCLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDbkUsYUFBYTtBQUNiLG9CQUFvQjtBQUNwQixnQkFBZ0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztBQUN0RCxhQUFhO0FBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWCxLQUFLO0FBQ0wsSUFBSSxHQUFHLENBQUMsRUFBRSxFQUFFO0FBQ1osUUFBUSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsYUFBYTtBQUM1RCxZQUFZLElBQUk7QUFDaEIsZ0JBQWdCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM1RCxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2xDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDM0Msd0JBQXdCLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMvRCxxQkFBcUI7QUFDckIseUJBQXlCO0FBQ3pCLHdCQUF3QixHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDL0QscUJBQXFCO0FBQ3JCLGlCQUFpQjtBQUNqQixnQkFBZ0IsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRTtBQUNwRCxvQkFBb0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7QUFDakQsb0JBQW9CLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwRCxvQkFBb0IsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7QUFDcEUsaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsRUFBRTtBQUNwRCxvQkFBb0IsTUFBTSxFQUFFLEtBQUs7QUFDakMsb0JBQW9CLE1BQU0sRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTTtBQUMxRCxvQkFBb0IsT0FBTyxFQUFFO0FBQzdCLHdCQUF3QixjQUFjLEVBQUUsa0JBQWtCO0FBQzFELHFCQUFxQjtBQUNyQixpQkFBaUIsQ0FBQyxDQUFDO0FBQ25CLGdCQUFnQixJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtBQUNyRCxvQkFBb0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQy9ELG9CQUFvQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDekMsb0JBQW9CLE9BQU8sSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDbkQsaUJBQWlCO0FBQ2pCLGdCQUFnQixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0QsZ0JBQWdCLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVFLGFBQWE7QUFDYixZQUFZLE9BQU8sR0FBRyxFQUFFO0FBQ3hCLGdCQUFnQixJQUFJLEdBQUcsWUFBWSxLQUFLLEVBQUU7QUFDMUMsb0JBQW9CLE9BQU8sSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzRCxpQkFBaUI7QUFDakIsZ0JBQWdCLE9BQU8sSUFBSSxTQUFTLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQzFELGFBQWE7QUFDYixvQkFBb0I7QUFDcEIsZ0JBQWdCLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO0FBQzdDLGFBQWE7QUFDYixTQUFTLENBQUMsQ0FBQztBQUNYLEtBQUs7QUFDTCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbkIsUUFBUSxPQUFPLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsYUFBYTtBQUM1RCxZQUFZLElBQUk7QUFDaEIsZ0JBQWdCLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLENBQUMsK0JBQStCLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7QUFDL0gsZ0JBQWdCLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7QUFDN0Msb0JBQW9CLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZELG9CQUFvQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDM0Msb0JBQW9CLE9BQU8sSUFBSSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDdEQsaUJBQWlCO0FBQ2pCLGdCQUFnQixNQUFNLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNuRCxnQkFBZ0IsT0FBTyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyRSxhQUFhO0FBQ2IsWUFBWSxPQUFPLEdBQUcsRUFBRTtBQUN4QixnQkFBZ0IsSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO0FBQzFDLG9CQUFvQixPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUQsaUJBQWlCO0FBQ2pCLGdCQUFnQixPQUFPLElBQUksVUFBVSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUMzRCxhQUFhO0FBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWCxLQUFLO0FBQ0wsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ3RCLFFBQVEsT0FBTyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLElBQUksRUFBRSxPQUFPLEdBQUcsRUFBRSxFQUFFO0FBQ2pGLFlBQVksSUFBSTtBQUNoQixnQkFBZ0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RFLGdCQUFnQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDbEMsb0JBQW9CLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMzQyx3QkFBd0IsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQy9ELHFCQUFxQjtBQUNyQix5QkFBeUI7QUFDekIsd0JBQXdCLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMvRCxxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxTQUFTLEVBQUU7QUFDMUQsb0JBQW9CLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7QUFDdkQsb0JBQW9CLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMxRCxvQkFBb0IsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7QUFDMUUsaUJBQWlCO0FBQ2pCLGdCQUFnQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQzFELG9CQUFvQixNQUFNLEVBQUUsTUFBTTtBQUNsQyxvQkFBb0IsTUFBTSxFQUFFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNO0FBQ25FLG9CQUFvQixPQUFPLEVBQUU7QUFDN0Isd0JBQXdCLGNBQWMsRUFBRSxrQkFBa0I7QUFDMUQscUJBQXFCO0FBQ3JCLG9CQUFvQixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDakQsaUJBQWlCLENBQUMsQ0FBQztBQUNuQixnQkFBZ0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtBQUMzRCxvQkFBb0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckUsb0JBQW9CLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQztBQUN6QyxvQkFBb0IsT0FBTyxJQUFJLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pELGlCQUFpQjtBQUNqQixnQkFBZ0IsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakUsZ0JBQWdCLE9BQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEYsYUFBYTtBQUNiLFlBQVksT0FBTyxHQUFHLEVBQUU7QUFDeEIsZ0JBQWdCLElBQUksR0FBRyxZQUFZLEtBQUssRUFBRTtBQUMxQyxvQkFBb0IsSUFBSSxHQUFHLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTtBQUNuRCx3QkFBd0IsT0FBTyxJQUFJLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELHFCQUFxQjtBQUNyQixvQkFBb0IsT0FBTyxJQUFJLGVBQWUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ2pFLGlCQUFpQjtBQUNqQixnQkFBZ0IsT0FBTyxJQUFJLGVBQWUsQ0FBQyxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDaEUsYUFBYTtBQUNiLG9CQUFvQjtBQUNwQixnQkFBZ0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztBQUNuRCxhQUFhO0FBQ2IsU0FBUyxDQUFDLENBQUM7QUFDWCxLQUFLO0FBQ0w7O0FDdFJPLE1BQU0sWUFBWSxDQUFDO0FBQzFCLElBQUksV0FBVyxDQUFDLFlBQVksR0FBRyxFQUFFLEVBQUU7QUFDbkMsUUFBUSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMxQyxLQUFLO0FBQ0w7O0FDSmUsTUFBTSxlQUFlLENBQUM7QUFDckMsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUNoQyxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQy9CLFFBQVEsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO0FBQ3ZCLFlBQVksTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDakMsU0FBUztBQUNULFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN4RCxLQUFLO0FBQ0w7O0FDTEEsTUFBTSxlQUFlLENBQUM7QUFDdEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxZQUFZLEVBQUU7QUFDN0IsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUMxQyxLQUFLO0FBQ0wsQ0FBQztBQUNELGVBQWUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLFNBQVMsWUFBWSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQ25ELElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtBQUNiLFFBQVEsT0FBTztBQUNmLEtBQUs7QUFDTCxJQUFJLE1BQU0sVUFBVSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzVDLElBQUksSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM5QyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDbEIsUUFBUSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3QyxLQUFLO0FBQ0wsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2xCLFFBQVEsT0FBTztBQUNmLEtBQUs7QUFDTCxJQUFJLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsb0JBQW9CLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2hHLElBQUksTUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3BFLElBQUksSUFBSSxVQUFVLENBQUMsOEJBQThCLEVBQUU7QUFDbkQsUUFBUSxZQUFZLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0FBQzlDLFFBQVEsWUFBWSxDQUFDLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0FBQ2pFLFFBQVEsWUFBWSxDQUFDLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0FBQ2pFLFFBQVEsWUFBWSxDQUFDLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0FBQ2pFLFFBQVEsWUFBWSxDQUFDLG1CQUFtQixHQUFHLHFCQUFxQixDQUFDO0FBQ2pFLFFBQVEsWUFBWSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDdkMsUUFBUSxZQUFZLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUN2QyxRQUFRLFlBQVksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3ZDLFFBQVEsWUFBWSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDdkMsUUFBUSxZQUFZLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUNuRCxRQUFRLFlBQVksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3ZDLFFBQVEsWUFBWSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDekMsUUFBUSxZQUFZLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztBQUMzQyxRQUFRLFlBQVksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0FBQzNDLFFBQVEsWUFBWSxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFDN0MsUUFBUSxZQUFZLENBQUMsZUFBZSxHQUFHLGlCQUFpQixDQUFDO0FBQ3pELFFBQVEsWUFBWSxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFDckQsUUFBUSxZQUFZLENBQUMsbUJBQW1CLEdBQUcscUJBQXFCLENBQUM7QUFDakUsUUFBUSxZQUFZLENBQUMsaUJBQWlCLEdBQUcsbUJBQW1CLENBQUM7QUFDN0QsUUFBUSxZQUFZLENBQUMsWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUNuRCxRQUFRLFlBQVksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0FBQzNDLFFBQVEsWUFBWSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7QUFDM0MsUUFBUSxZQUFZLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQztBQUNqRCxLQUFLO0FBQ0wsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFO0FBQzNDLFFBQVEsWUFBWSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztBQUM5QyxLQUFLO0FBQ0wsSUFBSSxNQUFNLEtBQUssR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUNuRCxJQUFJLE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNuRSxJQUFJLE1BQU0sWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzFGLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3pCLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN0QyxDQUFDO0FBQ00sU0FBUyxPQUFPLEdBQUc7QUFDMUIsSUFBSSxLQUFLLE1BQU0sUUFBUSxJQUFJLGVBQWUsQ0FBQyxTQUFTLEVBQUU7QUFDdEQsUUFBUSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDM0IsS0FBSztBQUNMLElBQUksZUFBZSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDbkM7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzMsNF19
