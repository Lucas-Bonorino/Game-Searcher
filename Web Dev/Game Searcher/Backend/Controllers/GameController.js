const db = require("../Data_Access/GameData");

async function GetFilteredGames(req, res)
{
    const games= await db.Get_Game_By_Filter(req.params.filter_list);
    res.json({
        status: "success" ,
        data : {
            games:games
        }
    });
}

async function GetGames(req, res) 
{
    const games=await db.Get_All_Games();
    res.json({
        status: "success" ,
        data : {
            games:games
        }
    });
}

async function AddGame(req, res)
{
    try{
        await db.Add_Game(req.body);
        res.status(201).json({
            status: "success",
            data : {
                game: req.body
        }});
    }
    catch (err)
    {
        res.status(409).json({
            status: "failure",
            data: {
                error: err.message
        }});
    }
}

async function DeleteGame(req, res) 
{
    const answer = await db.Delete_Game(req.params.name);
    res.status(201).json({
        status: "success", 
        data:{
            deleted_game : answer
        }
    });
}    

async function UpdateGame(req, res) 
{
    try{
        const answer = await db.Update_Game(req.body, req.params.name);
        res.status(201).json({
            stats:"success", 
            data:{
                updated_game: answer
            }
        });
    }
    catch (err)
    {
        res.status(422).json({
            status: "failure",
            data: {
                error: err.message
        }});
    }    
}

const check_body=(req, res, next) =>{
    let Missing_Body_Part=!req.body.game_name || !req.body.description || !req.body.release_date;

    if (Missing_Body_Part) 
        return res.status(400).json({
            status:"failure",
            message : "Missing game information(release date, description or name)"
    });

    next()
}


module.exports={
    GetFilteredGames,
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame,
    check_body
}