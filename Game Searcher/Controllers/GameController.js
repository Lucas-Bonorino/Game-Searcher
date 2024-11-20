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

const uploadImages=imageProcessing.upload.fields([{name: 'gameCover', maxCount: 1}, {name:'gameImages', maxCount:5}, {name: 'pageBackground', maxCount: 1}]);
const resizeImages=imageProcessing.resizeImages('games', ['gameCover', 'gameImages', 'pageBackground'], [{x:320, y:240}, {x:510, y:290}, {x:910, y:160}], 'body','name');

module.exports={
    GetGames,
    AddGame,
    DeleteGame,
    UpdateGame,
    checkUpdates,
    checkBody,
    uploadImages,
    resizeImages
}