import AttributeValues from "./AttributeValues";
import Client, { AutocompleteAddress, AutocompleteOptions, Suggestion } from 'getaddress-api';
import { OutputFields } from "./OutputFields";
import { AddressSelectedEvent, AddressSelectedFailedEvent, SuggestionsEvent, SuggestionsFailedEvent } from "./Events";


export default class Autocomplete
{

    private filterTimer: ReturnType<typeof setTimeout>
    private blurTimer: ReturnType<typeof setTimeout>
    private list: HTMLDataListElement;
   

    constructor(readonly input:HTMLInputElement,readonly client:Client,
        readonly output_fields:OutputFields, readonly attributeValues:AttributeValues)
    {
        
    }

    public destroy(){
        this.destroyInput();
        this.destroyList();
    }

    private destroyList()
    {
        this.list.remove();
    }

    

    private destroyInput(){

        this.input.removeAttribute('list');
        this.input.removeEventListener('focus',this.onInputFocus);
        this.input.removeEventListener('paste',this.onInputPaste); 
        this.input.removeEventListener('keydown', this.onKeyDown);
        this.input.removeEventListener('keyup', this.onKeyUp); 
        this.input.removeEventListener('input', this.onInput); 
    }

    private onInputFocus =  () => {
        if(this.attributeValues.options.select_on_focus){
            this.input.select();
        }
    };

    private onInputPaste = () => {
        setTimeout(()=>{this.populateList();},100);
    };

    
    public build()
    {

        this.input.setAttribute('list', `${this.attributeValues.listId}`);
        this.input.addEventListener('focus', this.onInputFocus);
        this.input.addEventListener('paste', this.onInputPaste);
        this.input.addEventListener('keydown', this.onKeyDown);
        this.input.addEventListener('keyup', this.onKeyUp);
        this.input.addEventListener('input', this.onInput);

        this.list = document.createElement('DATALIST') as HTMLDataListElement;
        this.list.id = this.attributeValues.listId;
        
        this.input.insertAdjacentElement("afterend",this.list);
    }

    private onInput =(e:Event) => {
        if((e instanceof InputEvent == false) && e.target instanceof HTMLInputElement)
        {
            const input = e.target as HTMLInputElement;
            
            Array.from(this.list.querySelectorAll("option"))
            .every(
                (o:HTMLOptionElement) => {
                    if(o.innerText === input.value){
                        this.handleSuggestionSelected(o);
                        return false;
                    }
                    return true;
                });
        }
    }

    private onKeyUp = (event:KeyboardEvent) => {
        this.debug(event);
        this.handleKeyUp(event);
    };  

    private onKeyDown = (event:KeyboardEvent) => {
        this.debug(event);
        this.handleKeyDownDefault(event);
    }; 

    private debug = (data:any)=>{
        if(this.attributeValues.options.debug){
            console.log(data);
        }
    };

   
    handleComponentBlur = (force: boolean = false) =>{
        
        clearTimeout(this.blurTimer);

        const delay: number = force ? 0 : 100;
        this.blurTimer = setTimeout(() => {
            this.clearList();
            
        }, delay);
    }



    handleSuggestionSelected = async (suggestion:HTMLOptionElement)=>{

        if(!this.attributeValues.options.enable_get){
            this.clearList();
        }
        else
        {
            this.input.value = '';

            if(this.attributeValues.options.clear_list_on_select){
                this.clearList();
            }

            const id = suggestion.dataset.id;
            const addressResult = await this.client.get(id);
            if(addressResult.isSuccess){
                let success = addressResult.toSuccess();
                
                this.bind(success.address);
                AddressSelectedEvent.dispatch(this.input,id,success.address);
                
                if(this.attributeValues.options.input_focus_on_select){
                    this.input.focus();
                    this.input.setSelectionRange(this.input.value.length,this.input.value.length+1);
                }
            }
            else{
                const failed = addressResult.toFailed();
                AddressSelectedFailedEvent.dispatch(this.input,id,failed.status,failed.message);
            }
        }
            
    };

