const connection = require('./connection');
const crypto = require('crypto');

async function Add_User(user_data)
{
    const client= await connection.connect();

    try{
        const answer= await client.query(`INSERT into users (email, name, password, password_changed_at) values($1, $2, $3, NOW())`,[user_data.email, user_data.name, user_data.password]);

        client.release();
        return(answer.rows);
    }
    catch(err)
    {
        client.release();
        return(undefined);
    }
}

async function Get_User(email)
{
    const client= await connection.connect();

    const answer= await client.query(`select * from users where email=$1`, [email]);

    client.release();

    return(answer.rows);
}

//Verifies if password has been changed since user was last authenticated
function Changed_Password(token_stamp, password_stamp)
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

const AddResetToken= async email=>{    
    const resetToken=crypto.randomBytes(32).toString('hex');

    const client = await connection.connect();
    const hashedToken=cryptoHash(resetToken);
    const expirationDate= (Date.now()+10*60*1000)/1000;

    try{
        await client.query('INSERT into reset_tokens (token, email, expiration) values ($1, $2, to_timestamp($3));', [hashedToken, email, expirationDate]); 
        client.release();
    }
    catch (err)
    {
        client.release();
        return(undefined);
    }

    return (resetToken); 
}

const getUserByToken= async token=>
{
    const client = await connection.connect();
    const answer = await client.query('select email from reset_tokens where token=$1 and expiration > NOW();', [token]);

    client.release();

    return(answer.rows);
}

const updateUser = async (password, email) => 
{
    
    const client = await connection.connect();
    const answer = await client.query('update users set password=$1,password_changed_at=NOW() where email=$2 returning *;', [password, email]);
    
    client.release();

    return(answer.rows);
}

//Deletes all tokens which are not available anymore
const updateTokens = async (token) => {
    const client = await connection.connect();
    await client.query('delete from reset_tokens where expiration < NOW() or token=$1', [token]);

    client.release();
}

module.exports={
    Add_User, 
    Get_User,
    updateUser,
    updateTokens,
    Changed_Password,
    AddResetToken, 
    cryptoHash,
    getUserByToken
}