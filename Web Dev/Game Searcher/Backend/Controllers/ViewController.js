const catchAsyncWrapper = require("../utils/catchAsyncWrapper");
const gameController=require('./GameController');

const getResults=catchAsyncWrapper(async (req, res, next) =>{
    const games=await gameController.GetGames(req, res, next);

    res.status(200).render('searchResults', {
        games
    })
})

const getMainPage=(req, res, next)=>{
    res.status(200).render('search');
}

const addReturn=(req, res, next)=>{
    if(req.body)
        req.body.sendBack=true;
    else
        req.body={sendBack:true};

    next();
}

module.exports={
    getMainPage,
    getResults,
    addReturn
};