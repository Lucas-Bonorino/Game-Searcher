require("dotenv").config();
const app = require('./app');

//Pega a porta de acesso ao servidor backend
const port = process.env.PORT;
app.listen(port);
