const Model= require('./../Models/userModel');
const factory= require('./handlerFactory');
const middlewareFactory=require('./../utils/middlwareFactory');

const GetUser=factory.queryAndSendResponse(Model);

const AddUser=factory.queryAndSendResponse(Model);

const UpdateUser=factory.queryAndSendResponse(Model);

const DeleteUser=factory.queryAndSendResponse(Model);

const GetLoggedUser=(req, res, next) =>{
    factory.sendResponse(res, 200, factory.generatAnswerObj(req.user));
}

const checkSignupBody=middlewareFactory.checkRequiredBodyFields('email', 'name', 'password','passwordConfirmation');
const checkLoginBody=middlewareFactory.checkRequiredBodyFields('email', 'password');
const checkPasswordChangeBody=middlewareFactory.checkRequiredBodyFields('password', 'passwordConfirmation');
const checkResetPasswordBody=middlewareFactory.checkRequiredBodyFields('email');

const restrictReturns=middlewareFactory.restrictReturns('name', 'email', 'role');

const restrictSignupBody=middlewareFactory.restrictBody('name', 'email', 'password', 'passwordConfirmation');
const restrictUpdateBody=middlewareFactory.restrictBody('name', 'email');
const restrictPasswordUpdateBody=middlewareFactory.restrictBody('password', 'passwordConfirmation');
const restrictAdminUpdate=middlewareFactory.restrictBody('name', 'email', 'role');

const checkUpdate=middlewareFactory.checkUpdates('name', 'email');
const checkAdminUpdate=middlewareFactory.checkUpdates('name', 'email', 'role');

const restrictQuery=middlewareFactory.restrictQuery();
const restrictLoginQuery=middlewareFactory.restrictQuery('email');

const addEmailParam=middlewareFactory.transferDataBetweenPartFields('user', 'email', 'params', 'email');
const addQueryFromParam=middlewareFactory.transferDataBetweenPartFields('params', 'email', 'query', 'email');
const addEmailQueryFromBody=middlewareFactory.transferDataBetweenPartFields('body', 'email', 'query', 'email');
const addEmailQueryFromUser=middlewareFactory.transferDataBetweenPartFields('user', 'email', 'query', 'email');

module.exports ={
    AddUser,
    GetUser,
    UpdateUser,
    DeleteUser,
    addEmailParam,
    addEmailQueryFromUser,
    addEmailQueryFromBody,
    addQueryFromParam,
    GetLoggedUser,
    checkSignupBody,
    restrictReturns,
    checkLoginBody,
    checkPasswordChangeBody,
    checkResetPasswordBody,
    restrictSignupBody,
    restrictUpdateBody,
    restrictPasswordUpdateBody,
    restrictAdminUpdate,
    checkUpdate,
    checkAdminUpdate,
    restrictQuery,
    restrictLoginQuery
};