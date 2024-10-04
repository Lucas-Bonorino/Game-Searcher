const db = require("../Models/gameModel");
const catchWrapper= require('./../utils/catchAsyncWrapper');
const appError = require('./../utils/appError');
const APIF =require("../utils/APIFeatures");
const queryWrapper= require("./../utils/queryWrapper");

const GetGames = catchWrapper(async (req, res, next) =>
{
    const filters= db.generateFilters(req.query);
    const queryOBJ=new queryWrapper.queryWrapper('games');
    
    queryOBJ.Read(req.query.cols).addFilters(filters, query.option).Sort(req.query.sort).Order(req.query.order).Limit(req.query.limit).Paginate(req.query.page).endQuery();

    const games=await queryOBJ.Query();

    res.json({
        status: "success" ,
        data : {
            games:games
        }
    });
});

const AddGame = catchWrapper(async (req, res, next) =>
{
    const queryOBJ=new queryWrapper.queryWrapper('games');
    const values=db.generateValues(req.body);

    queryOBJ.Create(Object.keys(req.body)).addValues(values).Returning().endQuery();

    const answer= await queryOBJ.Query();

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
    const queryOBJ=new queryWrapper.queryWrapper('games');

    queryOBJ.Delete().Filter().addFilter({column: "game_name", operation: "=", value: APIF.Process_Sentence(req.params.name)}).Returning().endQuery();

    const answer = await queryOBJ.Query();

    if(!answer){
        return(next(new appError(`No game with name ${req.params.name} found`, 422, 'fail')));
    }

    res.status(201).json({
        status: "success", 
        data:{
            deleted_game : answer
        }
    });
})    

const UpdateGame = catchWrapper(async (req, res, next) => 
{
    const queryOBJ=new queryWrapper.queryWrapper('games');

    const updates = db.generateUpdates(req.body);
    queryOBJ.Update().addUpdates(updates).Filter().addFilter({column:"game_name", operation: "=", value: APIF.Process_Sentence(req.params.name)}).Returning().endQuery();
   
    const answer = await queryOBJ.Query();

    if(!answer){
        return(next(new appError(`No game with name ${req.params.name} found`, 422, 'fail')));
    }

    res.status(201).json({
        stats:"success", 
        data:{
                updated_game: answer
        }
    });
})

const Check_Body=(req, res, next) =>{
    let Missing_Body_Part=!req.body.game_name || !req.body.description || !req.body.release_date;

    if (Missing_Body_Part){ 
        next(new appError("Missing game information(release date, description or name)", 400, 'fail'));
    }

    next();
}

const Clean_Name=(req, res, next) =>{
    req.body.game_name=APIF.Process_Sentence(req.body.game_name);
    next();
}

const Clean_Description=(req, res, next) => {
    req.body.description=req.body.description.trim();

    next();
}

const Clean_Tags=(req, res, next) =>{
    req.body.tags=req.body.tags.map(el => el.toLowerCase());
    next();
}

module.exports={
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame,
    Check_Body,
    Clean_Name,
    Clean_Description,
    Clean_Tags
}