const express= require('express');
const Controller=require('./../Controllers/GameController');
const AuthController=require('./../Controllers/AuthController');
const Router=express.Router();

//É possível usar múltiplos handlers para uma mesma rota
Router.route("/")
    .post(AuthController.protect, Controller.checkBody, Controller.uploadImages, Controller.resizeImages, Controller.AddGame)
    .get(Controller.GetGames);

Router.use(AuthController.protect);

Router.route("/:game")
    .delete(AuthController.restrictTo('ADMIN'), Controller.DeleteGame)
    .patch(Controller.checkUpdates, Controller.uploadImages, Controller.resizeImages, Controller.UpdateGame);

module.exports=Router;