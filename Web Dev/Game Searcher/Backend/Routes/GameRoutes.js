const express= require('express');
const Controller=require('./../Controllers/GameController');
const AuthController=require('./../Controllers/AuthController');
const middlewareFactory=require('./../utils/middlwareFactory');
const Router=express.Router();

//É possível usar múltiplos handlers para uma mesma rota
Router.route("/")
    .post(AuthController.protect,  middlewareFactory.checkRequiredBodyFields('name', 'description', 'release'), Controller.AddGame)
    .get(Controller.GetGames);

Router.route("/:game")
    .delete(AuthController.protect, AuthController.restrictTo('ADMIN'), Controller.DeleteGame)
    .patch(AuthController.protect, middlewareFactory.checkUpdates('description', 'tags', 'tagsRemove', 'descriptionSubstitute'), Controller.UpdateGame);

module.exports=Router;