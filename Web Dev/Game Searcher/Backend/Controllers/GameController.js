const Model = require("../Models/gameModel");
const factory= require('./handlerFactory');

const GetGames= factory.queryAndSendResponse(Model);

const AddGame = factory.queryAndSendResponse(Model);  

const DeleteGame = factory.queryAndSendResponse(Model);

const UpdateGame = factory.queryAndSendResponse(Model);

module.exports={
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame
}