const catchAsyncWrapper=require('./../utils/catchAsyncWrapper');
const User = require('./../Controllers/UserController');
const appError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const BCrypt =require('bcryptjs');
const {promisify} = require('util');
const email = require('./../utils/email');
const validator= require('validator');
const Model= require('./../Models/authModel');
const UserModel= require('./../Models/userModel');
const factory = require('./handlerFactory');

const GetToken=factory.getResource(Model);

const AddToken=factory.createResource(Model);

const DeleteToken=factory.deleteResource(Model);

const signToken = async (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

const createSendToken = async (id, res, statusCode, resourceData, date) =>{
    const token=await signToken(id);
 
    const cookieOptions={
        expires: date,
        secure: false,
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    const answerObject={status:"sucess", token, data:{ resourceData } };

    factory.sendResponse(res, statusCode, answerObject);
}

const signup=catchAsyncWrapper(async (req, res, next) =>{
    req.body.sendBack=true;

    const loggedUser=await factory.createResource(UserModel)(req, res, next);
    const date=new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000);

    if(loggedUser)
        createSendToken(req.body.email, res, 201, loggedUser, date);
    else
        return(next(new appError("Usuário já existente", 409, 'fail')));
})

const login = catchAsyncWrapper(async (req, res, next) =>{
    //Verify if email and password are correct

    const loggedUser=(await factory.getResource(UserModel)(req, res, next))[0];
    
    if(!loggedUser || !(await BCrypt.compare(req.body.password, loggedUser.password)))
        return(next(new appError(`Invalid combination of email and password`, 401, 'fail')));
    
    loggedUser.password=undefined;
    loggedUser.password_changed_at=undefined;

    const date=new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000);

    createSendToken(loggedUser.email, res, 201, loggedUser, date);
})

const logout = catchAsyncWrapper(async(rec, res, next) =>{
    const date=new Date(Date.now()+1*1000);

    createSendToken('expiration token', res, 200, undefined, date);
})

//Function meant to protect some routes based on token validation
const protect = catchAsyncWrapper(async (req, res, next) => {
    //Check token's or cookie's existence
    if(!((req.headers.authorization && req.headers.authorization.startsWith('Bearer')) || req.cookies.jwt) )
        return(next(new appError('Please login to get access to operation', 401, 'fail')));

    let token;
    if(req.headers.authorization)
        token = req.headers.authorization.split(' ')[1];
    else
        token=req.cookies.jwt;

    //validate token
    let decoded;
    
    try{
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);    
    }
    catch (err)
    {
        return(next(new appError('Token validation failed', 401, 'fail')));
    }

    req.query.email=decoded.id;
    req.validCols=["name", "email", "role", "password_changed_at"];

    //verify if user still exists
    const loggedUser= (await factory.getResource(UserModel)(req, res, next))[0];

    if(!loggedUser)
        return(next(new appError('User does not exist', 401, 'fail')));
    
    //verify if password was recently changed
    const passwordChanged=Model.changedPassword(decoded.iat, loggedUser.password_changed_at);

    if(passwordChanged)
        return(next(new appError('Passsword changed since last authenticated, please login again', 401, 'fail')));

    //grant acess to protected route
    req.user=loggedUser;
    
    req.validCols=undefined;

    next();
})

const forgotPassword=catchAsyncWrapper(async (req, res, next) =>{
    //Verify if user exists
    req.query={email:req.body.email};
    
    const user = (await factory.getResource(UserModel)(req, res, next))[0];
 
    if(!user)
        return(next(new appError('No user with specified email address found', 404, 'fail')));

    //Generate reset token
    req.body=Model.generateTokenData(req.body.email);
    
    const answer=await AddToken(req, res, next);
    const resetToken=req.body.resetToken;

    if(!resetToken)
        return(next(new appError('Reset token generation failed, try again in some time', 500, 'error')));

    //Generate URL for token reset
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message=`A password reset has been requested for this account, URL for password reset is: ${resetURL}.\nif you didn't ask for a password reset, please ignore this email`

    //Compose and send email
    try{
        await email.sendEmail({
            email:user.email,
            subject: 'Password reset token (valid for 10 minutes)',
            message
        })

        res.status(200).json({
            status: "sucess",
            message : "Password reset token to email"
        })
    }
    catch (err)
    {
        return(next(new appError('There was an error sending the email. Try again later', 500, 'error')));
    }
    
})

const resetPassword=catchAsyncWrapper(async (req, res, next)=>{
    //Get user based on token
    const hashedToken=Model.cryptoHash(req.params.token);

    //If token has not expired, and there is user, set password
    req.query={token: hashedToken, cols: ["email"], option:"ALL"};

    const user = (await GetToken(req, res, next))[0];

    if(!user) return(next(new appError('Token is invalid or has expired', 400, 'fail')));

    //Update user password
    req.params.email=user.email;
  
    const answer= (await factory.updateResource(UserModel)(req, res, next));

    if(!answer) return(next(new appError('An error ocurred when trying to update password, please try again later', 500, 'fail')));

    //Removes any unusable reset token
    const deleteAnswer=await DeleteToken(req, res, next);
    
    const date=new Date(Date.now()-1+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000);
    //Log the user in 
    createSendToken(user.email, res, 200, undefined, date);
})

const restrictTo= (...roles) =>{
    return (req, res, next) =>{
        
        if(!roles.includes(req.user.role))
            return(next(new appError('You do not have permission to perform this action', 403, 'fail')));

        next();
    }
}

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

    next();
}

const hashPassword=async (req, res, next) =>{
    req.body.password=await BCrypt.hash(req.body.password, 12);
    req.body.passwordConfirmation=undefined;
    
    next();
}


module.exports={
    signup,
    login, 
    logout,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    validateEmail,
    confirmPassword,
    hashPassword,
}