//Função para realizar a conexão com a base
async function connect()
{
    if(global.connection)
        return global.connection.connect();

    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });
 
    //guardando para usar sempre o mesmo
    global.connection = pool;
    return pool.connect();
}

function Generate_Tags(tag_list)
{
    let tags=tag_list.split("+");
    tags.forEach(function(tag, index) {this[index]=tag.replaceAll('_', ' ');} , tags);

    return tags;
}

//Função para fazer query sql
async function Consult_Game_By_Tag(tag_list) 
{  
    const tags=Generate_Tags(tag_list);
    
    let searched_tags='ARRAY['
    
    tags.forEach(function(tag, index) {searched_tags+=`$${index+1},`});
    searched_tags=searched_tags.substring(0, searched_tags.length-1)+']'
   
    const client = await connect();
    const answer = await client.query(`SELECT * FROM games where tags && ${searched_tags};`, tags);

    return (answer.rows);
}

//Exporta as funções para o arquivo index.js
module.exports={
    Consult_Game_By_Tag
}

