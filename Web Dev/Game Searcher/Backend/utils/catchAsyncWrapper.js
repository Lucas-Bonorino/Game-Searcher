module.exports= fn=>{
    return (req, res, next) =>{
        const answer=fn(req, res, next).catch(next);
        if(req.body.sendBack)
            return(answer);
    }
};