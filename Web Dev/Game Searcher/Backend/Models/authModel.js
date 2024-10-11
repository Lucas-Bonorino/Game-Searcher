const crypto=require('crypto');

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

function getResourceName()
{
    return('reset_tokens');
}

function generateIdentifierFilter(req)
{
    let filters=[];

    const time=new Date();

    filters.push({column:'token', operation:"=", value:req.query.token});
    filters.push({column:'expiration', operation:"<", value:time});

    return(filters);
}

//Verifies if password has been changed since user was last authenticated
function changedPassword(token_stamp, password_stamp)
{
    if(password_stamp)
    {
        const timestamp=parseInt(password_stamp.getTime(), 10)/1000;
        return(token_stamp<timestamp);
    }

    return(false);
}

function cryptoHash(token)
{
    const hashedToken= crypto.createHash('sha256').update(token).digest('hex');

    return(hashedToken);
}

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