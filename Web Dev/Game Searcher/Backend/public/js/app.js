
async function Consult()
{
    //O value pega o quê está dentro da tag
    let search_field=document.getElementById("search-field").value.trim();

    let tags=search_field.replaceAll(/[ \t\r\n\v\f]+/g, "+");

    let plusLen=tags.replaceAll(/[^+]/g, "").length;

    let queryString='';
  
    if(plusLen!==tags.length)
        queryString=`?tags=${tags}`;

    location.assign('/results'+queryString);
}
