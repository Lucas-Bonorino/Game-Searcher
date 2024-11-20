const connection = require('./../utils/connection');
const APIF =require('./../utils/APIFeatures');

///This function is responsable for structuring the sql query string by
//processing the query object in the request
function generateFilters(query)
{
    let filters=[];

    if(query.tags){
        const tagFilters = query.tags.toLowerCase().split(' ').map(el=> el.replaceAll("_", " "));

        const tagFilterOBJ={column: 'tags', operation: '&&', value:tagFilters};

        filters.push(tagFilterOBJ);
    }

    if(query.name){
        const nameFilter= '%'+query.name.toLowerCase().replaceAll('_', ' ')+'%';
        
        const nameFilterOBJ={column: 'game_name', operation: 'ilike', value:nameFilter};

        filters.push(nameFilterOBJ);
    }

    if(query.keywords){
        const keywords=query.keywords.toLowerCase().split(' ').map(el => "%" + el + "%");
        
        const keywordFilterOBJ={column: 'description', operation: 'ilike', value: keywords, modifier: 'ANY'};

        filters.push(keywordFilterOBJ);
    }

    if(query.release){
        const date=Date.parse(Object.values(query.release)[0])/1000;

        Object.keys(query.release).forEach(comparisonOperator => {
            let operation;

            switch (comparisonOperator) {
                case 'lt' : operation='<' ; break;
                case 'lte': operation='<='; break;
                case 'gt' : operation='>' ; break;
                case 'gte': operation='>='; break;
                case 'eq' : operation='=' ; break;
                case 'neq': operation='<>'; break;
            }
            
            const dateFilterOBJ={column: 'release_date', operation: operation, value: date, modifier:"to_timestamp"};

            filters.push(dateFilterOBJ);
        });
    }

    return(filters);
}

//This function is for processing the body and 
//And generating the updates we want for the table
function generateUpdates(body)
{
    let updates=[];

    if(body.tags){
        const tagsUpdate={column:"tags", function:{operation:"array_cat", args:[{type: "col", value:"tags"}, {type:"arg", value:body.tags.map(el => el.toLowerCase())}]}};

        updates.push(tagsUpdate);
    }

    if(body.description)
    {
        const descriptionUpdate={column: "description", operator: "||", operands:[{type: "col", value:"description"}, {type:"arg", value:body.description.trim()}]};

        updates.push(descriptionUpdate);
    }

    if(body.tagsRemove && !body.tags){
        const tagsRemovalUpdate={column:"tags", function:{operation:"array_remove", args:[{type: "col", value:"tags"}, {type:"arg", value:body.tagsRemove.toLowerCase()}]}};

        updates.push(tagsRemovalUpdate);
    }

    if(body.descriptionSubstitute && !body.description){
        const descriptionSubstituteUpdate={column: "description", value: body.descriptionSubstitute.trim()};

        updates.push(descriptionSubstituteUpdate);
    }

    if(gameData.gameCover){
        const gameCoverUpdate={column:"game_cover", value: gameData.gameCover};

        updates.push(gameCoverUpdate);
    }

    if(gameData.gameImages){
        const gameImagesUpdate={column:"game_images", function:{operation:"array_cat", args:[{type: "col", value:"game_images"}, {type:"arg", value:gameData.gameImages}]}};
        
        updates.push(gameImagesUpdate);
    }

    if(gameDate.pageBackground){
        const gamePageBackgroundUpdate={column: "game_page_background", value:gameDate.pageBackground };
        
        updates.push(gamePageBackgroundUpdate);
    }

    return(updates);
}

//This function is for processing the body and 
//Turning it into the values to insert into the table 
function generateValues(gameData)
{
    let values=[];
    let cols=[];

    if(gameData.name){
        values.push(APIF.Process_Sentence(gameData.name));
        cols.push('game_name');
    }
    
    if(gameData.tags){
        values.push(gameData.tags.replaceAll(/'['']'/g, '').split(',').map(el => el.toLowerCase()));
        cols.push('tags');
    }

    if(gameData.release){
        values.push(gameData.release);
        cols.push('release_date');
    }

    if(gameData.description){
        values.push(gameData.description.trim());
        cols.push('description');
    }

    if(gameData.gameCover){
        values.push(gameData.gameCover);
        cols.push('game_cover');
    }

    if(gameData.gameImages){
        values.push(gameData.gameImages);
        cols.push('game_images');
    }

    if(gameDate.pageBackground){
        values.push(gameData.pageBackground);
        values.push('game_page_background');
    }

    return([values, cols]);
}

//this function is responsible for getting the name of the table
//where the data is stored
function getResourceName()
{
    return('games');
}

//This function is responsable for generating the identifier which
//we'll use to query a single object we intend on updating or deleting
function generateIdentifierFilter(req)
{
    return([{column: "game_name", operation: "=", value: APIF.Process_Sentence(req.params.game)}]);
}

module.exports={
    getResourceName,
    generateValues,
    generateFilters,
    generateUpdates,
    generateIdentifierFilter,
}
