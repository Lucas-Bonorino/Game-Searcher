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

function addgame(game)
{
    let tag_set=""
    game.Tags.forEach(tag => {tag_set+=`<div class="game-tag">${tag}</div>\n`;});

    //Para colocar o código html, usamos texto html entre crases
    Game_Result= `
    <div class="results">
        <h2 class="result-name">${game.Name}</h2>
        <p class="result-description">${game.Description}<p>
        <div class="result-tags">
            ${tag_set}
        </div>
    </div>    
    `;

    return(Game_Result);
}

function Consult()
{
    //O value pega o quê está dentro da tag
    let search_field=document.getElementById("search-field").value;

    let section=document.getElementById("result-section");

    let tags=search_field.replaceAll(" ", "+");

    if(tags=="")
        return;

    //O fetch é o responsável por dizer a URI que nós queremos ao servidor backend(além de fornecer a URL e porta do servidor)
    fetch("http://localhost:3000/consulta/"+tags)
        .then(response=>response.json())
        .then(data=> {
            let section_buffer="";
            for(let item of data) 
                {
                const game = new Game_Data(item.game_name, item.tags, item.release_date, item.description);
                section_buffer+=addgame(game);
                }
            section.innerHTML=section_buffer})
        .catch(error=>{console.error("Erro ao buscar dados", error);});
    
}
