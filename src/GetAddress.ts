import Autocomplete from "./Autocomplete";
import { IOptions, Options } from "./Options";
import Client from 'getaddress-api';
import { OutputFields } from "./OutputFields";
import AttributeValues from "./AttributeValues";

class InstanceCounter
{
    public static instances:Autocomplete[] = [];

    static add(autocomplete:Autocomplete){
        this.instances.push(autocomplete);
    }

}

export function autocomplete(id:string,api_key:string, options?: IOptions)
{

    if(!id){
        return;
    }

    const allOptions = new Options(options);

    let textbox = document.getElementById(id) as HTMLInputElement;
    if(!textbox){
        textbox = document.querySelector(id) as HTMLInputElement;
    }
    if(!textbox){
        return;
    }
    
    const client = new Client(api_key, allOptions.alt_autocomplete_url,allOptions.alt_get_url);
    
    const outputFields = new OutputFields(allOptions.output_fields,allOptions.set_default_output_field_names);
    if(!outputFields.formatted_address_0){
        outputFields.formatted_address_0 = id;
    }

    const index = InstanceCounter.instances.length;

    const attributeValues = new AttributeValues(allOptions,index);
    
    const autocomplete = new Autocomplete(textbox,client,outputFields,attributeValues);
    autocomplete.build();
    

    InstanceCounter.add(autocomplete);
}

export function destroy()
{
    for(const instance of InstanceCounter.instances){
        instance.destroy();
    }
    InstanceCounter.instances = [];
}