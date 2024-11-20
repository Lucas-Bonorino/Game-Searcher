class appError extends Error{
    constructor(message, statusCode, status){
        super(message);

        this.status=status;
        this.statusCode=statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports=appError;