var getAddress = (function (exports) {
    'use strict';

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

    exports.Options = Options;
    exports.autocomplete = autocomplete;
    exports.destroy = destroy;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtbmF0aXZlLTEuMS4xLmpzIiwic291cmNlcyI6WyIuLi9saWIvRXZlbnRzLmpzIiwiLi4vbGliL0F1dG9jb21wbGV0ZS5qcyIsIi4uL2xpYi9PcHRpb25zLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2dldGFkZHJlc3MtYXBpL2xpYi9UeXBlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9nZXRhZGRyZXNzLWFwaS9saWIvSW5kZXguanMiLCIuLi9saWIvT3V0cHV0RmllbGRzLmpzIiwiLi4vbGliL0F0dHJpYnV0ZVZhbHVlcy5qcyIsIi4uL2xpYi9JbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQWRkcmVzc1NlbGVjdGVkRXZlbnQge1xuICAgIHN0YXRpYyBkaXNwYXRjaChlbGVtZW50LCBpZCwgYWRkcmVzcykge1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgRXZlbnQoXCJnZXRhZGRyZXNzLWF1dG9jb21wbGV0ZS1hZGRyZXNzLXNlbGVjdGVkXCIsIHsgYnViYmxlczogdHJ1ZSB9KTtcbiAgICAgICAgZXZ0W1wiYWRkcmVzc1wiXSA9IGFkZHJlc3M7XG4gICAgICAgIGV2dFtcImlkXCJdID0gaWQ7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBBZGRyZXNzU2VsZWN0ZWRGYWlsZWRFdmVudCB7XG4gICAgc3RhdGljIGRpc3BhdGNoKGVsZW1lbnQsIGlkLCBzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtYWRkcmVzcy1zZWxlY3RlZC1mYWlsZWRcIiwgeyBidWJibGVzOiB0cnVlIH0pO1xuICAgICAgICBldnRbXCJzdGF0dXNcIl0gPSBzdGF0dXM7XG4gICAgICAgIGV2dFtcIm1lc3NhZ2VcIl0gPSBtZXNzYWdlO1xuICAgICAgICBldnRbXCJpZFwiXSA9IGlkO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU3VnZ2VzdGlvbnNFdmVudCB7XG4gICAgc3RhdGljIGRpc3BhdGNoKGVsZW1lbnQsIHF1ZXJ5LCBzdWdnZXN0aW9ucykge1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgRXZlbnQoXCJnZXRhZGRyZXNzLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uc1wiLCB7IGJ1YmJsZXM6IHRydWUgfSk7XG4gICAgICAgIGV2dFtcInN1Z2dlc3Rpb25zXCJdID0gc3VnZ2VzdGlvbnM7XG4gICAgICAgIGV2dFtcInF1ZXJ5XCJdID0gcXVlcnk7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTdWdnZXN0aW9uc0ZhaWxlZEV2ZW50IHtcbiAgICBzdGF0aWMgZGlzcGF0Y2goZWxlbWVudCwgcXVlcnksIHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgRXZlbnQoXCJnZXRhZGRyZXNzLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucy1mYWlsZWRcIiwgeyBidWJibGVzOiB0cnVlIH0pO1xuICAgICAgICBldnRbXCJzdGF0dXNcIl0gPSBzdGF0dXM7XG4gICAgICAgIGV2dFtcIm1lc3NhZ2VcIl0gPSBtZXNzYWdlO1xuICAgICAgICBldnRbXCJxdWVyeVwiXSA9IHF1ZXJ5O1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1FdmVudHMuanMubWFwIiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5pbXBvcnQgeyBBZGRyZXNzU2VsZWN0ZWRFdmVudCwgQWRkcmVzc1NlbGVjdGVkRmFpbGVkRXZlbnQsIFN1Z2dlc3Rpb25zRXZlbnQsIFN1Z2dlc3Rpb25zRmFpbGVkRXZlbnQgfSBmcm9tIFwiLi9FdmVudHNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1dG9jb21wbGV0ZSB7XG4gICAgY29uc3RydWN0b3IoaW5wdXQsIGNsaWVudCwgb3V0cHV0X2ZpZWxkcywgYXR0cmlidXRlVmFsdWVzKSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG4gICAgICAgIHRoaXMub3V0cHV0X2ZpZWxkcyA9IG91dHB1dF9maWVsZHM7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlVmFsdWVzID0gYXR0cmlidXRlVmFsdWVzO1xuICAgICAgICB0aGlzLm9uSW5wdXRGb2N1cyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLnNlbGVjdF9vbl9mb2N1cykge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuc2VsZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25JbnB1dFBhc3RlID0gKCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMucG9wdWxhdGVMaXN0KCk7IH0sIDEwMCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25JbnB1dCA9IChlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5saXN0ICYmIChlIGluc3RhbmNlb2YgSW5wdXRFdmVudCA9PSBmYWxzZSkgJiYgZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBlLnRhcmdldDtcbiAgICAgICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMubGlzdC5xdWVyeVNlbGVjdG9yQWxsKFwib3B0aW9uXCIpKVxuICAgICAgICAgICAgICAgICAgICAuZXZlcnkoKG8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8uaW5uZXJUZXh0ID09PSBpbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWdnZXN0aW9uU2VsZWN0ZWQobyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25LZXlVcCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZyhldmVudCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUtleVVwKGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vbktleURvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duRGVmYXVsdChldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGVidWcgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVDb21wb25lbnRCbHVyID0gKGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmJsdXJUaW1lcik7XG4gICAgICAgICAgICBjb25zdCBkZWxheSA9IGZvcmNlID8gMCA6IDEwMDtcbiAgICAgICAgICAgIHRoaXMuYmx1clRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVTdWdnZXN0aW9uU2VsZWN0ZWQgPSAoc3VnZ2VzdGlvbikgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmVuYWJsZV9nZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTGlzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmNsZWFyX2xpc3Rfb25fc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gc3VnZ2VzdGlvbi5kYXRhc2V0LmlkO1xuICAgICAgICAgICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzUmVzdWx0ID0geWllbGQgdGhpcy5jbGllbnQuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkZHJlc3NSZXN1bHQuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3VjY2VzcyA9IGFkZHJlc3NSZXN1bHQudG9TdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJpbmQoc3VjY2Vzcy5hZGRyZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3NTZWxlY3RlZEV2ZW50LmRpc3BhdGNoKHRoaXMuaW5wdXQsIGlkLCBzdWNjZXNzLmFkZHJlc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuaW5wdXRfZm9jdXNfb25fc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGgsIHRoaXMuaW5wdXQudmFsdWUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWlsZWQgPSBhZGRyZXNzUmVzdWx0LnRvRmFpbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzU2VsZWN0ZWRGYWlsZWRFdmVudC5kaXNwYXRjaCh0aGlzLmlucHV0LCBpZCwgZmFpbGVkLnN0YXR1cywgZmFpbGVkLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5iaW5kID0gKGFkZHJlc3MpID0+IHtcbiAgICAgICAgICAgIGlmIChhZGRyZXNzICYmIHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuYmluZF9vdXRwdXRfZmllbGRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuYnVpbGRpbmdfbmFtZSwgYWRkcmVzcy5idWlsZGluZ19uYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5idWlsZGluZ19udW1iZXIsIGFkZHJlc3MuYnVpbGRpbmdfbnVtYmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5sYXRpdHVkZSwgYWRkcmVzcy5sYXRpdHVkZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5sb25naXR1ZGUsIGFkZHJlc3MubG9uZ2l0dWRlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfMSwgYWRkcmVzcy5saW5lXzEpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfMiwgYWRkcmVzcy5saW5lXzIpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfMywgYWRkcmVzcy5saW5lXzMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfNCwgYWRkcmVzcy5saW5lXzQpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmNvdW50cnksIGFkZHJlc3MuY291bnRyeSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuY291bnR5LCBhZGRyZXNzLmNvdW50eSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMCwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1swXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMSwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1sxXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMiwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1syXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMywgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1szXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfNCwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1s0XSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMudG93bl9vcl9jaXR5LCBhZGRyZXNzLnRvd25fb3JfY2l0eSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMubG9jYWxpdHksIGFkZHJlc3MubG9jYWxpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmRpc3RyaWN0LCBhZGRyZXNzLmRpc3RyaWN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5yZXNpZGVudGlhbCwgYWRkcmVzcy5yZXNpZGVudGlhbC50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5zdWJfYnVpbGRpbmdfbmFtZSwgYWRkcmVzcy5zdWJfYnVpbGRpbmdfbmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuc3ViX2J1aWxkaW5nX251bWJlciwgYWRkcmVzcy5zdWJfYnVpbGRpbmdfbnVtYmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy50aG9yb3VnaGZhcmUsIGFkZHJlc3MudGhvcm91Z2hmYXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5wb3N0Y29kZSwgYWRkcmVzcy5wb3N0Y29kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQgPSAoZmllbGROYW1lLCBmaWVsZFZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpZWxkTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZmllbGROYW1lKTtcbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGZpZWxkTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duRGVmYXVsdCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGlzUHJpbnRhYmxlS2V5ID0gZXZlbnQua2V5ICYmIChldmVudC5rZXkubGVuZ3RoID09PSAxIHx8IGV2ZW50LmtleSA9PT0gJ1VuaWRlbnRpZmllZCcpO1xuICAgICAgICAgICAgaWYgKGlzUHJpbnRhYmxlS2V5KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZmlsdGVyVGltZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5wdXQudmFsdWUubGVuZ3RoID49IHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMubWluaW11bV9jaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZGVsYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZUtleVVwID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ0JhY2tzcGFjZScgfHwgZXZlbnQuY29kZSA9PT0gJ0RlbGV0ZScpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09IHRoaXMuaW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCA8IHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMubWluaW11bV9jaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucG9wdWxhdGVMaXN0ID0gKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgY29uc3QgYXV0b2NvbXBsZXRlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBhbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgdG9wOiB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLnN1Z2dlc3Rpb25fY291bnQsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFwie2Zvcm1hdHRlZF9hZGRyZXNzfXtwb3N0Y29kZSwsIH17cG9zdGNvZGV9XCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5maWx0ZXIpIHtcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVPcHRpb25zLmZpbHRlciA9IHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZmlsdGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSAoX2EgPSB0aGlzLmlucHV0LnZhbHVlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0geWllbGQgdGhpcy5jbGllbnQuYXV0b2NvbXBsZXRlKHF1ZXJ5LCBhdXRvY29tcGxldGVPcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IHJlc3VsdC50b1N1Y2Nlc3MoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpc3QgJiYgc3VjY2Vzcy5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWNjZXNzLnN1Z2dlc3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaSA9IHRoaXMuZ2V0TGlzdEl0ZW0oc3VjY2Vzcy5zdWdnZXN0aW9uc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtcy5wdXNoKGxpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3QucmVwbGFjZUNoaWxkcmVuKC4uLm5ld0l0ZW1zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFN1Z2dlc3Rpb25zRXZlbnQuZGlzcGF0Y2godGhpcy5pbnB1dCwgcXVlcnksIHN1Y2Nlc3Muc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gcmVzdWx0LnRvRmFpbGVkKCk7XG4gICAgICAgICAgICAgICAgU3VnZ2VzdGlvbnNGYWlsZWRFdmVudC5kaXNwYXRjaCh0aGlzLmlucHV0LCBxdWVyeSwgZmFpbGVkLnN0YXR1cywgZmFpbGVkLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbGVhckxpc3QgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5saXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnJlcGxhY2VDaGlsZHJlbiguLi5bXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0TGlzdEl0ZW0gPSAoc3VnZ2VzdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnT1BUSU9OJyk7XG4gICAgICAgICAgICBsZXQgYWRkcmVzcyA9IHN1Z2dlc3Rpb24uYWRkcmVzcztcbiAgICAgICAgICAgIG9wdGlvbi5pbm5lclRleHQgPSBhZGRyZXNzO1xuICAgICAgICAgICAgb3B0aW9uLmRhdGFzZXQuaWQgPSBzdWdnZXN0aW9uLmlkO1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95SW5wdXQoKTtcbiAgICAgICAgdGhpcy5kZXN0cm95TGlzdCgpO1xuICAgIH1cbiAgICBkZXN0cm95TGlzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMubGlzdCkge1xuICAgICAgICAgICAgdGhpcy5saXN0LnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3lJbnB1dCgpIHtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2xpc3QnKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMub25JbnB1dEZvY3VzKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdwYXN0ZScsIHRoaXMub25JbnB1dFBhc3RlKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24pO1xuICAgICAgICB0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMub25JbnB1dCk7XG4gICAgfVxuICAgIGJ1aWxkKCkge1xuICAgICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnbGlzdCcsIGAke3RoaXMuYXR0cmlidXRlVmFsdWVzLmxpc3RJZH1gKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMub25JbnB1dEZvY3VzKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdwYXN0ZScsIHRoaXMub25JbnB1dFBhc3RlKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24pO1xuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMub25JbnB1dCk7XG4gICAgICAgIHRoaXMubGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RBVEFMSVNUJyk7XG4gICAgICAgIHRoaXMubGlzdC5pZCA9IHRoaXMuYXR0cmlidXRlVmFsdWVzLmxpc3RJZDtcbiAgICAgICAgdGhpcy5pbnB1dC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJhZnRlcmVuZFwiLCB0aGlzLmxpc3QpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUF1dG9jb21wbGV0ZS5qcy5tYXAiLCJleHBvcnQgY2xhc3MgT3B0aW9ucyB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuaWRfcHJlZml4ID0gXCJnZXRBZGRyZXNzLWF1dG9jb21wbGV0ZS1uYXRpdmVcIjtcbiAgICAgICAgdGhpcy5vdXRwdXRfZmllbGRzID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRlbGF5ID0gMjAwO1xuICAgICAgICB0aGlzLm1pbmltdW1fY2hhcmFjdGVycyA9IDI7XG4gICAgICAgIHRoaXMuY2xlYXJfbGlzdF9vbl9zZWxlY3QgPSB0cnVlO1xuICAgICAgICB0aGlzLnNlbGVjdF9vbl9mb2N1cyA9IHRydWU7XG4gICAgICAgIHRoaXMuYWx0X2F1dG9jb21wbGV0ZV91cmwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWx0X2dldF91cmwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbl9jb3VudCA9IDY7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmJpbmRfb3V0cHV0X2ZpZWxkcyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW5wdXRfZm9jdXNfb25fc2VsZWN0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVuYWJsZV9nZXQgPSB0cnVlO1xuICAgICAgICB0aGlzLnNldF9kZWZhdWx0X291dHB1dF9maWVsZF9uYW1lcyA9IHRydWU7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9T3B0aW9ucy5qcy5tYXAiLCJleHBvcnQgY2xhc3MgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3Rvcihpc1N1Y2Nlc3MpIHtcbiAgICAgICAgdGhpcy5pc1N1Y2Nlc3MgPSBpc1N1Y2Nlc3M7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFN1Y2Nlc3MgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcih0cnVlKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXV0b2NvbXBsZXRlU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGlkIG5vdCBmYWlsJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGlkIG5vdCBmYWlsJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEdldFN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihhZGRyZXNzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3M7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHZXRMb2NhdGlvblN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3Rvcihsb2NhdGlvbikge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHZXRMb2NhdGlvbkZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXV0b2NvbXBsZXRlRmFpbGVkIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhIHN1Y2Nlc3MnKTtcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBMb2NhdGlvbkZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgR2V0RmFpbGVkIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhIHN1Y2Nlc3MnKTtcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBGaW5kU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKGFkZHJlc3Nlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZHJlc3NlcyA9IGFkZHJlc3NlcztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZpbmRGYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgVHlwZWFoZWFkU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdHMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzdWx0cztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFR5cGVhaGVhZEZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQnKTtcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuaW1wb3J0IHsgR2V0RmFpbGVkLCBSZXN1bHQsIEF1dG9jb21wbGV0ZVN1Y2Nlc3MsIEdldFN1Y2Nlc3MsIEF1dG9jb21wbGV0ZUZhaWxlZCwgRmluZFN1Y2Nlc3MsIEZpbmRGYWlsZWQsIFR5cGVhaGVhZFN1Y2Nlc3MsIFR5cGVhaGVhZEZhaWxlZCwgTG9jYXRpb25TdWNjZXNzLCBMb2NhdGlvbkZhaWxlZCwgR2V0TG9jYXRpb25TdWNjZXNzLCBHZXRMb2NhdGlvbkZhaWxlZCB9IGZyb20gJy4vVHlwZXMnO1xuY2xhc3MgQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3RvcihhcGlfa2V5LCBhdXRvY29tcGxldGVfdXJsID0gJ2h0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vYXV0b2NvbXBsZXRlL3txdWVyeX0nLCBnZXRfdXJsID0gJ2h0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vZ2V0L3tpZH0nLCBsb2NhdGlvbl91cmwgPSAnaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby9sb2NhdGlvbi97cXVlcnl9JywgZ2V0X2xvY2F0aW9uX3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL2dldC1sb2NhdGlvbi97aWR9JywgdHlwZWFoZWFkX3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL3R5cGVhaGVhZC97dGVybX0nKSB7XG4gICAgICAgIHRoaXMuYXBpX2tleSA9IGFwaV9rZXk7XG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlX3VybCA9IGF1dG9jb21wbGV0ZV91cmw7XG4gICAgICAgIHRoaXMuZ2V0X3VybCA9IGdldF91cmw7XG4gICAgICAgIHRoaXMubG9jYXRpb25fdXJsID0gbG9jYXRpb25fdXJsO1xuICAgICAgICB0aGlzLmdldF9sb2NhdGlvbl91cmwgPSBnZXRfbG9jYXRpb25fdXJsO1xuICAgICAgICB0aGlzLnR5cGVhaGVhZF91cmwgPSB0eXBlYWhlYWRfdXJsO1xuICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxvY2F0aW9uUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZ2V0TG9jYXRpb25SZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGVBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIHRoaXMuZ2V0QWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICB0aGlzLnR5cGVhaGVhZEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB9XG4gICAgbG9jYXRpb24ocXVlcnlfMSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIGFyZ3VtZW50cywgdm9pZCAwLCBmdW5jdGlvbiogKHF1ZXJ5LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tYmluZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IGFsbDogdHJ1ZSB9LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5sb2NhdGlvbl91cmwucmVwbGFjZSgve3F1ZXJ5fS9pLCBxdWVyeSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25SZXNwb25zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25SZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUmVzcG9uc2UgPSB5aWVsZCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbDogdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNvbWJpbmVkT3B0aW9ucyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25SZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5sb2NhdGlvblJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSBqc29uLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uU3VjY2VzcyhzdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmxvY2F0aW9uUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTG9jYXRpb25GYWlsZWQodGhpcy5sb2NhdGlvblJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTG9jYXRpb25TdWNjZXNzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uRmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvblJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0TG9jYXRpb24oaWQpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuZ2V0X2xvY2F0aW9uX3VybC5yZXBsYWNlKC97aWR9L2ksIGlkKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hcGlfa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoJz8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZhcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9P2FwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRMb2NhdGlvblJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldExvY2F0aW9uQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0geWllbGQgZmV0Y2godXJsLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbDogdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuZ2V0UmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FjdGlvbiA9IGpzb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25TdWNjZXNzKGxvYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuZ2V0UmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25GYWlsZWQodGhpcy5nZXRSZXNwb25zZS5zdGF0dXMsIGpzb24uTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25GYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25GYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXV0b2NvbXBsZXRlKHF1ZXJ5XzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qIChxdWVyeSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBhbGw6IHRydWUgfSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuYXV0b2NvbXBsZXRlX3VybC5yZXBsYWNlKC97cXVlcnl9L2ksIHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hcGlfa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoJz8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZhcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9P2FwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0geWllbGQgZmV0Y2godXJsLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoY29tYmluZWRPcHRpb25zKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdXRvY29tcGxldGVSZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Z2dlc3Rpb25zID0ganNvbi5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVTdWNjZXNzKHN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlRmFpbGVkKHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVTdWNjZXNzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEF1dG9jb21wbGV0ZUZhaWxlZCg0MDEsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVGYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0KGlkKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmdldF91cmwucmVwbGFjZSgve2lkfS9pLCBpZCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMuZ2V0QWJvcnRDb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRSZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5nZXRSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldFN1Y2Nlc3MoYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmdldFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldEZhaWxlZCh0aGlzLmdldFJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHZXRGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0RmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZpbmQocG9zdGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby9maW5kLyR7cG9zdGNvZGV9P2FwaS1rZXk9JHt0aGlzLmFwaV9rZXl9JmV4cGFuZD10cnVlYCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3NlcyA9IGpzb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmluZFN1Y2Nlc3MoYWRkcmVzc2VzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRGYWlsZWQocmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmluZEZhaWxlZCg0MDEsICdVbmF1dGhvcmlzZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHR5cGVhaGVhZCh0ZXJtXzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qICh0ZXJtLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMudHlwZWFoZWFkX3VybC5yZXBsYWNlKC97dGVybX0vaSwgdGVybSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZWFoZWFkUmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZEFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGpzb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkU3VjY2VzcyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMudHlwZWFoZWFkUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkRmFpbGVkKHRoaXMudHlwZWFoZWFkUmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUeXBlYWhlYWRTdWNjZXNzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFR5cGVhaGVhZEZhaWxlZCg0MDEsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUeXBlYWhlYWRGYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBDbGllbnQ7XG5leHBvcnQgeyBDbGllbnQsIEdldEZhaWxlZCwgR2V0TG9jYXRpb25GYWlsZWQsIFJlc3VsdCwgQXV0b2NvbXBsZXRlU3VjY2VzcywgTG9jYXRpb25TdWNjZXNzLCBHZXRTdWNjZXNzLCBHZXRMb2NhdGlvblN1Y2Nlc3MsIEF1dG9jb21wbGV0ZUZhaWxlZCwgTG9jYXRpb25GYWlsZWQsIEZpbmRTdWNjZXNzLCBGaW5kRmFpbGVkLCBUeXBlYWhlYWRGYWlsZWQsIFR5cGVhaGVhZFN1Y2Nlc3MsIH07XG4iLCJleHBvcnQgY2xhc3MgT3V0cHV0RmllbGRzIHtcbiAgICBjb25zdHJ1Y3RvcihvdXRwdXRGaWVsZHMgPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIG91dHB1dEZpZWxkcyk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9T3V0cHV0RmllbGRzLmpzLm1hcCIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0dHJpYnV0ZVZhbHVlcyB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucywgaW5kZXgpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgbGV0IHN1ZmZpeCA9IFwiXCI7XG4gICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgIHN1ZmZpeCA9IGAtJHtpbmRleH1gO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaWRfcHJlZml4ID0gb3B0aW9ucy5pZF9wcmVmaXg7XG4gICAgICAgIHRoaXMubGlzdElkID0gYCR7dGhpcy5pZF9wcmVmaXh9LWxpc3Qke3N1ZmZpeH1gO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUF0dHJpYnV0ZVZhbHVlcy5qcy5tYXAiLCJpbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gXCIuL0F1dG9jb21wbGV0ZVwiO1xuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gXCIuL09wdGlvbnNcIjtcbmltcG9ydCBDbGllbnQgZnJvbSAnZ2V0YWRkcmVzcy1hcGknO1xuaW1wb3J0IHsgT3V0cHV0RmllbGRzIH0gZnJvbSBcIi4vT3V0cHV0RmllbGRzXCI7XG5pbXBvcnQgQXR0cmlidXRlVmFsdWVzIGZyb20gXCIuL0F0dHJpYnV0ZVZhbHVlc1wiO1xuY2xhc3MgSW5zdGFuY2VDb3VudGVyIHtcbiAgICBzdGF0aWMgYWRkKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICB0aGlzLmluc3RhbmNlcy5wdXNoKGF1dG9jb21wbGV0ZSk7XG4gICAgfVxufVxuSW5zdGFuY2VDb3VudGVyLmluc3RhbmNlcyA9IFtdO1xuZnVuY3Rpb24gYXV0b2NvbXBsZXRlKGlkLCBhcGlfa2V5LCBvcHRpb25zKSB7XG4gICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2YsIF9nLCBfaCwgX2osIF9rLCBfbCwgX20sIF9vLCBfcCwgX3EsIF9yLCBfcywgX3QsIF91LCBfdiwgX3csIF94LCBfeTtcbiAgICBpZiAoIWlkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYWxsT3B0aW9ucyA9IG5ldyBPcHRpb25zKG9wdGlvbnMpO1xuICAgIGxldCB0ZXh0Ym94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIGlmICghdGV4dGJveCkge1xuICAgICAgICB0ZXh0Ym94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCk7XG4gICAgfVxuICAgIGlmICghdGV4dGJveCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQoYXBpX2tleSwgYWxsT3B0aW9ucy5hbHRfYXV0b2NvbXBsZXRlX3VybCwgYWxsT3B0aW9ucy5hbHRfZ2V0X3VybCk7XG4gICAgY29uc3Qgb3V0cHV0RmllbGRzID0gbmV3IE91dHB1dEZpZWxkcyhhbGxPcHRpb25zLm91dHB1dF9maWVsZHMpO1xuICAgIGlmIChhbGxPcHRpb25zLnNldF9kZWZhdWx0X291dHB1dF9maWVsZF9uYW1lcykge1xuICAgICAgICBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMCA9IChfYSA9IG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18wKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBcIlwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMSA9IChfYiA9IG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18xKSAhPT0gbnVsbCAmJiBfYiAhPT0gdm9pZCAwID8gX2IgOiBcImZvcm1hdHRlZF9hZGRyZXNzXzFcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzIgPSAoX2MgPSBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMikgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogXCJmb3JtYXR0ZWRfYWRkcmVzc18yXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18zID0gKF9kID0gb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzMpICE9PSBudWxsICYmIF9kICE9PSB2b2lkIDAgPyBfZCA6IFwiZm9ybWF0dGVkX2FkZHJlc3NfM1wiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfNCA9IChfZSA9IG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc180KSAhPT0gbnVsbCAmJiBfZSAhPT0gdm9pZCAwID8gX2UgOiBcImZvcm1hdHRlZF9hZGRyZXNzXzRcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxpbmVfMSA9IChfZiA9IG91dHB1dEZpZWxkcy5saW5lXzEpICE9PSBudWxsICYmIF9mICE9PSB2b2lkIDAgPyBfZiA6IFwibGluZV8xXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5saW5lXzIgPSAoX2cgPSBvdXRwdXRGaWVsZHMubGluZV8yKSAhPT0gbnVsbCAmJiBfZyAhPT0gdm9pZCAwID8gX2cgOiBcImxpbmVfMlwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMubGluZV8zID0gKF9oID0gb3V0cHV0RmllbGRzLmxpbmVfMykgIT09IG51bGwgJiYgX2ggIT09IHZvaWQgMCA/IF9oIDogXCJsaW5lXzNcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxpbmVfNCA9IChfaiA9IG91dHB1dEZpZWxkcy5saW5lXzQpICE9PSBudWxsICYmIF9qICE9PSB2b2lkIDAgPyBfaiA6IFwibGluZV80XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy50b3duX29yX2NpdHkgPSAoX2sgPSBvdXRwdXRGaWVsZHMudG93bl9vcl9jaXR5KSAhPT0gbnVsbCAmJiBfayAhPT0gdm9pZCAwID8gX2sgOiBcInRvd25fb3JfY2l0eVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuY291bnR5ID0gKF9sID0gb3V0cHV0RmllbGRzLmNvdW50eSkgIT09IG51bGwgJiYgX2wgIT09IHZvaWQgMCA/IF9sIDogXCJjb3VudHlcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmNvdW50cnkgPSAoX20gPSBvdXRwdXRGaWVsZHMuY291bnRyeSkgIT09IG51bGwgJiYgX20gIT09IHZvaWQgMCA/IF9tIDogXCJjb3VudHJ5XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5wb3N0Y29kZSA9IChfbyA9IG91dHB1dEZpZWxkcy5wb3N0Y29kZSkgIT09IG51bGwgJiYgX28gIT09IHZvaWQgMCA/IF9vIDogXCJwb3N0Y29kZVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMubGF0aXR1ZGUgPSAoX3AgPSBvdXRwdXRGaWVsZHMubGF0aXR1ZGUpICE9PSBudWxsICYmIF9wICE9PSB2b2lkIDAgPyBfcCA6IFwibGF0aXR1ZGVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxvbmdpdHVkZSA9IChfcSA9IG91dHB1dEZpZWxkcy5sb25naXR1ZGUpICE9PSBudWxsICYmIF9xICE9PSB2b2lkIDAgPyBfcSA6IFwibG9uZ2l0dWRlXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5idWlsZGluZ19udW1iZXIgPSAoX3IgPSBvdXRwdXRGaWVsZHMuYnVpbGRpbmdfbnVtYmVyKSAhPT0gbnVsbCAmJiBfciAhPT0gdm9pZCAwID8gX3IgOiBcImJ1aWxkaW5nX251bWJlclwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuYnVpbGRpbmdfbmFtZSA9IChfcyA9IG91dHB1dEZpZWxkcy5idWlsZGluZ19uYW1lKSAhPT0gbnVsbCAmJiBfcyAhPT0gdm9pZCAwID8gX3MgOiBcImJ1aWxkaW5nX25hbWVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnN1Yl9idWlsZGluZ19udW1iZXIgPSAoX3QgPSBvdXRwdXRGaWVsZHMuc3ViX2J1aWxkaW5nX251bWJlcikgIT09IG51bGwgJiYgX3QgIT09IHZvaWQgMCA/IF90IDogXCJzdWJfYnVpbGRpbmdfbnVtYmVyXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5zdWJfYnVpbGRpbmdfbmFtZSA9IChfdSA9IG91dHB1dEZpZWxkcy5zdWJfYnVpbGRpbmdfbmFtZSkgIT09IG51bGwgJiYgX3UgIT09IHZvaWQgMCA/IF91IDogXCJzdWJfYnVpbGRpbmdfbmFtZVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMudGhvcm91Z2hmYXJlID0gKF92ID0gb3V0cHV0RmllbGRzLnRob3JvdWdoZmFyZSkgIT09IG51bGwgJiYgX3YgIT09IHZvaWQgMCA/IF92IDogJ3Rob3JvdWdoZmFyZSc7XG4gICAgICAgIG91dHB1dEZpZWxkcy5sb2NhbGl0eSA9IChfdyA9IG91dHB1dEZpZWxkcy5sb2NhbGl0eSkgIT09IG51bGwgJiYgX3cgIT09IHZvaWQgMCA/IF93IDogXCJsb2NhbGl0eVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuZGlzdHJpY3QgPSAoX3ggPSBvdXRwdXRGaWVsZHMuZGlzdHJpY3QpICE9PSBudWxsICYmIF94ICE9PSB2b2lkIDAgPyBfeCA6IFwiZGlzdHJpY3RcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnJlc2lkZW50aWFsID0gKF95ID0gb3V0cHV0RmllbGRzLnJlc2lkZW50aWFsKSAhPT0gbnVsbCAmJiBfeSAhPT0gdm9pZCAwID8gX3kgOiBcInJlc2lkZW50aWFsXCI7XG4gICAgfVxuICAgIGlmICghb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzApIHtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzAgPSBpZDtcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSBJbnN0YW5jZUNvdW50ZXIuaW5zdGFuY2VzLmxlbmd0aDtcbiAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZXMgPSBuZXcgQXR0cmlidXRlVmFsdWVzKGFsbE9wdGlvbnMsIGluZGV4KTtcbiAgICBjb25zdCBhdXRvY29tcGxldGUgPSBuZXcgQXV0b2NvbXBsZXRlKHRleHRib3gsIGNsaWVudCwgb3V0cHV0RmllbGRzLCBhdHRyaWJ1dGVWYWx1ZXMpO1xuICAgIGF1dG9jb21wbGV0ZS5idWlsZCgpO1xuICAgIEluc3RhbmNlQ291bnRlci5hZGQoYXV0b2NvbXBsZXRlKTtcbn1cbmZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgZm9yIChjb25zdCBpbnN0YW5jZSBvZiBJbnN0YW5jZUNvdW50ZXIuaW5zdGFuY2VzKSB7XG4gICAgICAgIGluc3RhbmNlLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgSW5zdGFuY2VDb3VudGVyLmluc3RhbmNlcyA9IFtdO1xufVxuZXhwb3J0IHsgYXV0b2NvbXBsZXRlLCBkZXN0cm95LCBPcHRpb25zIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1JbmRleC5qcy5tYXAiXSwibmFtZXMiOlsiX19hd2FpdGVyIiwidGhpcyJdLCJtYXBwaW5ncyI6Ijs7O0lBQU8sTUFBTSxvQkFBb0IsQ0FBQztJQUNsQyxJQUFJLE9BQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0lBQzFDLFFBQVEsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsMENBQTBDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM3RixRQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDakMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLFFBQVEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQyxLQUFLO0lBQ0wsQ0FBQztJQUNNLE1BQU0sMEJBQTBCLENBQUM7SUFDeEMsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7SUFDbEQsUUFBUSxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxpREFBaUQsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3BHLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUMvQixRQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxPQUFPLENBQUM7SUFDakMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLFFBQVEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNuQyxLQUFLO0lBQ0wsQ0FBQztJQUNNLE1BQU0sZ0JBQWdCLENBQUM7SUFDOUIsSUFBSSxPQUFPLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRTtJQUNqRCxRQUFRLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDeEYsUUFBUSxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsV0FBVyxDQUFDO0lBQ3pDLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUM3QixRQUFRLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsS0FBSztJQUNMLENBQUM7SUFDTSxNQUFNLHNCQUFzQixDQUFDO0lBQ3BDLElBQUksT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO0lBQ3JELFFBQVEsTUFBTSxHQUFHLEdBQUcsSUFBSSxLQUFLLENBQUMsNENBQTRDLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMvRixRQUFRLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDL0IsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsT0FBTyxDQUFDO0lBQ2pDLFFBQVEsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUM3QixRQUFRLE9BQU8sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsS0FBSztJQUNMOztJQ2pDQSxJQUFJQSxXQUFTLEdBQUcsQ0FBQ0MsU0FBSSxJQUFJQSxTQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0lBQ3pGLElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0lBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUNuRyxRQUFRLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUN0RyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtJQUN0SCxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM5RSxLQUFLLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUVhLE1BQU0sWUFBWSxDQUFDO0lBQ2xDLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRTtJQUMvRCxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzNCLFFBQVEsSUFBSSxDQUFDLE1BQU0s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SSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLHFCQUFxQixDQUFDO0lBQzFJLFFBQVEsWUFBWSxDQUFDLG1CQUFtQixHQUFHLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxtQkFBbUIsTUFBTSxJQUFJLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxxQkFBcUIsQ0FBQztJQUMxSSxRQUFRLFlBQVksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsbUJBQW1CLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcscUJBQXFCLENBQUM7SUFDMUksUUFBUSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxNQUFNLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBQ25HLFFBQVEsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsTUFBTSxNQUFNLElBQUksSUFBSSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsQ0FBQztJQUNuRyxRQUFRLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLEdBQUcsWUFBWSxDQUFDLE1BQU0sTUFBTSxJQUFJLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLENBQUM7SUFDbkcsUUFBUSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLFlBQVksQ0FBQyxNQUFNLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxDQUFDO0lBQ25HLFFBQVEsWUFBWSxDQUFDLFlBQVksR0FBRyxDQUFDLEVBQUUsR0FBRyxZQUFZLENBQUMsWUFBWSxNQUFNLElBQUksSUFBSSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLGNB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
