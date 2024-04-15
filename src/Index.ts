import Autocomplete from "./Autocomplete";
import { Options } from "./Options";
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

export function autocomplete(id:string,api_key:string, options?: Partial<Options>)
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
    
    const outputFields = new OutputFields(allOptions.output_fields);

    if(allOptions.set_default_output_field_names)
    {
        outputFields.formatted_address_0= outputFields.formatted_address_0??"";
        outputFields.formatted_address_1=outputFields.formatted_address_1??"formatted_address_1";
        outputFields.formatted_address_2=outputFields.formatted_address_2??"formatted_address_2";
        outputFields.formatted_address_3=outputFields.formatted_address_3??"formatted_address_3";
        outputFields.formatted_address_4=outputFields.formatted_address_4??"formatted_address_4";
        outputFields.line_1= outputFields.line_1??"line_1";
        outputFields.line_2=  outputFields.line_2??"line_2";
        outputFields.line_3= outputFields.line_3??"line_3";
        outputFields.line_4 =  outputFields.line_4??"line_4";
        outputFields.town_or_city=   outputFields.town_or_city??"town_or_city";
        outputFields.county=  outputFields.county??"county";
        outputFields.country= outputFields.country??"country";
        outputFields.postcode=  outputFields.postcode??"postcode";
        outputFields.latitude= outputFields.latitude??"latitude";
        outputFields.longitude= outputFields.longitude??"longitude";
        outputFields.building_number=   outputFields.building_number??"building_number";
        outputFields.building_name= outputFields.building_name??"building_name";
        outputFields.sub_building_number= outputFields.sub_building_number??"sub_building_number";
        outputFields.sub_building_name=   outputFields.sub_building_name??"sub_building_name";
        outputFields.thoroughfare= outputFields.thoroughfare??'thoroughfare'; 
        outputFields.locality = outputFields.locality??"locality";
        outputFields.district = outputFields.district ?? "district";
        outputFields.residential = outputFields.residential ??"residential";
    }

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