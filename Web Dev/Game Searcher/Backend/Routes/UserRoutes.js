const express= require('express');
const Controller=require('./../Controllers/UserController');
const AuthController = require('./../Controllers/AuthController');
const Router=express.Router();

//Para cada funcionalidade, precisamos de uma URL
//Para rest API's as URLs não devem ter verbos, e devem apenas indicar o resource
//Com o qual elas trabalham, e outros 
//O método usado pelo objeto app para tratar a url deve ter o tipo de método http
//Usado para a operação (get, post, put(update com o objeto inteiro sendo recebido),
//patch(update com apenas novos dados sendo recebidos), delete) 

//Registramos ao roteador as URLs possíveis e adicionamos seus handlers
Router.post("/signup", Controller.checkSignupBody, AuthController.validateEmail, AuthController.confirmPassword, AuthController.hashPassword, Controller.restrictSignupBody,Controller.restrictReturns, AuthController.signup);
Router.post("/login", Controller.checkLoginBody, Controller.addEmailQueryFromBody,Controller.restrictLoginQuery, AuthController.login);
Router.get("/logout", AuthController.logout);

Router.post("/forgotPassword", Controller.checkResetPasswordBody, AuthController.validateEmail, AuthController.forgotPassword);
Router.patch("/resetPassword/:token",Controller.checkPasswordChangeBody, AuthController.confirmPassword, AuthController.hashPassword, AuthController.resetPassword);

Router.use(AuthController.protect);

Router.get("/me", Controller.GetLoggedUser);
Router.patch("/updateMe", Controller.checkUpdate,Controller.restrictUpdateBody, Controller.addEmailParam,Controller.restrictReturns, Controller.UpdateUser);
Router.delete("/deleteMe", Controller.addEmailParam,Controller.restrictReturns, Controller.DeleteUser);
Router.patch("/updatePassword", Controller.checkPasswordChangeBody,Controller.restrictPasswordUpdateBody,Controller.restrictReturns, AuthController.confirmPassword, AuthController.hashPassword, Controller.addEmailParam, Controller.UpdateUser);

Router.use(AuthController.restrictTo('ADMIN'));

Router.route("/")
    .get(Controller.restrictQuery, Controller.restrictReturns, Controller.GetUser)
    .post(Controller.checkSignupBody ,AuthController.validateEmail, AuthController.confirmPassword, AuthController.hashPassword,Controller.restrictReturns, Controller.AddUser);

Router.route("/:email")
    .get(Controller.restrictQuery, Controller.restrictReturns, Controller.addQueryFromParam, Controller.GetUser)
    .delete(Controller.restrictReturns, Controller.DeleteUser)
    .patch(Controller.addQueryFromParam, Controller.checkAdminUpdate, Controller.restrictAdminUpdate,Controller.restrictReturns, Controller.UpdateUser);

//Exportamos o roteador para ser usado pela alicação principal
module.exports=Router;