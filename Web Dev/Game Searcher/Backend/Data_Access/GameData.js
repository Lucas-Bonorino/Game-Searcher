const connection = require('./connection')

function Generate_Filters(filter_list)
{
    let substringed_filters=[];
    let searched_name='ARRAY['
    let filters=filter_list.split("+");
    let searched_filters='ARRAY['

    filters.forEach(function(filter, index) {
        this[index]=filter.replaceAll('_', ' ');
        searched_filters+=`$${index+1},`;
        substringed_filters.push(`%${filter}%`);
        searched_name+=`$${index+filters.length+1},`;}, filters);

    searched_filters=searched_filters.substring(0, searched_filters.length-1)+']'

    searched_name=searched_name.substring(0, searched_name.length-1)+']';

    return [filters, substringed_filters, searched_filters,searched_name];
}

//Função para fazer query sql
async function Get_Game_By_Filter(filter_list) 
{  
    const [filters, substringed_filters, searched_filters, searched_name]=Generate_Filters(filter_list);
   
    const client = await connection.connect();
    const answer = await client.query(`SELECT * FROM games where tags && ${searched_filters} or game_name ilike ANY(${searched_name});`, filters.concat(substringed_filters));

    return (answer.rows);
}

async function Get_All_Games() 
{   
    const client = await connection.connect();
    const answer = await client.query(`SELECT * FROM games;`);

    return (answer.rows); 
}

async function Add_Game(game_data)
{
    const client = await connection.connect();
    try{
        await client.query(`INSERT into games values ($1, $2, $3, $4)`, [game_data.game_name, game_data.tags, game_data.release_date, game_data.description]);
    }
    catch (e)
    {   
       throw( Error(`Game ${game_data.game_name} already in database`) );
    }
}

async function Delete_Game(game_name)
{
    const client = await connection.connect();
    let processed_name=game_name.replaceAll('_',' ');

    await client.query('DELETE from games where Game_Name = $1', [processed_name]);
    return `Game ${game_name} deleted with sucess`;
}

async function Update_Game(game_data, game_name)
{
    let searched_tags = 'ARRAY['

    game_data.tags.forEach(function(tag, index) {
        searched_tags+=`$${index+1},`
    });

    searched_tags=searched_tags.substring(0, searched_tags.length-1)+']';

    const processed_name= game_name.replaceAll("_", " ");
    const client= await connection.connect();

    try{
        answer= await client.query(`UPDATE games set tags=array_cat(tags, ${searched_tags}), description=$${game_data.tags.length+1} where game_name=$${game_data.tags.length+2} returning *`,  game_data.tags.concat([game_data.description,processed_name]));
        return(answer.rows);
    }
    catch (err)
    {
        throw Error(`Game ${processed_name} not in database.`);
    }
}

module.exports={
    Get_Game_By_Filter,
    Get_All_Games,
    Add_Game,
    Update_Game,
    Delete_Game
}
