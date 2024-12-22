export class Options {
    constructor(options = {}) {
        this.id_prefix = "getAddress-autocomplete-native";
        this.delay = 200;
        this.minimum_characters = 2;
        this.clear_list_on_select = true;
        this.select_on_focus = true;
        this.alt_autocomplete_url = undefined;
        this.alt_get_url = undefined;
        this.suggestion_count = 6;
        this.filter = undefined;
        this.input_focus_on_select = true;
        this.debug = false;
        this.enable_get = true;
        this.full_screen_on_mobile = true;
        this.max_mobile_screen_width = 500;
        this.full_screen_options = undefined;
        this.show_postcode = false;
        Object.assign(this, options);
    }
}
//# sourceMappingURL=Options.js.map