const appError = require('../utils/appError');
const APIF =require("./../Data_Access/APIFeatures");

//Some middleware for data cleansing and validation
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
    Check_Body,
    Clean_Name,
    Clean_Description,
    Clean_Tags
}
