require("dotenv").config();

//Pega a porta de acesso ao servidor backend
const port = process.env.PORT;

//Pega o arquivo javascript no qual estão as funcões do backend
const db = require("./data");

//Pega o express para começar a rodar o servidor
const express = require("express");

//Começa a rodar o servidor
const app = express();

//Diz quem são as entidades que tem direito de acesso ao server
const cors = require('cors');
app.use(cors({origin: '*'}));

//Para cada funcionalidade, precisamos de uma URI
//Essa linha garante que sabemos o que fazer quando uma URI com a forma de 
// "/consulta/tag" é acessado 
app.get("/consulta/:tag_list", async (req, res) =>{
    const games= await db.Consult_Game_By_Tag(req.params.tag_list);
    res.json(games);
})

app.listen(port);