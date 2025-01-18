import AttributeValues from "./AttributeValues";
import Client, {  AutocompleteOptions, Suggestion } from 'getaddress-api';
import { AddressSelectedEvent, AddressSelectedFailedEvent, SuggestionsEvent, SuggestionsFailedEvent } from "./Events";


export default class Autocomplete
{

    private filterTimer?: ReturnType<typeof setTimeout>
    private blurTimer?: ReturnType<typeof setTimeout>
    private list?: HTMLDataListElement;
   

    constructor(readonly input:HTMLInputElement,readonly client:Client,readonly attributeValues:AttributeValues)
    {
        
    }

    public destroy(){
        this.destroyInput();
        this.destroyList();
    }

    private destroyList()
    {
        if(this.list)
        {
            this.list.remove();
        }
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
        if(this.list && (e instanceof InputEvent == false) && e.target instanceof HTMLInputElement)
        {
            const input = e.target as HTMLInputElement;
            
            Array.from(this.list.querySelectorAll("option"))
            .every(
                (o:HTMLOptionElement) => {
                    if(o.value === input.value){
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
            if(id)
            {
                const addressResult = await this.client.get(id);
                if(addressResult.isSuccess){
                    let success = addressResult.toSuccess();
                    
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
        }
            
    };

  

    handleKeyDownDefault = (event: KeyboardEvent)=>{
        
        let isPrintableKey = event.key && (event.key.length === 1 || event.key === 'Unidentified');

        let delay = event.key === ' '?0:this.attributeValues.options.delay;

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
            },delay);
        }
       
    };

 
    

    handleKeyUp = (event: KeyboardEvent)=>{
        if(event){
            if(event.code === 'Backspace' || event.code === 'Delete')
            {
                    const target =(event as Event).target
                    if (target == this.input)
                    {
                        clearTimeout(this.filterTimer);
                        this.filterTimer = setTimeout(() => 
                        {
                            if(this.input.value.length < this.attributeValues.options.minimum_characters)
                            {
                                this.clearList(); 
                            }
                            else 
                            {
                                this.populateList();
                            }
                        },this.attributeValues.options.delay);
                    } 
                
            }
        }
    };



    populateList = async ()=>{
            
            const autocompleteOptions:Partial<AutocompleteOptions> = {
                all : true,
                top : this.attributeValues.options.suggestion_count,
                template : `<option value="{formatted_address_0}">{formatted_address_1}{formatted_address_1,, }{formatted_address_2}{formatted_address_2,, }{formatted_address_3}{formatted_address_4,, }{formatted_address_4}{postcode,, }{postcode}</option>`,
                show_postcode: this.attributeValues.options.show_postcode
            };
            
            if(this.attributeValues.options.filter){
                autocompleteOptions.filter = this.attributeValues.options.filter;
            }
            
            const query = this.input.value?.trim();
            const result = await this.client.autocomplete(query, autocompleteOptions);
            if(result.isSuccess){

                const success = result.toSuccess();
                const newItems:Node[] = [];

                if(this.list && success.suggestions.length)
                {
                  
                    for(let i = 0; i< success.suggestions.length; i++){
                        
                        const li = this.getListItem(success.suggestions[i],i);
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
        if(this.list){
            this.list.replaceChildren(...[]);
        }
    };

    getListItem = (suggestion:Suggestion, index:number)=>
    {
        let option= this.htmlToNode(suggestion.address) as HTMLOptionElement;
        
        option.dataset.id =suggestion.id;
        
        for(let i = 0; i< index; i++)
        {
            option.value = option.value + ' ';
        }
        
        return option;
    };

    private htmlToNode =(html:string)=> {
    const template = document.createElement('template') as HTMLTemplateElement;
    template.innerHTML = html;
   

    if(html){
        html = html.trim();
    }

    const nNodes = template.content.childNodes.length;
    if (nNodes !== 1) {
        throw new Error(
            'html parameter must represent a single node'
        );
    }
    return template.content.firstChild;
}
    


}