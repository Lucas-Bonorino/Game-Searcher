const connection = require('./../utils/connection');
const APIF =require('./../utils/APIFeatures');

//Função para fazer query sql

function generateFilters(query)
{
    let filters=[];

    if(query.tags){
        const tagFilters = query.tags.toLowerCase().split(' ').map(el=> el.replaceAll("_", " "));
        const nameFilters = tagFilters.map(el => '%' + el + '%');

        const tagFilterOBJ={column: 'tags', operation: '&&', value:tagFilters};
        const nameFilterOBJ={column: 'game_name', operation: 'ilike', value:nameFilters, modifier: 'ANY'};

        filters=filters.concat([tagFilterOBJ, nameFilterOBJ]);
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
        const tagsUpdate={column:"tags", function:{operation:"array_cat", args:[{type: "col", value:"tags"}, {type:"arg", value:body.tags}]}};

        updates.push(tagsUpdate);
    }

    if(body.description)
    {
        const descriptionUpdate={column: "description", operator: "||", operands:[{type: "col", value:"description"}, {type:"arg", value:body.description}]};

        updates.push(descriptionUpdate);
    }

    return(updates);
}

function generateValues(game_data)
{
    let values=[game_data.game_name, game_data.tags, game_data.release_date, game_data.description];

    return(values);
}


module.exports={
    generateValues,
    generateFilters,
    generateUpdates
}
