const express= require('express');
const Controller=require('./../Controllers/UserController');

const Router=express.Router();

//Para cada funcionalidade, precisamos de uma URL
//Para rest API's as URLs não podem ter verbos, e devem apenas indicar o resource
//Com o qual elas trabalham, e outros 
//O método usado pelo objeto app para tratar a url deve ter o tipo de método http
//Usado para a operação (get, post, put(update com o objeto inteiro sendo recebido),
//patch(update com apenas novos dados sendo recebidos), delete) 

//Registramos ao roteador as URLs possíveis e adicionamos seus handlers
Router.route("/").post(Controller.AddUser);
Router.route("/:id").get(Controller.GetUser);

//Exportamos o roteador para ser usado pela alicação principal
module.exports=Router;