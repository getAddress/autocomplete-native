import { AutocompleteFilter } from "getaddress-api";
interface IOutputFields {
    formatted_address_0?: string;
    formatted_address_1?: string;
    formatted_address_2?: string;
    formatted_address_3?: string;
    formatted_address_4?: string;
    line_1?: string;
    line_2?: string;
    line_3?: string;
    line_4?: string;
    town_or_city?: string;
    county?: string;
    country?: string;
    postcode?: string;
    latitude?: string;
    longitude?: string;
    building_number?: string;
    building_name?: string;
    sub_building_number?: string;
    sub_building_name?: string;
    thoroughfare?: string;
    locality?: string;
    district?: string;
    residential?: string;
}
interface IOptions {
    id_prefix?: string;
    css_prefix?: string;
    delay?: number;
    minimum_characters?: number;
    clear_list_on_select?: boolean;
    select_on_focus?: boolean;
    alt_autocomplete_url?: string;
    alt_get_url?: string;
    suggestion_count?: number;
    filter?: AutocompleteFilter;
    bind_output_fields?: boolean;
    output_fields?: IOutputFields;
    input_focus_on_select?: boolean;
    debug?: boolean;
    enable_get?: boolean;
    set_default_output_field_names?: boolean;
}
declare function autocomplete(id: string, api_key: string, options?: IOptions): void;
declare function destroy(): void;
export { autocomplete, destroy };
