import { AutocompleteFilter } from "getaddress-api";
import { Options as FSoptions } from "getaddress-autocomplete-modal";
export declare class Options {
    id_prefix?: string;
    delay: number;
    minimum_characters: number;
    clear_list_on_select: boolean;
    select_on_focus: boolean;
    alt_autocomplete_url?: string;
    alt_get_url?: string;
    suggestion_count: number;
    filter?: AutocompleteFilter;
    input_focus_on_select: boolean;
    debug: boolean;
    enable_get: boolean;
    full_screen_on_mobile: boolean;
    max_mobile_screen_width: number;
    full_screen_options?: Partial<FSoptions>;
    show_postcode: boolean;
    constructor(options?: Partial<Options>);
}
