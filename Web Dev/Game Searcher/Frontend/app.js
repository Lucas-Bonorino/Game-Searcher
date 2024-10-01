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

async function Process_Data(response)
{
    const data_json= await response.json();
    const data=data_json.data.games;
    let section_buffer="";
    
    data.forEach(item =>{
        const game=new Game_Data(item.game_name, item.tags, item.release_date, item.description);
        section_buffer+=addgame(game);
    });

    return section_buffer;
}


async function Consult()
{
    //O value pega o quê está dentro da tag
    let search_field=document.getElementById("search-field").value.trim();

    let section=document.getElementById("result-section");

    let tags=search_field.replaceAll(/[ \t\r\n\v\f]+/g, "+");

    let plus_len=tags.replaceAll(/[^+]/g, "").length;

    let query_string="http://localhost:3000/api/v1/games";

    if(plus_len!=tags.length);
        query_string+=`?tags=${tags}`;

    try
    {
        const response= await fetch(query_string);
        
        const data_json= await response.json();
        const data=data_json.data.games;
        let section_buffer="";
    
        data.forEach(item =>{
            const game=new Game_Data(item.game_name, item.tags, item.release_date, item.description);
            section_buffer+=addgame(game);
        });
    
        section.innerHTML=section_buffer;
    } 
    catch(err)
    {
        console.error("Erro ao buscar dados", err);
    }         
}
