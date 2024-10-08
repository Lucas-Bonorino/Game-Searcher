const catchAsyncWrapper = require("../utils/catchAsyncWrapper");
const gameController=require('./GameController');
const {promisify} = require('util');

const getResults=catchAsyncWrapper(async (req, res, next) =>{
    const games=await gameController.GetGames(req, res, next);

    res.status(200).render('searchResults', {
        games
    })
})

const getMainPage=(req, res, next)=>{
    res.status(200).render('search');
}

const isLogged=catchAsyncWrapper(async(req, res, next)=>{
    if(req.cookies.jwt){
        const decoded=promisify(jwt.verify)(req.cookies.jwt, process.env.SECRET);
        //Prepares for query 
        req.query.email=decoded.id;
        req.validCols=["name", "email", "role", "password_changed_at"];
        req.body.sendBack=true;

        const loggedUser= (await User.GetUser(req, res, next))[0];

        req.validCols=undefined;
        req.body.sendBack=undefined;

        if(!loggedUser)
            next();

        //verify if password was recently changed
        const passwordChanged=Model.changedPassword(decoded.iat, loggedUser.password_changed_at);

        if(passwordChanged)
            return(next(new appError('Passsword changed since last authenticated, please login again', 401, 'fail')));
    }

    next();
})

module.exports={
    getMainPage,
    getResults,

};