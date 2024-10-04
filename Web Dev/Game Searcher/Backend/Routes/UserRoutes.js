const express= require('express');
const Controller=require('./../Controllers/UserController');
const AuthController = require('./../Controllers/AuthController');
const Router=express.Router();

//Para cada funcionalidade, precisamos de uma URL
//Para rest API's as URLs não podem ter verbos, e devem apenas indicar o resource
//Com o qual elas trabalham, e outros 
//O método usado pelo objeto app para tratar a url deve ter o tipo de método http
//Usado para a operação (get, post, put(update com o objeto inteiro sendo recebido),
//patch(update com apenas novos dados sendo recebidos), delete) 

//Registramos ao roteador as URLs possíveis e adicionamos seus handlers
Router.post("/signup", AuthController.validateEmail, AuthController.confirmPassword, AuthController.hashPassword, AuthController.signup);
Router.post("/login", AuthController.login);

Router.post("/forgotPassword", AuthController.forgotPassword);
Router.patch("/resetPassword/:token", AuthController.confirmPassword, AuthController.hashPassword, AuthController.resetPassword);

Router.route("/").post(Controller.AddUser);
Router.route("/:id").get(Controller.GetUser);

//Exportamos o roteador para ser usado pela alicação principal
module.exports=Router;