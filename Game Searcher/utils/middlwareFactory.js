const appError = require("./appError");

const restrictObj=(obj, cols)=>{
    let newBody={};

    Object.keys(obj).forEach(field=>{
        if(cols.includes(field)) newBody[field]=obj[field]; 
    });

    return(newBody);
}

const restrictBody=(...cols) =>{
    return((req, res, next)=>{
        req.body=restrictObj(req.body, cols);

        next();
    });
}

const restrictQuery=(...cols)=>{
    return((req, res, next)=>{
        req.query=restrictObj(req.query, cols);

        next();
    });
}

const restrictReturns=(...cols)=>{
    return((req, res, next)=>{
        if(cols && cols.length){
            let validCols=[];
            cols.forEach(col=>validCols.push(col));

            req.validCols=validCols;
        }

        if(req.query.cols && req.query.cols.length){
            let validCols=[];

            req.query.cols.forEach(col=>validCols.push(col));

            req.validCols=validCols;
        }

        if(!cols.length && (!req.query.cols || !req.query.cols.length)){
            req.validCols=undefined;
        }

        next();
    });
}


const checkRequiredBodyFields=(...cols)=>{
    return((req, res, next)=>{
        let missingBodyPart=false;

        cols.forEach(col=>{
            missingBodyPart=missingBodyPart|| !req.body[col]; 
        })  

        if(missingBodyPart){
            next(new appError(`Missing information(${cols.join(',')})`, 400, 'fail'));
        }

        next();
    })
}

const checkUpdates=(...cols)=>{
    return((req, res, next)=>{
        let atLeastOneUpdate=false;

        cols.forEach(col=>{ 
            atLeastOneUpdate=atLeastOneUpdate|| req.body[col];
        });

        if(!atLeastOneUpdate){
            next(new appError(`Update body should have at least one update field`, 400, 'fail'));
        }

        next();
    });
}

//Transfers data from one body field to the next
const transferDataBetweenPartFields=(originPart, fieldOrigin, destinyPart, fieldDestiny)=>{
    return(req, res, next) =>{
        if(!req[destinyPart])
            req[destinyPart]={};

        req[destinyPart][fieldDestiny]=req[originPart][fieldOrigin];

        next();
    }
}

module.exports={
    restrictBody,
    restrictQuery,
    restrictReturns,
    checkRequiredBodyFields,
    checkUpdates, 
    transferDataBetweenPartFields
}