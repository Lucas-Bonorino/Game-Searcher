const express= require('express');
const Controller=require('./../Controllers/GameController');

const Router=express.Router();

Router.get("/:filter_list", Controller.GetFilteredGames);
//É possível usar múltiplos handlers para uma mesma rota
Router.route("/").post(Controller.check_body, Controller.AddGame).get(Controller.GetGames);
Router.route("/:name").delete(Controller.DeleteGame).patch(Controller.UpdateGame);

module.exports=Router;