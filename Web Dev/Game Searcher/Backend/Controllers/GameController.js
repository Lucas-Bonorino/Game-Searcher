const db = require("./../Data_Access/GameData");
const catchWrapper= require('./../utils/catchAsyncWrapper');
const appError = require('./../utils/appError');

const GetGames = catchWrapper(async (req, res, next) =>
{
    const games=await db.Get_Games(req.query);
    res.json({
        status: "success" ,
        data : {
            games:games
        }
    });
});

const AddGame = catchWrapper(async (req, res, next) =>
{
    const answer = await db.Add_Game(req.body);

    if(!answer){
        return(next(new appError(`Game ${req.body.game_name} already in database`, 409, 'fail')));
    }

    res.status(201).json({
        status: "success",
        data : {
            game: req.body
        }
    });
    
})

const DeleteGame = catchWrapper(async (req, res, next) => 
{
    const answer = await db.Delete_Game(req.params.name);
    res.status(201).json({
        status: "success", 
        data:{
            deleted_game : answer
        }
    });
})    

const UpdateGame = catchWrapper(async (req, res, next) => 
{
    const answer = await db.Update_Game(req.body, req.params.name);

    if(!answer.length){
        return(next(new appError(`No game with name ${req.params.name} found`, 422, 'fail')));
    }

    res.status(201).json({
        stats:"success", 
        data:{
                updated_game: answer
        }
    });
})

module.exports={
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame,
}