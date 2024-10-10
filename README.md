Javascript - Native Autocomplete.

## Install

###  From NPM
```
npm install getaddress-autocomplete-native
```
### Or CDN
```
<script src="https://cdn.getaddress.io/scripts/getaddress-autocomplete-native-2.0.1.min.js"></script>
```

## Usage
```

  <label>Address Line 1</label>
  <div><input id="line1" type="text"></div>

  <label>Address Line 2</label>
  <div><input id="line2" type="text"></div>

  <label>Address Line 3</label>
  <div><input id="line3" type="text"></div>

  <label>Address Line 4</label>
  <div><input id="line4" type="text"></div>

  <label>Address Line 5</label>
  <div><input id="line5" type="text"></div>

  <label>Postcode</label>
  <div><input id="postcode" type="text"></div>
  
  <script>
    const autocomplete = getAddress.autocomplete("line1","API Key");
    
    autocomplete.addEventListener("getaddress-autocomplete-address-selected", function(e){
      document.getElementById('line1').value = e.address.formatted_address[0];
      document.getElementById('line2').value = e.address.formatted_address[1];
      document.getElementById('line3').value = e.address.formatted_address[2];
      document.getElementById('line4').value = e.address.formatted_address[3];
      document.getElementById('line5').value = e.address.formatted_address[4];
      document.getElementById('postcode').value = e.address.postcode;
    })
  </script>
```
## Options
The full list of options, and their defaults:
```
getAddress.autocomplete(
        'textbox_id',
        'API_KEY',
        /*options*/{
          id_prefix:'getAddress-autocomplete-native' ,  /* The id of the textbox and list container */
          delay:100, /* millisecond delay between keypress and API call */
          minimum_characters:2,  /* minimum characters to initiate an API call */
          select_on_focus:true,  /* if true, highlights textbox characters on focus*/
          alt_autocomplete_url:undefined,  /* alterative local autocomplete URL (when API key is not used) */
          alt_get_url:undefined,  /* alterative local get URL (when API key is not used) */
          suggestion_count:6, /* number of retreived suggestions  */
          filter:undefined, /* the suggestion filter (see Autocomplete API)*/
          input_focus_on_select:true,  /* if true, sets the focus to the textbox after selecting an address*/
          debug:false, /* if true, logs behavior */
          enable_get:true, /* if true, retreives address on select */,
          full_screen_on_mobile:true, /* if true, opens full screen on mobile devices*/;
          max_mobile_screen_width:500, /* max mobile screen width*/;
          full_screen_options:undefined /* full screen display options*/
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
