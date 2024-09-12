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

async function Consult()
{
    //O value pega o quê está dentro da tag
    let search_field=document.getElementById("search-field").value;

    let section=document.getElementById("result-section");

    let tags=search_field.replaceAll(" ", "+");

    if(tags=="")
        return;

    try
    {
        const response=await fetch("http://localhost:3000/consulta/"+tags);
        const data= await response.json();
    
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
