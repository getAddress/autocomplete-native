import { AutocompleteFilter } from "getaddress-api";
import { OutputFields } from "./OutputFields";
export declare class Options {
    id_prefix?: string;
    output_fields?: Partial<OutputFields>;
    delay: number;
    minimum_characters: number;
    clear_list_on_select: boolean;
    select_on_focus: boolean;
    alt_autocomplete_url?: string;
    alt_get_url?: string;
    suggestion_count: number;
    filter?: AutocompleteFilter;
    bind_output_fields: boolean;
    input_focus_on_select: boolean;
    debug: boolean;
    enable_get: boolean;
    set_default_output_field_names: boolean;
    constructor(options?: Partial<Options>);
}
