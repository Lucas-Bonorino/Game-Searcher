import { Consult } from "./consult";

const searchButton=document.getElementById('search-button');

if(searchButton){
    searchButton.addEventListener('click', ()=> {
        let search_field=document.getElementById("search-field").value.trim();
        Consult(search_field);
    });
}



