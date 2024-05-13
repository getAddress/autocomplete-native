import Autocomplete from "./Autocomplete";
import { Options } from "./Options";
import Client from 'getaddress-api';
import { OutputFields } from "./OutputFields";
import AttributeValues from "./AttributeValues";
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
export { autocomplete, destroy, Options };
//# sourceMappingURL=Index.js.map