const catchAsyncWrapper = require("../utils/catchAsyncWrapper");
const factory = require('./../Controllers/handlerFactory');
const gameModel=require('./../Models/gameModel');
const {promisify} = require('util');

const getResults=catchAsyncWrapper(async (req, res, next) =>{
    const games=await factory.getResource(gameModel)(req, res, next);

    res.status(200).render('searchResults', {
        games
    })
})

const getMainPage=(req, res, next)=>{
    res.status(200).render('search');
}

const getLoginPage=(req, res, next)=>{
    res.status(200).render('login');
}

const getSignupPage=(req, res, next)=>{
    res.status(200).render('login');
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
            return(next());

        //verify if password was recently changed
        const passwordChanged=Model.changedPassword(decoded.iat, loggedUser.password_changed_at);

        if(passwordChanged)
            return(next());

        res.locals.user=loggedUser;
    }

    next();
})

module.exports={
    getMainPage,
    getResults,
    isLogged,
    getLoginPage,
    getSignupPage
};