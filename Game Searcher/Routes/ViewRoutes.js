const express=require('express');
const Router=express.Router();
const Controller= require('../Controllers/ViewController');

Router.route('/').get(Controller.getMainPage);
Router.route('/results').get(Controller.getResults);

Router.route('/login').get(Controller.getLoginPage);
Router.route('/signup').get(Controller.getSignupPage);

module.exports=Router;