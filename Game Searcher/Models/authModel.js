const crypto=require('crypto');

//This function is responsable for structuring the sql query string by
//processing the query object in the request
function generateFilters(query)
{
    let filters=[];

    if(query.token){
        const time=new Date();

        const tokenFilter={column:'token', operation:'=', value:query.token};    
        const timeFilter={column:'expiration', operation:'>', value:time};

        filters.push(tokenFilter, timeFilter);
    }

    return(filters);
}

//This function is for processing the body and 
//Turning it into the values to insert into the table 
function generateValues(authData)
{
    let values=[];
    let cols=[];

    if(authData.email){
        values.push(authData.email);
        cols.push('email');
    }

    if(authData.token){
        values.push(authData.token);
        cols.push('token');
    }

    if(authData.expiration){
        values.push(authData.expiration);
        cols.push('expiration');
    }

    return([values, cols]);
}

//this function is responsible for getting the name of the table
//where the data is stored
function getResourceName()
{
    return('reset_tokens');
}

//This function is responsable for generating the identifier which
//we'll use to query a single object we intend on updating or deleting
function generateIdentifierFilter(req)
{
    let filters=[];

    const time=new Date();

    filters.push({column:'token', operation:"=", value:req.query.token});
    filters.push({column:'expiration', operation:"<", value:time});

    return(filters);
}

//middleware responsible for verifying 
//if password has been changed since user was last authenticated
function changedPassword(token_stamp, password_stamp)
{
    if(password_stamp)
    {
        const timestamp=parseInt(password_stamp.getTime(), 10)/1000;
        return(token_stamp<timestamp);
    }

    return(false);
}

//Middleware responsable for hashing the token
function cryptoHash(token)
{
    const hashedToken= crypto.createHash('sha256').update(token).digest('hex');

    return(hashedToken);
}

//Midelware resoinsable for generating token data
const generateTokenData= (userEmail)=>{
    const resetToken=crypto.randomBytes(32).toString('hex');
    const hashedToken=cryptoHash(resetToken);
    const expirationDate= new Date((Date.now()+10*60*1000));

    return({email: userEmail, token: hashedToken, expiration:expirationDate, resetToken});
}

module.exports={
    generateFilters,
    generateValues,
    getResourceName,
    generateIdentifierFilter,
    changedPassword,
    generateTokenData,
    cryptoHash
}