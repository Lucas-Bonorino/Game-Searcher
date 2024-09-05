class Game_Data 
{
    constructor (Name, Tags, Release_Date, Description) 
    {
        this.Name=Name;
        this.Tags=Tags;
        this.Release_Date=Release_Date;
        this.Description=Description;
    }
}

function addgame(game, section_buffer)
{
    let tag_set=""
    game.Tags.forEach(tag => {tag_set+=`<div>${tag}</div>\n`;});

    //Para colocar o código html, usamos texto html entre crases
    section_buffer+= `
    <div class="results">
        <h2>${game.Name}</h2>
        <p>${game.Description}<p>
        ${tag_set}
    </div>    
    `;
}

function Consult()
{
    let tags=document.getElementById("search-field");

    let section=document.getElementById("result-section");
    let section_buffer="";
    
    let tag='RPG'
    console.log(tag)
    //O fetch é o responsável por dizer a URI que nós queremos ao servidor backend(além de fornecer a URL e porta do servidor)
    fetch('http://localhost:3000/consulta/'+tag)
        .then(response=>response.json())
        .then(data=> data.forEach(item => {
            const game = new Game_Data(item.game_name, item.tags, item.release_date, item.description);
            addgame(game, section_buffer);
        }))
        .catch(error=>{console.error("Erro ao buscar dados", error);});
    
    //Alterar o inner html altera o html da página
    section.innerHTML=section_buffer;
}
