const catchAsyncWrapper = require("../utils/catchAsyncWrapper");
const queryWrapper = require("./../utils/queryWrapper");
const appError= require('./../utils/appError');

const getResource = Model => catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
    const filters= Model.generateFilters(req.query);

    queryOBJ.Read(req.query.cols).addFilters(filters, req.query.option).Sort(req.query.sort).Order(req.query.order).Limit(req.query.limit).Paginate(req.query.page).endQuery();

    const resource=await queryOBJ.Query();

    if(!resource)
        return(next(new appError('Could not get data, try again later', 500,'fail')))

    res.status(200).json({
        status: "success" ,
        data : {
            resource
        }
    });
})

const createResource= Model => catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());
    const [values, cols]=Model.generateValues(req.body);

    queryOBJ.Create(cols).addValues(values).Returning().endQuery();

    const createdResource= await queryOBJ.Query();

    if(!createResource){
        return(next(new appError(`Resource already in database`, 409, 'fail')));
    }

    res.status(201).json({
        status: "success",
        data : {
            createdResource
        }
    });
})

const updateResource= Model=>catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());

    const updates = Model.generateUpdates(req.body);
    queryOBJ.Update().addUpdates(updates).Filter().addFilter(Model.generateIdentifierFilter(req)).Returning().endQuery();
   
    const updatedResource = await queryOBJ.Query();

    if(!updateResource){
        return(next(new appError(`No resource with especified identifier found`, 422, 'fail')));
    }

    res.status(201).json({
        stats:"success", 
        data:{
                updatedResource
        }
    });
})

const deleteResource= Model=>catchAsyncWrapper(async (req, res, next)=>{
    const queryOBJ=new queryWrapper(Model.getResourceName());

    queryOBJ.Delete().Filter().addFilter(Model.generateIdentifierFilter(req)).Returning().endQuery();

    const deletedResource = await queryOBJ.Query();

    if(!deleteResource){
        return(next(new appError(`No resource with especified identifier found`, 422, 'fail')));
    }

    res.status(201).json({
        status: "success", 
        data:{
            deletedResource
        }
    });
})


module.exports={
    getResource,
    updateResource,
    deleteResource, 
    createResource
}