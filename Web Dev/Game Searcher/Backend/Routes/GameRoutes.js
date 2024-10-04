const express= require('express');
const Controller=require('./../Controllers/GameController');

const Router=express.Router();

//É possível usar múltiplos handlers para uma mesma rota
Router.route("/").post(Controller.Check_Body, Controller.Clean_Name, Controller.Clean_Description,Controller.Clean_Tags, Controller.AddGame).get(Controller.GetGames);
Router.route("/:name").delete(Controller.Clean_Name, Controller.DeleteGame).patch(Controller.Clean_Name,Controller.Clean_Tags,Controller.Clean_Description,Controller.UpdateGame);

module.exports=Router;