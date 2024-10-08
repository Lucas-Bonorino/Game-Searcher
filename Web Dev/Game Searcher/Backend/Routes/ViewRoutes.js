const express=require('express');
const Router=express.Router();
const Controller= require('../Controllers/ViewController');

Router.route('/').get(Controller.getMainPage);
Router.route('/results').get(Controller.addReturn, Controller.getResults);

module.exports=Router;