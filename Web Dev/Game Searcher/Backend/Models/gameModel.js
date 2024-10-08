const connection = require('./../utils/connection');
const APIF =require('./../utils/APIFeatures');

//Função para fazer query sql
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

    return(updates);
}

function generateValues(gameData)
{
    let values=[];
    let cols=[];
    
    if(gameData.name){
        values.push(APIF.Process_Sentence(gameData.name));
        cols.push('game_name');
    }

    if(gameData.tags){
        values.push(gameData.tags.map(el => el.toLowerCase()));
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

    return([values, cols]);
}

function getResourceName()
{
    return('games');
}

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
