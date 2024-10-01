const connection = require('./connection');
const APIF =require('./APIFeatures');

//Função para fazer query sql
async function Get_Games(query)
{   
    const client = await connection.connect();
    
    if(!global.columns)
        global.columns=await connection.GetColNames('games');
    
    let queryString='SELECT * FROM games ';
    let num=1;
    let args=[];

    [num, queryString, args]=APIF.Filter(query.tags, queryString, num, args);

    queryString=APIF.Sort(query.order,queryString, columns);

    queryString=APIF.Order(query.orderProgression, queryString, num, args);
    
    [num, queryString, args]=APIF.Limit(query.limit, queryString, num, args);

    [num, queryString, args]=APIF.Paginate(query.page, query.limit, queryString, num, args);

    queryString+=';';
    const answer = await client.query(queryString, args);

    client.release();

    return (answer.rows); 
}

async function Add_Game(game_data)
{
    const client = await connection.connect();
    let answer;
    try{
        answer = await client.query(`INSERT into games values ($1, $2, $3, $4)`, [game_data.game_name, game_data.tags, game_data.release_date, game_data.description]);
        answer=answer.rows
    }
    catch (e)
    {   
        answer=undefined;
    }

    client.release();
    return(answer);
}

async function Delete_Game(game_name)
{
    const client = await connection.connect();
    let processed_name=APIF.Process_Sentence(game_name);

    await client.query('DELETE from games where game_name = $1', [processed_name]);

    client.release();

    return `Game ${game_name} deleted with sucess`;
}

async function Update_Game(game_data, game_name)
{
    const processed_name= APIF.Process_Sentence(game_name);
    const client= await connection.connect();
    
    const answer= await client.query(`UPDATE games set tags=array_cat(tags, $1), description=$2 where game_name=$3 returning *;`,  [game_data.tags, game_data.description,processed_name]);
    
    client.release();

    return(answer.rows);
}


module.exports={
    Get_Games,
    Add_Game,
    Update_Game,
    Delete_Game
}
