import { AutocompleteAddress, Suggestion } from "getaddress-api";

export class AddressSelectedEvent 
{
    static dispatch(element:HTMLElement|Document,id:string,address:AutocompleteAddress){
        
        const evt  = new Event("getaddress-autocomplete-address-selected",{bubbles:true});
        evt["address"] = address;
        evt["id"] = id;
        element.dispatchEvent(evt);
    }
}

export class AddressSelectedFailedEvent 
{
    static dispatch(element:HTMLElement|Document,id:string, status:number, message:string){
        
        const evt  = new Event("getaddress-autocomplete-address-selected-failed",{bubbles:true});
        evt["status"] = status;
        evt["message"] = message;
        evt["id"] = id;

        element.dispatchEvent(evt);
    }
}

export class SuggestionsEvent 
{
    static dispatch(element:HTMLElement|Document,query:string,suggestions:Suggestion[]){
        
        const evt  = new Event("getaddress-autocomplete-suggestions",{bubbles:true});
        evt["suggestions"] = suggestions;
        evt["query"] = query;
        element.dispatchEvent(evt);
    }
}

export class SuggestionsFailedEvent 
{
    static dispatch(element:HTMLElement|Document, query:string,status:number, message:string){
        
        const evt  = new Event("getaddress-autocomplete-suggestions-failed",{bubbles:true});
        evt["status"] = status;
        evt["message"] = message;
        evt["query"] = query;
        element.dispatchEvent(evt);
    }
}

