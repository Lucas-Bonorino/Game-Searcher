const BCrypt=require('bcryptjs');
const appError = require('../utils/appError');
const validator= require('validator');

const validateEmail=(req, res, next) =>{
    const validEmail=validator.isEmail(req.body.email);

    if(!validEmail)
        next(new appError(`Email ${req.body.email} not valid`, 422, 'fail'));

    next();
}

const confirmPassword= (req, res, next) =>{
    const confirmedPassword=req.body.password===req.body.passwordConfirmation;

    if(!confirmedPassword)
        next(new appError('Passwords must be the same', 422, 'fail'));

    next()
}

const hashPassword=async (req, res, next) =>{
    req.body.password=await BCrypt.hash(req.body.password, 12);
    req.body.passwordConfirmation=undefined;
    
    next();
}

module.exports={
    validateEmail,
    confirmPassword,
    hashPassword
}