require("dotenv").config();

//Pega a porta de acesso ao servidor backend
const port = process.env.PORT;

//Pega o express para começar a rodar o servidor
const express = require("express");

//Começa a rodar o servidor
const app = express();

//Diz quem são as entidades que tem direito de acesso ao server
const cors = require('cors');
app.use(cors({origin: '*'}));
app.use(express.json());

//Podemos fazer mounting para criar subaplicações, usando objetos routers como middleware 
//para cada subaplicação, nesse caso, podemos fazer isso da seguinte maneira

//Criamos um roteador para a subaplicação
const GameRouter=require('./Routes/GameRoutes');
const UserRouter=require('./Routes/UserRoutes');

//Tratamos ele como middleware que captura um prefixo de URL e direciona ao roteador
//De um resource
//Registramos ao roteador as URLs possíveis e adicionamos seus handlers(dentro dos arquivos com os routers)
app.use("/api/v1/games",  GameRouter);
app.use("/api/v1/users",  UserRouter);


module.exports=app;

