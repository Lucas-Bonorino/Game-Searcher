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



//Exporta as funções para o arquivo index.js
module.exports={
    connect
}

