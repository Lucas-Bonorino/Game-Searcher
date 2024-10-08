const catchAsyncWrapper = require("../utils/catchAsyncWrapper");
const queryWrapper = require("./../utils/queryWrapper");
const appError= require('./../utils/appError');

const sendResponse=(res, statusCode, answerObject)=>{
    res.status(statusCode).json(answerObject);
}

const generatAnswerObj=(resourceData)=>{
    return({status:"sucess",data: {resource: resourceData}});
}

const getResource = Model => catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
    const filters= Model.generateFilters(req.query);
 
    queryOBJ.Read(req.validCols).addFilters(filters, req.query.option).Sort(req.query.sort).Order(req.query.order).Limit(req.query.limit).Paginate(req.query.page).endQuery();

    const resource=await queryOBJ.Query();

    return(resource);
})

const createResource= Model => catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
    const [values, cols]=Model.generateValues(req.body);

    queryOBJ.Create(cols).addValues(values).Returning(req.validCols).endQuery();

    const createdResource= await queryOBJ.Query();

    return(createdResource);
})

const updateResource= Model=>catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());

    const updates = Model.generateUpdates(req.body);
    queryOBJ.Update().addUpdates(updates).addFilters(Model.generateIdentifierFilter(req)).Returning(req.validCols).endQuery();

    const updatedResource = await queryOBJ.Query();

    return(updatedResource);
})

const deleteResource= Model=>catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
  
    queryOBJ.Delete().addFilters(Model.generateIdentifierFilter(req)).Returning(req.validCols).endQuery();

    const deletedResource = await queryOBJ.Query();

    return(deletedResource);
})

const functionByMethod={get: getResource, post: createResource, patch: updateResource, delete: deleteResource};
const statusByMethod={get:200, post: 201, patch:201, delete:201 };
const errorByMethod={
    get: {msg: 'Could not get data or it doesn\'t exist',code: 400},
    post: {msg:`Resource already in database`, code: 409},
    patch: {msg:`No resource with especified identifiers found`, code: 422},
    delete: {msg: `No resource with especified identifiers found`, code: 422}
}

const queryAndSendResponse=(Model) =>catchAsyncWrapper(async (req,res, next)=>{
    const queryFunction=functionByMethod[req.method.toLowerCase()](Model);
    const queryResponse=await queryFunction(req, res, next);
    
   
    if(!queryResponse.length){
        const errorObj=errorByMethod[req.method.toLowerCase()];
        return(next(new appError(errorObj.msg, errorObj.code, 'fail')));
    }

    const statusCode=statusByMethod[req.method.toLowerCase()];
    const answerObject=generatAnswerObj(queryResponse);

    sendResponse(res, statusCode, answerObject);
})


module.exports={
    getResource,
    updateResource,
    deleteResource, 
    createResource,
    sendResponse,
    queryAndSendResponse
}