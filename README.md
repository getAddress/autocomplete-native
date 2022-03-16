Javascript - Native Autocomplete.

## Install

###  From NPM
```
npm install getaddress-autocomplete-native
```
### Or CDN
```
<script src="https://cdn.getaddress.io/scripts/getaddress-autocomplete-native-1.0.1.min.js"></script>
```

## Usage
```
  <input type="text" id="textbox_id" > 
  <br/>

  <label>Formatted_address_0</label>
  <div><input id="formatted_address_0" type="text"></div>

   <label>Formatted_address_1</label>
  <div><input id="formatted_address_1" type="text"></div>

   <label>Formatted_address_2</label>
  <div><input id="formatted_address_2" type="text"></div>

   <label>Formatted_address_3</label>
  <div><input id="formatted_address_3" type="text"></div>

  <label>Formatted_address_4</label>
  <div><input id="formatted_address_4" type="text"></div>

  <label>Postcode</label>
  <div><input id="postcode" type="text"></div>
  
  <script>
    getAddress.autocomplete("textbox_id","API Key");
  </script>
```
## Options
The full list of options, and their defaults:
```
getAddress.autocomplete(
        'textbox_id',
        'API_KEY',
        /*options*/{
          output_fields:{
            formatted_address_0:'formatted_address_0',  /* The id of the element bound to 'formatted_address[0]' */
            formatted_address_1:'formatted_address_1',  /* The id of the element bound to 'formatted_address[1]' */
            formatted_address_2:'formatted_address_2',  /* The id of the element bound to 'formatted_address[2]' */
            formatted_address_3:'formatted_address_3',  /* The id of the element bound to 'formatted_address[3]' */
            formatted_address_4:'formatted_address_4',  /* The id of the element bound to 'formatted_address[4]' */
            line_1:'line_1',  /* The id of the element bound to 'line_1' */
            line_2:'line_2',  /* The id of the element bound to 'line_2' */
            line_3:'line_3',  /* The id of the element bound to 'line_3' */
            line_4:'line_4',  /* The id of the element bound to 'line_4' */
            latitude:'latitude',  /* The id of the element bound to 'latitude' */
            longitude:'longitude',  /* The id of the element bound to 'longitude' */
            building_number:'building_number',  /* The id of the element bound to 'building_number' */
            building_name:'building_name',  /* The id of the element bound to 'building_name' */
            sub_building_number:'sub_building_number',  /* The id of the element bound to 'sub_building_number' */
            sub_building_name:'sub_building_name',  /* The id of the element bound to 'sub_building_name' */
            thoroughfare:'thoroughfare',  /* The id of the element bound to 'thoroughfare' */
            town_or_city:'town_or_city',/* The id of the element bound to 'town_or_city' */
            county:'county',  /* The id of the element bound to 'county' */
            country:'country',  /* The id of the element bound to 'country' */
            district:'district',  /* The id of the element bound to 'district' */
            locality:'locality',  /* The id of the element bound to 'locality' */
            postcode:'postcode',  /* The id of the element bound to 'postcode' */
            residential:'residential'  /* The id of the element bound to 'residential' */
          },
          id_prefix:'getAddress-autocomplete-native' ,  /* The id of the textbox and list container */
          delay:200, /* millisecond delay between keypress and API call */
          minimum_characters:2,  /* minimum characters to initiate an API call */
          select_on_focus:true,  /* if true, highlights textbox characters on focus*/
          alt_autocomplete_url:undefined,  /* alterative local autocomplete URL (when API key is not used) */
          alt_get_url:undefined,  /* alterative local get URL (when API key is not used) */
          suggestion_count:6, /* number of retreived suggestions (max 20) */
          filter:undefined, /* the suggestion filter (see Autocomplete API)*/
          bind_output_fields:true, /* if true, bind the output_fields to the address*/
          input_focus_on_select:true,  /* if true, sets the focus to the textbox after selecting an address*/
          debug:false, /* if true, logs behavior */
          enable_get:true /* if true, retreives address on select */,
          set_default_output_field_names:true /* if true, defaults output field names to JSON field names*/
        }
    );
```
## Events
```
document.addEventListener("getaddress-autocomplete-suggestions", function(e){
    console.log(e.suggestions);
})

document.addEventListener("getaddress-autocomplete-suggestions-failed", function(e){
    console.log(e.status);
    console.log(e.message);
})

document.addEventListener("getaddress-autocomplete-address-selected", function(e){
    console.log(e.address);
})

document.addEventListener("getaddress-autocomplete-find-selected-failed", function(e){
    console.log(e.status);
    console.log(e.message);
})
```
