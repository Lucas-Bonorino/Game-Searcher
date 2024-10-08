const Model = require("../Models/gameModel");
const catchWrapper= require('./../utils/catchAsyncWrapper');
const appError = require('./../utils/appError');
const APIF =require("../utils/APIFeatures");
const factory= require('./handlerFactory');

const GetGames= factory.getResource(Model);

const AddGame = factory.createResource(Model);  

const DeleteGame = factory.deleteResource(Model);

const UpdateGame = factory.updateResource(Model);

module.exports={
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame
}