    private bind = (address:AutocompleteAddress)=>
    {
        if(address && this.attributeValues.options.bind_output_fields)
        {
            this.setOutputfield(this.output_fields.building_name,address.building_name);
            this.setOutputfield(this.output_fields.building_number,address.building_number);

            this.setOutputfield(this.output_fields.latitude,address.latitude.toString());
            this.setOutputfield(this.output_fields.longitude,address.longitude.toString());

            this.setOutputfield(this.output_fields.line_1,address.line_1);
            this.setOutputfield(this.output_fields.line_2,address.line_2);
            this.setOutputfield(this.output_fields.line_3,address.line_3);
            this.setOutputfield(this.output_fields.line_4,address.line_4);

            this.setOutputfield(this.output_fields.country,address.country);
            this.setOutputfield(this.output_fields.county,address.county);

            this.setOutputfield(this.output_fields.formatted_address_0,address.formatted_address[0]);
            this.setOutputfield(this.output_fields.formatted_address_1,address.formatted_address[1]);
            this.setOutputfield(this.output_fields.formatted_address_2,address.formatted_address[2]);
            this.setOutputfield(this.output_fields.formatted_address_3,address.formatted_address[3]);
            this.setOutputfield(this.output_fields.formatted_address_4,address.formatted_address[4]);

            this.setOutputfield(this.output_fields.town_or_city,address.town_or_city);
            this.setOutputfield(this.output_fields.locality,address.locality);
            this.setOutputfield(this.output_fields.district,address.district);
            this.setOutputfield(this.output_fields.residential,address.residential.toString());

            this.setOutputfield(this.output_fields.sub_building_name,address.sub_building_name);
            this.setOutputfield(this.output_fields.sub_building_number,address.sub_building_number);

            this.setOutputfield(this.output_fields.thoroughfare,address.thoroughfare);
            this.setOutputfield(this.output_fields.postcode,address.postcode);
            
        }
    };

    private setOutputfield = (fieldName:string, fieldValue:string) =>
    {
            if(!fieldName){
                return;
            }

            let element = document.getElementById(fieldName) as HTMLElement;
            
            if(!element){
                element = document.querySelector(fieldName) as HTMLElement;
            }

            if(element)
            {
               if(element instanceof HTMLInputElement){
                element.value = fieldValue;
               }
               else{
                element.innerText = fieldValue;
               }
            }
            return element;
    }

    handleKeyDownDefault = (event: KeyboardEvent)=>{
        
        let isPrintableKey = event.key && (event.key.length === 1 || event.key === 'Unidentified');
        if(isPrintableKey)
        {
            clearTimeout(this.filterTimer);
            
            this.filterTimer = setTimeout(() => 
            {
                if(this.input.value.length >= this.attributeValues.options.minimum_characters){
                    this.populateList();
                }
                else{
                    this.clearList(); 
                }
            },this.attributeValues.options.delay);
        }
       
    };

    

    handleKeyUp = (event: KeyboardEvent)=>{
        if(event.code === 'Backspace' || event.code === 'Delete')
        {
            if(event){
                const target =(event as Event).target
                if (target == this.input)
                {
                    if(this.input.value.length < this.attributeValues.options.minimum_characters)
                    {
                        this.clearList(); 
                    }
                    else 
                    {
                        this.populateList();
                    }
                } 
            }
        }
    };



    populateList = async ()=>{
            
        const autocompleteOptions = new AutocompleteOptions();
            autocompleteOptions.all = true;
            autocompleteOptions.top = this.attributeValues.options.suggestion_count;
            autocompleteOptions.template = "{formatted_address}{postcode,, }{postcode}";
            autocompleteOptions.fuzzy =false;
            
            if(this.attributeValues.options.filter){
                autocompleteOptions.filter = this.attributeValues.options.filter;
            }
            
            const query = this.input.value?.trim();
            const result = await this.client.autocomplete(query, autocompleteOptions);
            if(result.isSuccess){

                const success = result.toSuccess();
                const newItems:Node[] = [];

                if(success.suggestions.length)
                {
                  
                    for(let i = 0; i< success.suggestions.length; i++){
                        
                        const li = this.getListItem(success.suggestions[i]);
                        newItems.push(li);
                    }

                    this.list.replaceChildren(...newItems);

                }
                else
                {
                    this.clearList(); 
                }
                SuggestionsEvent.dispatch(this.input,query, success.suggestions);
            }
            else
            {
                const failed = result.toFailed();
                SuggestionsFailedEvent.dispatch(this.input,query,failed.status,failed.message);
            }
    };

    
    clearList = ()=>{
        this.list.replaceChildren(...[]);
    };

    getListItem = (suggestion:Suggestion)=>
    {
        const option = document.createElement('OPTION') as HTMLOptionElement;

        let address = suggestion.address;

        option.innerText = address;
        option.dataset.id =suggestion.id;
        
        return option;
    };

    


}