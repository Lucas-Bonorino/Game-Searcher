const appError = require("./appError");

const restrictBody=(...cols)=>{
    return ((req, res, next) =>{
        cols.forEach(col => {
            if(req.body[col])
                req.body[col]=undefined;
        });

        next();
    });
}

const restrictQuery=(...cols)=>{
    return ((req, res, next) =>{
        if(cols.length){
            cols.forEach(col => {
                if(req.query[col])
                    req.query[col]=undefined;
            });
        }
        else{
            req.query={dull:1};
        }

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

module.exports={
    restrictBody,
    restrictQuery,
    restrictReturns,
    checkRequiredBodyFields,
    checkUpdates
}