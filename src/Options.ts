import {AutocompleteFilter} from "getaddress-api";
import { Options as FSoptions } from "getaddress-autocomplete-modal";

export class Options 
{
    id_prefix?:string = "getAddress-autocomplete-native";
    delay:number = 200;
    minimum_characters:number = 2; 
    clear_list_on_select = true;
    select_on_focus = true;
    alt_autocomplete_url?:string = undefined;
    alt_get_url?:string = undefined;
    suggestion_count = 6;
    filter?:AutocompleteFilter=undefined;
    input_focus_on_select=true;
    debug=false;
    enable_get=true;
    full_screen_on_mobile=true;
    max_mobile_screen_width = 500;
    full_screen_options?:Partial<FSoptions>=undefined;
    show_postcode = false;
    
    constructor(options: Partial<Options> = {}) {
        Object.assign(this, options);
    }
}


