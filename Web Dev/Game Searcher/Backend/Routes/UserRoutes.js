const express= require('express');
const Controller=require('./../Controllers/UserController');
const AuthController = require('./../Controllers/AuthController');
const Router=express.Router();
const middlewareFactory=require('./../utils/middlwareFactory')

//Para cada funcionalidade, precisamos de uma URL
//Para rest API's as URLs não podem ter verbos, e devem apenas indicar o resource
//Com o qual elas trabalham, e outros 
//O método usado pelo objeto app para tratar a url deve ter o tipo de método http
//Usado para a operação (get, post, put(update com o objeto inteiro sendo recebido),
//patch(update com apenas novos dados sendo recebidos), delete) 

//Registramos ao roteador as URLs possíveis e adicionamos seus handlers
Router.post("/signup", middlewareFactory.checkRequiredBodyFields('email', 'name', 'password','passwordConfirmation'), AuthController.validateEmail, AuthController.confirmPassword, AuthController.hashPassword, middlewareFactory.restrictBody('role'),middlewareFactory.restrictReturns("name", "email"), AuthController.signup);
Router.post("/login", middlewareFactory.checkRequiredBodyFields('email', 'password'), Controller.addEmailQueryFromBody,middlewareFactory.restrictQuery("name", "role"), AuthController.login);

Router.post("/forgotPassword", middlewareFactory.checkRequiredBodyFields('email'), AuthController.validateEmail, AuthController.forgotPassword);
Router.patch("/resetPassword/:token",middlewareFactory.checkRequiredBodyFields('password', 'passwordConfirmation'), AuthController.confirmPassword, AuthController.hashPassword, AuthController.resetPassword);

Router.use(AuthController.protect);

Router.get("/me", Controller.GetLoggedUser);
Router.patch("/updateMe", middlewareFactory.checkUpdates('name', 'email'), middlewareFactory.restrictBody("password", "role"), Controller.addEmailParam,middlewareFactory.restrictReturns("name", "email", "role"), Controller.UpdateUser);
Router.delete("/deleteMe", Controller.addEmailParam,middlewareFactory.restrictReturns("email", "name", "role"), Controller.DeleteUser);
Router.patch("/updatePassword", middlewareFactory.checkRequiredBodyFields('password', 'passwordConfirmation'),middlewareFactory.restrictBody("name", "email", "role"),middlewareFactory.restrictReturns("email", "name", "role"), AuthController.confirmPassword, AuthController.hashPassword, Controller.addEmailParam, Controller.UpdateUser);

Router.use(AuthController.restrictTo('ADMIN'));

Router.route("/")
    .get(middlewareFactory.restrictQuery(), middlewareFactory.restrictReturns("name", "email", "role"), Controller.GetUser)
    .post(middlewareFactory.checkRequiredBodyFields('name', 'email', 'password', 'passwordConfirmation') ,AuthController.validateEmail, AuthController.confirmPassword, AuthController.hashPassword,middlewareFactory.restrictReturns("email", "name", "role"), Controller.AddUser);

Router.route("/:email")
    .get(middlewareFactory.restrictQuery(), middlewareFactory.restrictReturns("name", "email", "role"), Controller.addQueryFromParam, Controller.GetUser)
    .delete(middlewareFactory.restrictReturns("email", "name", "role"), Controller.DeleteUser)
    .patch(Controller.addQueryFromParam, middlewareFactory.checkUpdates('name', 'email', 'role'), middlewareFactory.restrictBody("password"),middlewareFactory.restrictReturns("email", "name", "role"), Controller.UpdateUser);

//Exportamos o roteador para ser usado pela alicação principal
module.exports=Router;