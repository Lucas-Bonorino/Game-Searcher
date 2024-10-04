const User= require('../Models/userModel');
const catchAsyncWrapper=require('./../utils/catchAsyncWrapper');
const db = require('../Models/userModel');
const appError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const BCrypt =require('bcryptjs');
const {promisify} = require('util');
const email = require('./../utils/email');
const validator= require('validator');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
}

const createSendToken = async (id, res, statusCode, data) =>{
    const token=signToken(id);

    const cookieOptions={
        expires: new Date.now()+JWT_COOKIE_EXPIRES_IN *24*60**60*1000,
        secure: false,
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status:'sucess',
        token,
        data
    });
}

const signup=catchAsyncWrapper(async (req, res, next) =>{
    const answer = await db.Add_User(req.body);

    if(!answer)
        return(next(new appError('Email already used by other user', 422, 'fail')));

    const data={
        name:req.body.name,
        email:req.body.email, 
    }

    createSendToken(req.body.email, res, 200, data);
})

const login = catchAsyncWrapper(async (req, res, next) =>{
    const {email, password}=req.body;

    //Verify body to see if it's in the correct format
    if(!email || !password)
        return(next(new appError('Please insert email and password', 400, 'fail')));

    //Verify if email and password are correct
    const user=await db.Get_User(email)[0];

    if(!user || !(await BCrypt.compare(password, user.password)))
        return(next(new appError(`Invalid combination of email and password`, 401, 'fail')));
    
    const token=signToken(user.email);

    res.status(201).json({
        status: 'sucess',
        token
    });
})

//Function meant to protect some routes based on token validation
const protect = catchAsyncWrapper(async (req, res, next) => {
    //Check token's existence
    if(!(req.headers.authorization && req.headers.authorization.startsWith('Bearer')))
        return(next(new appError('Please login to get access to operation', 401, 'fail')));

    const token = req.headers.authorization.split(' ')[1];
    //validate token
    let decoded;

    try{
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);    
    }
    catch (err)
    {
        return(next(new appError('Token validation failed', 401, 'fail')));
    }
    
    //verify if user still exists
    const loggedUser=await db.Get_User(decoded.id)[0];

    if(loggedUser)
        return(next(new appError('User does not exist anymore', 401, 'fail')));
    
    //verify if password was recently changed

    const passwordChanged= db.Changed_Password(decoded.iat, loggedUser.password_changed_at);

    if(passwordChanged)
        return(next(new appError('Passsword changed since last authenticated, please login again', 401, 'fail')));

    //grant acess to protected route
    req.user=loggedUser;
    next();
})

const restrictTo= (...roles) =>{
    return (req, res, next) =>{
        
        if(!roles.includes(req.user.role))
            return(next(new appError('You do not have permission to perform this action', 403, 'fail')));

        next();
    }
}

const forgotPassword=catchAsyncWrapper(async (req, res, next) =>{
    //Verify if user exists
    const user = (await db.Get_User(req.body.email))[0];

    if(!user)
        return(next(new appError('No user with specified email address found', 404, 'fail')));

    //Generate reset token
    const resetToken=await db.AddResetToken(user.email);

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
    const hashedToken=db.cryptoHash(req.params.token);

    //If token has not expired, and there is user, set password
    const user = (await db.getUserByToken(hashedToken))[0];

    if(!user)
        return(next(new appError('token is invalid or has expired', 400, 'fail')));

    //Update user password
    await db.updateUser(req.body.password, user.email);

    //Removes any unusable reset token
    await db.updateTokens(hashedToken);
    
    //Log the user in 
    const token=signToken(user.email);

    res.status(200).json({
        status: 'sucess',
        token
    });

})


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
    signup,
    login, 
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    validateEmail,
    confirmPassword,
    hashPassword
}