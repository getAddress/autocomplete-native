import {AutocompleteFilter} from "getaddress-api";
import { OutputFields } from "./OutputFields";

export class Options 
{
    id_prefix?:string = "getAddress-autocomplete-native";
     output_fields?:Partial<OutputFields> = undefined;
    delay:number = 200;
    minimum_characters:number = 2; 
    clear_list_on_select = true;
    select_on_focus = true;
    alt_autocomplete_url?:string = undefined;
    alt_get_url?:string = undefined;
    suggestion_count = 6;
    filter?:AutocompleteFilter=undefined;
    bind_output_fields=true;
    input_focus_on_select=true;
    debug=false;
    enable_get=true;
    set_default_output_field_names=true;

    constructor(options: Partial<Options> = {}) {
        Object.assign(this, options);
    }
}


