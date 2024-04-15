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

    exports.autocomplete = autocomplete;
    exports.destroy = destroy;

    return exports;

})({});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtbmF0aXZlLTEuMS4wLmpzIiwic291cmNlcyI6WyIuLi9saWIvRXZlbnRzLmpzIiwiLi4vbGliL0F1dG9jb21wbGV0ZS5qcyIsIi4uL2xpYi9PcHRpb25zLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2dldGFkZHJlc3MtYXBpL2xpYi9UeXBlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9nZXRhZGRyZXNzLWFwaS9saWIvSW5kZXguanMiLCIuLi9saWIvT3V0cHV0RmllbGRzLmpzIiwiLi4vbGliL0F0dHJpYnV0ZVZhbHVlcy5qcyIsIi4uL2xpYi9JbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgQWRkcmVzc1NlbGVjdGVkRXZlbnQge1xuICAgIHN0YXRpYyBkaXNwYXRjaChlbGVtZW50LCBpZCwgYWRkcmVzcykge1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgRXZlbnQoXCJnZXRhZGRyZXNzLWF1dG9jb21wbGV0ZS1hZGRyZXNzLXNlbGVjdGVkXCIsIHsgYnViYmxlczogdHJ1ZSB9KTtcbiAgICAgICAgZXZ0W1wiYWRkcmVzc1wiXSA9IGFkZHJlc3M7XG4gICAgICAgIGV2dFtcImlkXCJdID0gaWQ7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBBZGRyZXNzU2VsZWN0ZWRGYWlsZWRFdmVudCB7XG4gICAgc3RhdGljIGRpc3BhdGNoKGVsZW1lbnQsIGlkLCBzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZXZ0ID0gbmV3IEV2ZW50KFwiZ2V0YWRkcmVzcy1hdXRvY29tcGxldGUtYWRkcmVzcy1zZWxlY3RlZC1mYWlsZWRcIiwgeyBidWJibGVzOiB0cnVlIH0pO1xuICAgICAgICBldnRbXCJzdGF0dXNcIl0gPSBzdGF0dXM7XG4gICAgICAgIGV2dFtcIm1lc3NhZ2VcIl0gPSBtZXNzYWdlO1xuICAgICAgICBldnRbXCJpZFwiXSA9IGlkO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU3VnZ2VzdGlvbnNFdmVudCB7XG4gICAgc3RhdGljIGRpc3BhdGNoKGVsZW1lbnQsIHF1ZXJ5LCBzdWdnZXN0aW9ucykge1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgRXZlbnQoXCJnZXRhZGRyZXNzLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9uc1wiLCB7IGJ1YmJsZXM6IHRydWUgfSk7XG4gICAgICAgIGV2dFtcInN1Z2dlc3Rpb25zXCJdID0gc3VnZ2VzdGlvbnM7XG4gICAgICAgIGV2dFtcInF1ZXJ5XCJdID0gcXVlcnk7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldnQpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBTdWdnZXN0aW9uc0ZhaWxlZEV2ZW50IHtcbiAgICBzdGF0aWMgZGlzcGF0Y2goZWxlbWVudCwgcXVlcnksIHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBjb25zdCBldnQgPSBuZXcgRXZlbnQoXCJnZXRhZGRyZXNzLWF1dG9jb21wbGV0ZS1zdWdnZXN0aW9ucy1mYWlsZWRcIiwgeyBidWJibGVzOiB0cnVlIH0pO1xuICAgICAgICBldnRbXCJzdGF0dXNcIl0gPSBzdGF0dXM7XG4gICAgICAgIGV2dFtcIm1lc3NhZ2VcIl0gPSBtZXNzYWdlO1xuICAgICAgICBldnRbXCJxdWVyeVwiXSA9IHF1ZXJ5O1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1FdmVudHMuanMubWFwIiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5pbXBvcnQgeyBBZGRyZXNzU2VsZWN0ZWRFdmVudCwgQWRkcmVzc1NlbGVjdGVkRmFpbGVkRXZlbnQsIFN1Z2dlc3Rpb25zRXZlbnQsIFN1Z2dlc3Rpb25zRmFpbGVkRXZlbnQgfSBmcm9tIFwiLi9FdmVudHNcIjtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1dG9jb21wbGV0ZSB7XG4gICAgY29uc3RydWN0b3IoaW5wdXQsIGNsaWVudCwgb3V0cHV0X2ZpZWxkcywgYXR0cmlidXRlVmFsdWVzKSB7XG4gICAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5jbGllbnQgPSBjbGllbnQ7XG4gICAgICAgIHRoaXMub3V0cHV0X2ZpZWxkcyA9IG91dHB1dF9maWVsZHM7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlVmFsdWVzID0gYXR0cmlidXRlVmFsdWVzO1xuICAgICAgICB0aGlzLm9uSW5wdXRGb2N1cyA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLnNlbGVjdF9vbl9mb2N1cykge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuc2VsZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25JbnB1dFBhc3RlID0gKCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMucG9wdWxhdGVMaXN0KCk7IH0sIDEwMCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25JbnB1dCA9IChlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5saXN0ICYmIChlIGluc3RhbmNlb2YgSW5wdXRFdmVudCA9PSBmYWxzZSkgJiYgZS50YXJnZXQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXQgPSBlLnRhcmdldDtcbiAgICAgICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMubGlzdC5xdWVyeVNlbGVjdG9yQWxsKFwib3B0aW9uXCIpKVxuICAgICAgICAgICAgICAgICAgICAuZXZlcnkoKG8pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8uaW5uZXJUZXh0ID09PSBpbnB1dC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVTdWdnZXN0aW9uU2VsZWN0ZWQobyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub25LZXlVcCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kZWJ1ZyhldmVudCk7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUtleVVwKGV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vbktleURvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGVidWcoZXZlbnQpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duRGVmYXVsdChldmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGVidWcgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZGVidWcpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVDb21wb25lbnRCbHVyID0gKGZvcmNlID0gZmFsc2UpID0+IHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmJsdXJUaW1lcik7XG4gICAgICAgICAgICBjb25zdCBkZWxheSA9IGZvcmNlID8gMCA6IDEwMDtcbiAgICAgICAgICAgIHRoaXMuYmx1clRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVTdWdnZXN0aW9uU2VsZWN0ZWQgPSAoc3VnZ2VzdGlvbikgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmVuYWJsZV9nZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFyTGlzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnB1dC52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLmNsZWFyX2xpc3Rfb25fc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gc3VnZ2VzdGlvbi5kYXRhc2V0LmlkO1xuICAgICAgICAgICAgICAgIGlmIChpZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhZGRyZXNzUmVzdWx0ID0geWllbGQgdGhpcy5jbGllbnQuZ2V0KGlkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFkZHJlc3NSZXN1bHQuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc3VjY2VzcyA9IGFkZHJlc3NSZXN1bHQudG9TdWNjZXNzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJpbmQoc3VjY2Vzcy5hZGRyZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIEFkZHJlc3NTZWxlY3RlZEV2ZW50LmRpc3BhdGNoKHRoaXMuaW5wdXQsIGlkLCBzdWNjZXNzLmFkZHJlc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuaW5wdXRfZm9jdXNfb25fc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dC5mb2N1cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UodGhpcy5pbnB1dC52YWx1ZS5sZW5ndGgsIHRoaXMuaW5wdXQudmFsdWUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWlsZWQgPSBhZGRyZXNzUmVzdWx0LnRvRmFpbGVkKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBBZGRyZXNzU2VsZWN0ZWRGYWlsZWRFdmVudC5kaXNwYXRjaCh0aGlzLmlucHV0LCBpZCwgZmFpbGVkLnN0YXR1cywgZmFpbGVkLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5iaW5kID0gKGFkZHJlc3MpID0+IHtcbiAgICAgICAgICAgIGlmIChhZGRyZXNzICYmIHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuYmluZF9vdXRwdXRfZmllbGRzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuYnVpbGRpbmdfbmFtZSwgYWRkcmVzcy5idWlsZGluZ19uYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5idWlsZGluZ19udW1iZXIsIGFkZHJlc3MuYnVpbGRpbmdfbnVtYmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5sYXRpdHVkZSwgYWRkcmVzcy5sYXRpdHVkZS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5sb25naXR1ZGUsIGFkZHJlc3MubG9uZ2l0dWRlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfMSwgYWRkcmVzcy5saW5lXzEpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfMiwgYWRkcmVzcy5saW5lXzIpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfMywgYWRkcmVzcy5saW5lXzMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmxpbmVfNCwgYWRkcmVzcy5saW5lXzQpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmNvdW50cnksIGFkZHJlc3MuY291bnRyeSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuY291bnR5LCBhZGRyZXNzLmNvdW50eSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMCwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1swXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMSwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1sxXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMiwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1syXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfMywgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1szXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuZm9ybWF0dGVkX2FkZHJlc3NfNCwgYWRkcmVzcy5mb3JtYXR0ZWRfYWRkcmVzc1s0XSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMudG93bl9vcl9jaXR5LCBhZGRyZXNzLnRvd25fb3JfY2l0eSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMubG9jYWxpdHksIGFkZHJlc3MubG9jYWxpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQodGhpcy5vdXRwdXRfZmllbGRzLmRpc3RyaWN0LCBhZGRyZXNzLmRpc3RyaWN0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5yZXNpZGVudGlhbCwgYWRkcmVzcy5yZXNpZGVudGlhbC50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5zdWJfYnVpbGRpbmdfbmFtZSwgYWRkcmVzcy5zdWJfYnVpbGRpbmdfbmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPdXRwdXRmaWVsZCh0aGlzLm91dHB1dF9maWVsZHMuc3ViX2J1aWxkaW5nX251bWJlciwgYWRkcmVzcy5zdWJfYnVpbGRpbmdfbnVtYmVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy50aG9yb3VnaGZhcmUsIGFkZHJlc3MudGhvcm91Z2hmYXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldE91dHB1dGZpZWxkKHRoaXMub3V0cHV0X2ZpZWxkcy5wb3N0Y29kZSwgYWRkcmVzcy5wb3N0Y29kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2V0T3V0cHV0ZmllbGQgPSAoZmllbGROYW1lLCBmaWVsZFZhbHVlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpZWxkTmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZmllbGROYW1lKTtcbiAgICAgICAgICAgIGlmICghZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGZpZWxkTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gZmllbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duRGVmYXVsdCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgbGV0IGlzUHJpbnRhYmxlS2V5ID0gZXZlbnQua2V5ICYmIChldmVudC5rZXkubGVuZ3RoID09PSAxIHx8IGV2ZW50LmtleSA9PT0gJ1VuaWRlbnRpZmllZCcpO1xuICAgICAgICAgICAgaWYgKGlzUHJpbnRhYmxlS2V5KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZmlsdGVyVGltZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5wdXQudmFsdWUubGVuZ3RoID49IHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMubWluaW11bV9jaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlTGlzdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZGVsYXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZUtleVVwID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ0JhY2tzcGFjZScgfHwgZXZlbnQuY29kZSA9PT0gJ0RlbGV0ZScpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0ID09IHRoaXMuaW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlucHV0LnZhbHVlLmxlbmd0aCA8IHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMubWluaW11bV9jaGFyYWN0ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucG9wdWxhdGVMaXN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucG9wdWxhdGVMaXN0ID0gKCkgPT4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgY29uc3QgYXV0b2NvbXBsZXRlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICBhbGw6IHRydWUsXG4gICAgICAgICAgICAgICAgdG9wOiB0aGlzLmF0dHJpYnV0ZVZhbHVlcy5vcHRpb25zLnN1Z2dlc3Rpb25fY291bnQsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6IFwie2Zvcm1hdHRlZF9hZGRyZXNzfXtwb3N0Y29kZSwsIH17cG9zdGNvZGV9XCJcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAodGhpcy5hdHRyaWJ1dGVWYWx1ZXMub3B0aW9ucy5maWx0ZXIpIHtcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVPcHRpb25zLmZpbHRlciA9IHRoaXMuYXR0cmlidXRlVmFsdWVzLm9wdGlvbnMuZmlsdGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSAoX2EgPSB0aGlzLmlucHV0LnZhbHVlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudHJpbSgpO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0geWllbGQgdGhpcy5jbGllbnQuYXV0b2NvbXBsZXRlKHF1ZXJ5LCBhdXRvY29tcGxldGVPcHRpb25zKTtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuaXNTdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VjY2VzcyA9IHJlc3VsdC50b1N1Y2Nlc3MoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdJdGVtcyA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpc3QgJiYgc3VjY2Vzcy5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdWNjZXNzLnN1Z2dlc3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsaSA9IHRoaXMuZ2V0TGlzdEl0ZW0oc3VjY2Vzcy5zdWdnZXN0aW9uc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdJdGVtcy5wdXNoKGxpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3QucmVwbGFjZUNoaWxkcmVuKC4uLm5ld0l0ZW1zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFN1Z2dlc3Rpb25zRXZlbnQuZGlzcGF0Y2godGhpcy5pbnB1dCwgcXVlcnksIHN1Y2Nlc3Muc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gcmVzdWx0LnRvRmFpbGVkKCk7XG4gICAgICAgICAgICAgICAgU3VnZ2VzdGlvbnNGYWlsZWRFdmVudC5kaXNwYXRjaCh0aGlzLmlucHV0LCBxdWVyeSwgZmFpbGVkLnN0YXR1cywgZmFpbGVkLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbGVhckxpc3QgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5saXN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5saXN0LnJlcGxhY2VDaGlsZHJlbiguLi5bXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2V0TGlzdEl0ZW0gPSAoc3VnZ2VzdGlvbikgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnT1BUSU9OJyk7XG4gICAgICAgICAgICBsZXQgYWRkcmVzcyA9IHN1Z2dlc3Rpb24uYWRkcmVzcztcbiAgICAgICAgICAgIG9wdGlvbi5pbm5lclRleHQgPSBhZGRyZXNzO1xuICAgICAgICAgICAgb3B0aW9uLmRhdGFzZXQuaWQgPSBzdWdnZXN0aW9uLmlkO1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbjtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kZXN0cm95SW5wdXQoKTtcbiAgICAgICAgdGhpcy5kZXN0cm95TGlzdCgpO1xuICAgIH1cbiAgICBkZXN0cm95TGlzdCgpIHtcbiAgICAgICAgaWYgKHRoaXMubGlzdCkge1xuICAgICAgICAgICAgdGhpcy5saXN0LnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGRlc3Ryb3lJbnB1dCgpIHtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVBdHRyaWJ1dGUoJ2xpc3QnKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMub25JbnB1dEZvY3VzKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdwYXN0ZScsIHRoaXMub25JbnB1dFBhc3RlKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24pO1xuICAgICAgICB0aGlzLmlucHV0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwKTtcbiAgICAgICAgdGhpcy5pbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMub25JbnB1dCk7XG4gICAgfVxuICAgIGJ1aWxkKCkge1xuICAgICAgICB0aGlzLmlucHV0LnNldEF0dHJpYnV0ZSgnbGlzdCcsIGAke3RoaXMuYXR0cmlidXRlVmFsdWVzLmxpc3RJZH1gKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMub25JbnB1dEZvY3VzKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdwYXN0ZScsIHRoaXMub25JbnB1dFBhc3RlKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24pO1xuICAgICAgICB0aGlzLmlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5vbktleVVwKTtcbiAgICAgICAgdGhpcy5pbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIHRoaXMub25JbnB1dCk7XG4gICAgICAgIHRoaXMubGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0RBVEFMSVNUJyk7XG4gICAgICAgIHRoaXMubGlzdC5pZCA9IHRoaXMuYXR0cmlidXRlVmFsdWVzLmxpc3RJZDtcbiAgICAgICAgdGhpcy5pbnB1dC5pbnNlcnRBZGphY2VudEVsZW1lbnQoXCJhZnRlcmVuZFwiLCB0aGlzLmxpc3QpO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUF1dG9jb21wbGV0ZS5qcy5tYXAiLCJleHBvcnQgY2xhc3MgT3B0aW9ucyB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMuaWRfcHJlZml4ID0gXCJnZXRBZGRyZXNzLWF1dG9jb21wbGV0ZS1uYXRpdmVcIjtcbiAgICAgICAgdGhpcy5vdXRwdXRfZmllbGRzID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRlbGF5ID0gMjAwO1xuICAgICAgICB0aGlzLm1pbmltdW1fY2hhcmFjdGVycyA9IDI7XG4gICAgICAgIHRoaXMuY2xlYXJfbGlzdF9vbl9zZWxlY3QgPSB0cnVlO1xuICAgICAgICB0aGlzLnNlbGVjdF9vbl9mb2N1cyA9IHRydWU7XG4gICAgICAgIHRoaXMuYWx0X2F1dG9jb21wbGV0ZV91cmwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuYWx0X2dldF91cmwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbl9jb3VudCA9IDY7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmJpbmRfb3V0cHV0X2ZpZWxkcyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW5wdXRfZm9jdXNfb25fc2VsZWN0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZWJ1ZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVuYWJsZV9nZXQgPSB0cnVlO1xuICAgICAgICB0aGlzLnNldF9kZWZhdWx0X291dHB1dF9maWVsZF9uYW1lcyA9IHRydWU7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgb3B0aW9ucyk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9T3B0aW9ucy5qcy5tYXAiLCJleHBvcnQgY2xhc3MgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3Rvcihpc1N1Y2Nlc3MpIHtcbiAgICAgICAgdGhpcy5pc1N1Y2Nlc3MgPSBpc1N1Y2Nlc3M7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFN1Y2Nlc3MgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcih0cnVlKTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXV0b2NvbXBsZXRlU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGlkIG5vdCBmYWlsJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIExvY2F0aW9uU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBzdWdnZXN0aW9ucztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRGlkIG5vdCBmYWlsJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEdldFN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3RvcihhZGRyZXNzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWRkcmVzcyA9IGFkZHJlc3M7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHZXRMb2NhdGlvblN1Y2Nlc3MgZXh0ZW5kcyBTdWNjZXNzIHtcbiAgICBjb25zdHJ1Y3Rvcihsb2NhdGlvbikge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxvY2F0aW9uID0gbG9jYXRpb247XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RpZCBub3QgZmFpbCcpO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBHZXRMb2NhdGlvbkZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgQXV0b2NvbXBsZXRlRmFpbGVkIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhIHN1Y2Nlc3MnKTtcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBMb2NhdGlvbkZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgYSBzdWNjZXNzJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgR2V0RmFpbGVkIGV4dGVuZHMgUmVzdWx0IHtcbiAgICBjb25zdHJ1Y3RvcihzdGF0dXMsIG1lc3NhZ2UpIHtcbiAgICAgICAgc3VwZXIoZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXR1cyA9IHN0YXR1cztcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhIHN1Y2Nlc3MnKTtcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbmV4cG9ydCBjbGFzcyBGaW5kU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKGFkZHJlc3Nlcykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFkZHJlc3NlcyA9IGFkZHJlc3NlcztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIEZpbmRGYWlsZWQgZXh0ZW5kcyBSZXN1bHQge1xuICAgIGNvbnN0cnVjdG9yKHN0YXR1cywgbWVzc2FnZSkge1xuICAgICAgICBzdXBlcihmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICAgICAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgIH1cbiAgICB0b1N1Y2Nlc3MoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxuICAgIHRvRmFpbGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgVHlwZWFoZWFkU3VjY2VzcyBleHRlbmRzIFN1Y2Nlc3Mge1xuICAgIGNvbnN0cnVjdG9yKHJlc3VsdHMpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5yZXN1bHRzID0gcmVzdWx0cztcbiAgICB9XG4gICAgdG9TdWNjZXNzKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkJyk7XG4gICAgfVxufVxuZXhwb3J0IGNsYXNzIFR5cGVhaGVhZEZhaWxlZCBleHRlbmRzIFJlc3VsdCB7XG4gICAgY29uc3RydWN0b3Ioc3RhdHVzLCBtZXNzYWdlKSB7XG4gICAgICAgIHN1cGVyKGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XG4gICAgICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gICAgfVxuICAgIHRvU3VjY2VzcygpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQnKTtcbiAgICB9XG4gICAgdG9GYWlsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuaW1wb3J0IHsgR2V0RmFpbGVkLCBSZXN1bHQsIEF1dG9jb21wbGV0ZVN1Y2Nlc3MsIEdldFN1Y2Nlc3MsIEF1dG9jb21wbGV0ZUZhaWxlZCwgRmluZFN1Y2Nlc3MsIEZpbmRGYWlsZWQsIFR5cGVhaGVhZFN1Y2Nlc3MsIFR5cGVhaGVhZEZhaWxlZCwgTG9jYXRpb25TdWNjZXNzLCBMb2NhdGlvbkZhaWxlZCwgR2V0TG9jYXRpb25TdWNjZXNzLCBHZXRMb2NhdGlvbkZhaWxlZCB9IGZyb20gJy4vVHlwZXMnO1xuY2xhc3MgQ2xpZW50IHtcbiAgICBjb25zdHJ1Y3RvcihhcGlfa2V5LCBhdXRvY29tcGxldGVfdXJsID0gJ2h0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vYXV0b2NvbXBsZXRlL3txdWVyeX0nLCBnZXRfdXJsID0gJ2h0dHBzOi8vYXBpLmdldGFkZHJlc3MuaW8vZ2V0L3tpZH0nLCBsb2NhdGlvbl91cmwgPSAnaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby9sb2NhdGlvbi97cXVlcnl9JywgZ2V0X2xvY2F0aW9uX3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL2dldC1sb2NhdGlvbi97aWR9JywgdHlwZWFoZWFkX3VybCA9ICdodHRwczovL2FwaS5nZXRhZGRyZXNzLmlvL3R5cGVhaGVhZC97dGVybX0nKSB7XG4gICAgICAgIHRoaXMuYXBpX2tleSA9IGFwaV9rZXk7XG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlX3VybCA9IGF1dG9jb21wbGV0ZV91cmw7XG4gICAgICAgIHRoaXMuZ2V0X3VybCA9IGdldF91cmw7XG4gICAgICAgIHRoaXMubG9jYXRpb25fdXJsID0gbG9jYXRpb25fdXJsO1xuICAgICAgICB0aGlzLmdldF9sb2NhdGlvbl91cmwgPSBnZXRfbG9jYXRpb25fdXJsO1xuICAgICAgICB0aGlzLnR5cGVhaGVhZF91cmwgPSB0eXBlYWhlYWRfdXJsO1xuICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxvY2F0aW9uUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZ2V0TG9jYXRpb25SZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hdXRvY29tcGxldGVBYm9ydENvbnRyb2xsZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICAgIHRoaXMuZ2V0QWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICB0aGlzLnR5cGVhaGVhZEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICB9XG4gICAgbG9jYXRpb24ocXVlcnlfMSkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIGFyZ3VtZW50cywgdm9pZCAwLCBmdW5jdGlvbiogKHF1ZXJ5LCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tYmluZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IGFsbDogdHJ1ZSB9LCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gdGhpcy5sb2NhdGlvbl91cmwucmVwbGFjZSgve3F1ZXJ5fS9pLCBxdWVyeSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25SZXNwb25zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYXRpb25SZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxvY2F0aW9uUmVzcG9uc2UgPSB5aWVsZCBmZXRjaCh1cmwsIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbDogdGhpcy5sb2NhdGlvbkFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGNvbWJpbmVkT3B0aW9ucyksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25SZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5sb2NhdGlvblJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VnZ2VzdGlvbnMgPSBqc29uLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uU3VjY2VzcyhzdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmxvY2F0aW9uUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTG9jYXRpb25GYWlsZWQodGhpcy5sb2NhdGlvblJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTG9jYXRpb25TdWNjZXNzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uRmFpbGVkKDQwMSwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IExvY2F0aW9uRmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NhdGlvblJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0TG9jYXRpb24oaWQpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuZ2V0X2xvY2F0aW9uX3VybC5yZXBsYWNlKC97aWR9L2ksIGlkKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hcGlfa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoJz8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZhcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9P2FwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRMb2NhdGlvblJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldExvY2F0aW9uQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0geWllbGQgZmV0Y2godXJsLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbDogdGhpcy5nZXRMb2NhdGlvbkFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuZ2V0UmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsb2FjdGlvbiA9IGpzb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25TdWNjZXNzKGxvYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuZ2V0UmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25GYWlsZWQodGhpcy5nZXRSZXNwb25zZS5zdGF0dXMsIGpzb24uTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25GYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0TG9jYXRpb25GYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXV0b2NvbXBsZXRlKHF1ZXJ5XzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qIChxdWVyeSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbWJpbmVkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBhbGw6IHRydWUgfSwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMuYXV0b2NvbXBsZXRlX3VybC5yZXBsYWNlKC97cXVlcnl9L2ksIHF1ZXJ5KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hcGlfa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoJz8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfSZhcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cmwgPSBgJHt1cmx9P2FwaS1rZXk9JHt0aGlzLmFwaV9rZXl9YDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdXRvY29tcGxldGVSZXNwb25zZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0geWllbGQgZmV0Y2godXJsLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMuYXV0b2NvbXBsZXRlQWJvcnRDb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoY29tYmluZWRPcHRpb25zKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hdXRvY29tcGxldGVSZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5hdXRvY29tcGxldGVSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Z2dlc3Rpb25zID0ganNvbi5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVTdWNjZXNzKHN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQXV0b2NvbXBsZXRlRmFpbGVkKHRoaXMuYXV0b2NvbXBsZXRlUmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVTdWNjZXNzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEF1dG9jb21wbGV0ZUZhaWxlZCg0MDEsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBdXRvY29tcGxldGVGYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0KGlkKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGxldCB1cmwgPSB0aGlzLmdldF91cmwucmVwbGFjZSgve2lkfS9pLCBpZCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0UmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgICAgICAgICBzaWduYWw6IHRoaXMuZ2V0QWJvcnRDb250cm9sbGVyLnNpZ25hbCxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRSZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBqc29uID0geWllbGQgdGhpcy5nZXRSZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBqc29uO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldFN1Y2Nlc3MoYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLmdldFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdldEZhaWxlZCh0aGlzLmdldFJlc3BvbnNlLnN0YXR1cywganNvbi5NZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHZXRGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2V0RmFpbGVkKDQwMSwgJ1VuYXV0aG9yaXNlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNwb25zZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGZpbmQocG9zdGNvZGUpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB5aWVsZCBmZXRjaChgaHR0cHM6Ly9hcGkuZ2V0YWRkcmVzcy5pby9maW5kLyR7cG9zdGNvZGV9P2FwaS1rZXk9JHt0aGlzLmFwaV9rZXl9JmV4cGFuZD10cnVlYCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCByZXNwb25zZS5qc29uKCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3NlcyA9IGpzb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmluZFN1Y2Nlc3MoYWRkcmVzc2VzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRGYWlsZWQocmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZpbmRGYWlsZWQoNDAxLCBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmluZEZhaWxlZCg0MDEsICdVbmF1dGhvcmlzZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHR5cGVhaGVhZCh0ZXJtXzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24qICh0ZXJtLCBvcHRpb25zID0ge30pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHVybCA9IHRoaXMudHlwZWFoZWFkX3VybC5yZXBsYWNlKC97dGVybX0vaSwgdGVybSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXBpX2tleSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCc/JykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IGAke3VybH0mYXBpLWtleT0ke3RoaXMuYXBpX2tleX1gO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsID0gYCR7dXJsfT9hcGkta2V5PSR7dGhpcy5hcGlfa2V5fWA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudHlwZWFoZWFkUmVzcG9uc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZEFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZEFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50eXBlYWhlYWRSZXNwb25zZSA9IHlpZWxkIGZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgICAgICAgICAgc2lnbmFsOiB0aGlzLmF1dG9jb21wbGV0ZUFib3J0Q29udHJvbGxlci5zaWduYWwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGpzb24gPSB5aWVsZCB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGpzb247XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkU3VjY2VzcyhyZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QganNvbiA9IHlpZWxkIHRoaXMudHlwZWFoZWFkUmVzcG9uc2UuanNvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVHlwZWFoZWFkRmFpbGVkKHRoaXMudHlwZWFoZWFkUmVzcG9uc2Uuc3RhdHVzLCBqc29uLk1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyLm5hbWUgPT09ICdBYm9ydEVycm9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUeXBlYWhlYWRTdWNjZXNzKFtdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFR5cGVhaGVhZEZhaWxlZCg0MDEsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUeXBlYWhlYWRGYWlsZWQoNDAxLCAnVW5hdXRob3Jpc2VkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLnR5cGVhaGVhZFJlc3BvbnNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgZGVmYXVsdCBDbGllbnQ7XG5leHBvcnQgeyBDbGllbnQsIEdldEZhaWxlZCwgR2V0TG9jYXRpb25GYWlsZWQsIFJlc3VsdCwgQXV0b2NvbXBsZXRlU3VjY2VzcywgTG9jYXRpb25TdWNjZXNzLCBHZXRTdWNjZXNzLCBHZXRMb2NhdGlvblN1Y2Nlc3MsIEF1dG9jb21wbGV0ZUZhaWxlZCwgTG9jYXRpb25GYWlsZWQsIEZpbmRTdWNjZXNzLCBGaW5kRmFpbGVkLCBUeXBlYWhlYWRGYWlsZWQsIFR5cGVhaGVhZFN1Y2Nlc3MsIH07XG4iLCJleHBvcnQgY2xhc3MgT3V0cHV0RmllbGRzIHtcbiAgICBjb25zdHJ1Y3RvcihvdXRwdXRGaWVsZHMgPSB7fSkge1xuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIG91dHB1dEZpZWxkcyk7XG4gICAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9T3V0cHV0RmllbGRzLmpzLm1hcCIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEF0dHJpYnV0ZVZhbHVlcyB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucywgaW5kZXgpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgbGV0IHN1ZmZpeCA9IFwiXCI7XG4gICAgICAgIGlmIChpbmRleCA+IDApIHtcbiAgICAgICAgICAgIHN1ZmZpeCA9IGAtJHtpbmRleH1gO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaWRfcHJlZml4ID0gb3B0aW9ucy5pZF9wcmVmaXg7XG4gICAgICAgIHRoaXMubGlzdElkID0gYCR7dGhpcy5pZF9wcmVmaXh9LWxpc3Qke3N1ZmZpeH1gO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUF0dHJpYnV0ZVZhbHVlcy5qcy5tYXAiLCJpbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gXCIuL0F1dG9jb21wbGV0ZVwiO1xuaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gXCIuL09wdGlvbnNcIjtcbmltcG9ydCBDbGllbnQgZnJvbSAnZ2V0YWRkcmVzcy1hcGknO1xuaW1wb3J0IHsgT3V0cHV0RmllbGRzIH0gZnJvbSBcIi4vT3V0cHV0RmllbGRzXCI7XG5pbXBvcnQgQXR0cmlidXRlVmFsdWVzIGZyb20gXCIuL0F0dHJpYnV0ZVZhbHVlc1wiO1xuY2xhc3MgSW5zdGFuY2VDb3VudGVyIHtcbiAgICBzdGF0aWMgYWRkKGF1dG9jb21wbGV0ZSkge1xuICAgICAgICB0aGlzLmluc3RhbmNlcy5wdXNoKGF1dG9jb21wbGV0ZSk7XG4gICAgfVxufVxuSW5zdGFuY2VDb3VudGVyLmluc3RhbmNlcyA9IFtdO1xuZXhwb3J0IGZ1bmN0aW9uIGF1dG9jb21wbGV0ZShpZCwgYXBpX2tleSwgb3B0aW9ucykge1xuICAgIGlmICghaWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBhbGxPcHRpb25zID0gbmV3IE9wdGlvbnMob3B0aW9ucyk7XG4gICAgbGV0IHRleHRib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgaWYgKCF0ZXh0Ym94KSB7XG4gICAgICAgIHRleHRib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKTtcbiAgICB9XG4gICAgaWYgKCF0ZXh0Ym94KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudChhcGlfa2V5LCBhbGxPcHRpb25zLmFsdF9hdXRvY29tcGxldGVfdXJsLCBhbGxPcHRpb25zLmFsdF9nZXRfdXJsKTtcbiAgICBjb25zdCBvdXRwdXRGaWVsZHMgPSBuZXcgT3V0cHV0RmllbGRzKGFsbE9wdGlvbnMub3V0cHV0X2ZpZWxkcyk7XG4gICAgaWYgKGFsbE9wdGlvbnMuc2V0X2RlZmF1bHRfb3V0cHV0X2ZpZWxkX25hbWVzKSB7XG4gICAgICAgIG91dHB1dEZpZWxkcy5mb3JtYXR0ZWRfYWRkcmVzc18wID0gXCJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzEgPSBcImZvcm1hdHRlZF9hZGRyZXNzXzFcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzIgPSBcImZvcm1hdHRlZF9hZGRyZXNzXzJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzMgPSBcImZvcm1hdHRlZF9hZGRyZXNzXzNcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzQgPSBcImZvcm1hdHRlZF9hZGRyZXNzXzRcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxpbmVfMSA9IFwibGluZV8xXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5saW5lXzIgPSBcImxpbmVfMlwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMubGluZV8zID0gXCJsaW5lXzNcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmxpbmVfNCA9IFwibGluZV80XCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy50b3duX29yX2NpdHkgPSBcInRvd25fb3JfY2l0eVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuY291bnR5ID0gXCJjb3VudHlcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmNvdW50cnkgPSBcImNvdW50cnlcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnBvc3Rjb2RlID0gXCJwb3N0Y29kZVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMubGF0aXR1ZGUgPSBcImxhdGl0dWRlXCI7XG4gICAgICAgIG91dHB1dEZpZWxkcy5sb25naXR1ZGUgPSBcImxvbmdpdHVkZVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMuYnVpbGRpbmdfbnVtYmVyID0gXCJidWlsZGluZ19udW1iZXJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmJ1aWxkaW5nX25hbWUgPSBcImJ1aWxkaW5nX25hbWVcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnN1Yl9idWlsZGluZ19udW1iZXIgPSBcInN1Yl9idWlsZGluZ19udW1iZXJcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLnN1Yl9idWlsZGluZ19uYW1lID0gXCJzdWJfYnVpbGRpbmdfbmFtZVwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMudGhvcm91Z2hmYXJlID0gJ3Rob3JvdWdoZmFyZSc7XG4gICAgICAgIG91dHB1dEZpZWxkcy5sb2NhbGl0eSA9IFwibG9jYWxpdHlcIjtcbiAgICAgICAgb3V0cHV0RmllbGRzLmRpc3RyaWN0ID0gXCJkaXN0cmljdFwiO1xuICAgICAgICBvdXRwdXRGaWVsZHMucmVzaWRlbnRpYWwgPSBcInJlc2lkZW50aWFsXCI7XG4gICAgfVxuICAgIGlmICghb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzApIHtcbiAgICAgICAgb3V0cHV0RmllbGRzLmZvcm1hdHRlZF9hZGRyZXNzXzAgPSBpZDtcbiAgICB9XG4gICAgY29uc3QgaW5kZXggPSBJbnN0YW5jZUNvdW50ZXIuaW5zdGFuY2VzLmxlbmd0aDtcbiAgICBjb25zdCBhdHRyaWJ1dGVWYWx1ZXMgPSBuZXcgQXR0cmlidXRlVmFsdWVzKGFsbE9wdGlvbnMsIGluZGV4KTtcbiAgICBjb25zdCBhdXRvY29tcGxldGUgPSBuZXcgQXV0b2NvbXBsZXRlKHRleHRib3gsIGNsaWVudCwgb3V0cHV0RmllbGRzLCBhdHRyaWJ1dGVWYWx1ZXMpO1xuICAgIGF1dG9jb21wbGV0ZS5idWlsZCgpO1xuICAgIEluc3RhbmNlQ291bnRlci5hZGQoYXV0b2NvbXBsZXRlKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgIGZvciAoY29uc3QgaW5zdGFuY2Ugb2YgSW5zdGFuY2VDb3VudGVyLmluc3RhbmNlcykge1xuICAgICAgICBpbnN0YW5jZS5kZXN0cm95KCk7XG4gICAgfVxuICAgIEluc3RhbmNlQ291bnRlci5pbnN0YW5jZXMgPSBbXTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUluZGV4LmpzLm1hcCJdLCJuYW1lcyI6WyJfX2F3YWl0ZXIiLCJ0aGlzIl0sIm1hcHBpbmdzIjoiOzs7SUFBTyxNQUFNLG9CQUFvQixDQUFDO0lBQ2xDLElBQUksT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7SUFDMUMsUUFBUSxNQUFNLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQywwQ0FBMEMsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzdGLFFBQVEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztJQUNqQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDdkIsUUFBUSxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLEtBQUs7SUFDTCxDQUFDO0lBQ00sTUFBTSwwQkFBMEIsQ0FBQztJQUN4QyxJQUFJLE9BQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtJQUNsRCxRQUFRLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLGlEQUFpRCxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDcEcsUUFBUSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQy9CLFFBQVEsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztJQUNq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SkEsSUFBSSxTQUFTLEdBQUcsQ0FBQ0MsU0FBSSxJQUFJQSxTQUFJLENBQUMsU0FBUyxLQUFLLFVBQVUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0lBQ3pGLElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0lBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0lBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUNuRyxRQUFRLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUN0RyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtJQUN0SCxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFD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YyxDQUFDO0lBQ25ELFFBQVEsWUFBWSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUM7SUFDdkMsUUFBUSxZQUFZLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztJQUN6QyxRQUFRLFlBQVksQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0lBQzNDLFFBQVEsWUFBWSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7SUFDM0MsUUFBUSxZQUFZLENBQUMsU0FBUyxHQUFHLFdBQVcsQ0FBQztJQUM3QyxRQUFRLFlBQVksQ0FBQyxlQUFlLEdBQUcsaUJBQWlCLENBQUM7SUFDekQsUUFBUSxZQUFZLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQztJQUNyRCxRQUFRLFlBQVksQ0FBQyxtQkFBbUIsR0FBRyxxQkFBcUIsQ0FBQztJQUNqRSxRQUFRLFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQztJQUM3RCxRQUFRLFlBQVksQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDO0lBQ25ELFFBQVEsWUFBWSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7SUFDM0MsUUFBUSxZQUFZLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztJQUMzQyxRQUFRLFlBQVksQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFDO0lBQ2pELEtBQUs7SUFDTCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLEVBQUU7SUFDM0MsUUFBUSxZQUFZLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBQzlDLEtBQUs7SUFDTCxJQUFJLE1BQU0sS0FBSyxHQUFHLGVBQWUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQ25ELElBQUksTUFBTSxlQUFlLEdBQUcsSUFBSSxlQUFlLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25FLElBQUksTUFBTSxZQUFZLEdBQUcsSUFBSSxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDMUYsSUFBSSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDekIsSUFBSSxlQUFlLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFDTSxTQUFTLE9BQU8sR0FBRztJQUMxQixJQUFJLEtBQUssTUFBTSxRQUFRLElBQUksZUFBZSxDQUFDLFNBQVMsRUFBRTtJQUN0RCxRQUFRLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzQixLQUFLO0lBQ0wsSUFBSSxlQUFlLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNuQzs7Ozs7Ozs7Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzMsNF19
