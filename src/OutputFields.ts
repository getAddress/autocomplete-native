export class OutputFields{
    formatted_address_0:string;
    formatted_address_1:string;
    formatted_address_2:string;
    formatted_address_3:string;
    formatted_address_4:string;
    line_1:string;
    line_2:string;
    line_3:string;
    line_4:string;
    town_or_city:string;
    county:string;
    country:string;
    postcode:string;
    latitude:string;
    longitude:string;
    building_number:string;
    building_name:string;
    sub_building_number:string;
    sub_building_name:string;
    thoroughfare:string; 
    locality:string;
    district:string;
    residential:string;

    constructor(outputFields:IOutputFields = {}, setDefaults:boolean)
    {
        if(setDefaults){
            this.setDefaultValues();
        }
        
        for (const prop in outputFields) {
            if (outputFields.hasOwnProperty(prop) && typeof outputFields[prop] !== 'undefined') {
                this[prop] = outputFields[prop];
            }
        }
    }

    private setDefaultValues()
    {
        this.formatted_address_0="";
        this.formatted_address_1="formatted_address_1";
        this.formatted_address_2="formatted_address_2";
        this.formatted_address_3="formatted_address_3";
        this.formatted_address_4="formatted_address_4";
        this.line_1= "line_1";
        this.line_2= "line_2";
        this.line_3= "line_3";
        this.line_4 = "line_4";
        this.town_or_city= "town_or_city";
        this.county= "county";
        this.country= "country";
        this.postcode= "postcode";
        this.latitude= "latitude";
        this.longitude= "longitude";
        this.building_number= "building_number";
        this.building_name= "building_name";
        this.sub_building_number= "sub_building_number";
        this.sub_building_name= "sub_building_name";
        this.thoroughfare= 'thoroughfare'; 
        this.locality = "locality";
        this.district = "district";
        this.residential = "residential";
    }
}
         
export interface IOutputFields{
    formatted_address_0?:string;
    formatted_address_1?:string;
    formatted_address_2?:string;
    formatted_address_3?:string;
    formatted_address_4?:string;
    line_1?:string;
    line_2?:string;
    line_3?:string;
    line_4?:string;
    town_or_city?:string;
    county?:string;
    country?:string;
    postcode?:string;
    latitude?:string;
    longitude?:string;
    building_number?:string;
    building_name?:string;
    sub_building_number?:string;
    sub_building_name?:string;
    thoroughfare?:string;
    locality?:string;
    district?:string;
    residential?:string;
}