export const Consult=(search_field)=>{
    let tags=search_field.replaceAll(/[ \t\r\n\v\f]+/g, "+");

    let plusLen=tags.replaceAll(/[^+]/g, "").length;

    let queryString='';
  
    if(plusLen!==tags.length)
        queryString=`?tags=${tags}`;

    location.assign('/results'+queryString);
}
