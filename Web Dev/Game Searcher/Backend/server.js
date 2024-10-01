require("dotenv").config();
const app = require('./index');

//Pega a porta de acesso ao servidor backend
const port = process.env.PORT;
app.listen(port);
