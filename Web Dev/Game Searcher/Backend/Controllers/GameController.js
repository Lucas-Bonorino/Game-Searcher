const Model = require("../Models/gameModel");
const factory= require('./handlerFactory');
const middlewareFactory=require('./../utils/middlwareFactory');
const imageProcessing=require('./../utils/imageProcessing');

const GetGames= factory.queryAndSendResponse(Model);
const AddGame = factory.queryAndSendResponse(Model);  
const DeleteGame = factory.queryAndSendResponse(Model);
const UpdateGame = factory.queryAndSendResponse(Model);

const checkUpdates=middlewareFactory.checkUpdates('description', 'tags', 'tagsRemove', 'descriptionSubstitute');
const checkBody=middlewareFactory.checkRequiredBodyFields('name', 'description', 'release');

const uploadCover=imageProcessing.upload.fields([{name: 'gameCover', maxCount: 1}]);
const resizeCover=imageProcessing.resizeImages('games', ['gameCover'], [{x:500, y:500}], 'body','name');

module.exports={
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame,
    checkUpdates,
    checkBody,
    uploadCover,
    resizeCover
}