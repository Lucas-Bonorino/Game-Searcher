const express= require('express');
const Controller=require('./../Controllers/GameController');
const Middleware=require('./../middleWare/gameDataMiddleware');

const Router=express.Router();

//É possível usar múltiplos handlers para uma mesma rota
Router.route("/").post(Middleware.Check_Body, Middleware.Clean_Name, Middleware.Clean_Description,Middleware.Clean_Tags, Controller.AddGame).get(Controller.GetGames);
Router.route("/:name").delete(Middleware.Clean_Name, Controller.DeleteGame).patch(Middleware.Clean_Name,Middleware.Clean_Tags,Middleware.Clean_Description,Controller.UpdateGame);

module.exports=Router;