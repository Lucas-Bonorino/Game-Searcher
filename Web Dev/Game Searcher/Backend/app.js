//Pega o express para começar a rodar o servidor
const path=require('path');
const express = require("express");
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const xss=require('xss-clean');
const hpp=require('hpp');

//Começa a rodar o servidor
const app = express();
const appError= require('./utils/appError');
const appErrorHandler = require("./Controllers/ErrorController");

//Diz quem são as entidades que tem direito de acesso ao server
const cors = require('cors');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname,'Views'));

app.use(helmet());
app.use(xss());
app.use(hpp());

app.use(cors({origin: '*'}));
app.use(express.json({limit: '10kb'}));

const limiter=rateLimit({
    max:1000,
    windowMs: 60*60*1000,
    message: "Too many requests from IP, try again in an hour"
});

app.use('/api', limiter);

app.use(express.static(path.join(__dirname, 'public')));

//Podemos fazer mounting para criar subaplicações, usando objetos routers como middleware 
//para cada subaplicação, nesse caso, podemos fazer isso da seguinte maneira

//Criamos um roteador para a subaplicação
const ViewRouter=require('./Routes/ViewRoutes');
const GameRouter=require('./Routes/GameRoutes');
const UserRouter=require('./Routes/UserRoutes');

//Tratamos ele como middleware que captura um prefixo de URL e direciona ao roteador
//De um resource
//Registramos ao roteador as URLs possíveis e adicionamos seus handlers(dentro dos arquivos com os routers)
app.use('/', ViewRouter);
app.use("/api/v1/games",  GameRouter);
app.use("/api/v1/users",  UserRouter);

//Tratamento de rotas inexistentes
app.all("*", (req, res, next)=>{
    next(new appError(`Unidentified URL ${req.url}`, 404, 'fail'));
});

app.use(appErrorHandler);


module.exports=app;

