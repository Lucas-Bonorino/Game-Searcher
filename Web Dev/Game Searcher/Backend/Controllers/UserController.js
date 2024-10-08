const Model= require('./../Models/userModel');
const factory= require('./handlerFactory');

const GetUser=factory.getResource(Model);

const AddUser=factory.createResource(Model);

const UpdateUser=factory.updateResource(Model);

const DeleteUser=factory.deleteResource(Model);

const GetLoggedUser=(req, res, next) =>{
    factory.sendResponse(res, 200, req.user);
}

const addEmailParam=(req, res, next)=>{
    req.params.email=req.user.email;
    
    next();
}

const addQueryFromParam=(req, res, next)=>{
    req.query={email: req.params.email};

    next();
}

const addEmailQueryFromBody=(req, res, next)=>{
    req.query.email=req.body.email;

    next();
}

const addEmailQueryFromUser=(req, res, next)=>{
    req.query.email=req.user.email;

    next();
}

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
};