const catchAsyncWrapper = require("../utils/catchAsyncWrapper");
const queryWrapper = require("./../utils/queryWrapper");
const appError= require('./../utils/appError');
const jwt= require('jsonwebtoken');

const sendResponse=(res, statusCode, answerObject)=>{
    res.status(statusCode).json(answerObject);
}

const generatAnswerObj=(resourceData)=>{
    return({status:"sucess",data: {resourceData}});
}

const getResource = Model => async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
    const filters= Model.generateFilters(req.query);
 
    queryOBJ.Read(req.validCols).addFilters(filters, req.query.option).Sort(req.query.sort).Order(req.query.order).Limit(req.query.limit).Paginate(req.query.page).endQuery();

    const resource=await queryOBJ.Query();

    if((!resource || !resource.length) && !req.body.sendBack){
        return(next(new appError('Could not get data or it doesn\'t exist, try again later or change requested data', 400,'fail')))
    }

    if(req.body.sendBack){
        return(resource);
    }
    else{
        const answerObject=generatAnswerObj(resource);

        sendResponse(res, 200, answerObject);
    }
}

const createResource= Model => catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
    const [values, cols]=Model.generateValues(req.body);

    queryOBJ.Create(cols).addValues(values).Returning(req.validCols).endQuery();

    const createdResource= await queryOBJ.Query();

    if((!createdResource || !createdResource.length) && !req.body.sendBack){
        return(next(new appError(`Resource already in database`, 409, 'fail')));
    }

    if(req.body.sendBack){
        return(createdResource);
    }
    else{
        const answerObject=generatAnswerObj(createdResource);
    
        sendResponse(res, 201, answerObject);
    }
})

const updateResource= Model=>catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());

    const updates = Model.generateUpdates(req.body);
    queryOBJ.Update().addUpdates(updates).addFilters(Model.generateIdentifierFilter(req)).Returning(req.validCols).endQuery();

    const updatedResource = await queryOBJ.Query();
   
    if((!updatedResource || !updatedResource.length) && !req.body.sendBack){
        return(next(new appError(`No resource with especified identifiers found`, 422, 'fail')));
    }

    if(req.body.sendBack){
        return(updatedResource);
    }
    else{
        const answerObject=generatAnswerObj(updatedResource);
    
        sendResponse(res, 201, answerObject);
    }
})

const deleteResource= Model=>catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
  
    queryOBJ.Delete().addFilters(Model.generateIdentifierFilter(req)).Returning(req.validCols).endQuery();

    const deletedResource = await queryOBJ.Query();

    if((!deletedResource || !deletedResource.length) && !req.body.sendBack){
        return(next(new appError(`No resource with especified identifiers found`, 422, 'fail')));
    }

    if(req.body.sendBack){
        return(deletedResource);
    }
    else{
        const answerObject=generatAnswerObj(deletedResource);
    
        sendResponse(res, 201, answerObject);
    }
})


module.exports={
    getResource,
    updateResource,
    deleteResource, 
    createResource,
    sendResponse,
}