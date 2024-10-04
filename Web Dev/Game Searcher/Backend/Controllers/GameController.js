const db = require("../Models/gameModel");
const catchWrapper= require('./../utils/catchAsyncWrapper');
const appError = require('./../utils/appError');
const APIF =require("../utils/APIFeatures");
const queryWrapper= require("./../utils/queryWrapper");
const factory= require('./handlerFactory');

const GetGames=factory.getResource(db);

const AddGame = factory.createResource(db);  

const DeleteGame = factory.deleteResource(db);

const UpdateGame = factory.updateResource(db);

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