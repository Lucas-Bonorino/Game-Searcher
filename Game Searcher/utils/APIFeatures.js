const { query } = require("express");

//Separates sentences which represent titles and change their casing
function Process_Sentence(sentence) {
    //Adds a trailing for the sentence to facilitate identifying first letters
    let new_sentence = " " + sentence + " ";
    new_sentence = new_sentence.replaceAll("_", " ");

    //Puts every roman digits in upper case if they appear amongst only other roman digits
    new_sentence = new_sentence.replaceAll(/[ \t\r\n\v\f][IVXLCDMivxlcdm]+[ \t\r\n\v\f]/g, match => {
        return match.toUpperCase()
    });

    //Finds first letters of a sentence and puts them in upper case
    //Here we considerate they might be separated by whitespaces or underlines
    new_sentence = new_sentence.replaceAll(/ [a-z]/g, match => {
        return match.toUpperCase();
    });

    //Simplifies the spacing in the title
    new_sentence = new_sentence.replaceAll(/[ \t\r\n\v\f]+/g, " ");

    //The trim removes any whitespaces from the beggining or end of the sentence
    new_sentence = new_sentence.trim();

    return (new_sentence);
}

function Filter(tags, queryString, num, args) 
{
    if (tags) 
    {
        queryString += `where tags && $${num} or game_name ilike ANY($${num + 1}) `;
        num += 2;
        const tag_filters = tags.toLowerCase().split(' ');
        const name_filters = tag_filters.map(el => '%' + el.replaceAll("_", " ") + '%');

        args = args.concat([tag_filters]);
        args = args.concat([name_filters]);
    }

    return ([num, queryString, args]);
}

function Sort(orderBy, queryString, Columns) 
{
    if (orderBy)
    {
        const availableOrders = Columns.map(el => el.column_name);

        if (availableOrders.includes(orderBy))
            queryString += `ORDER BY ${orderBy} `;
    }

    return (queryString);
}

function Order(orderProgression, queryString) 
{
    if(orderProgression)
    {
        if (["ASC", "DESC"].includes(orderProgression.toUpperCase()))
            queryString += `${orderProgression} `;
    }

    return (queryString);
}

function Limit(limit, queryString, num, args) 
{
    if(limit)
    {
        queryString += `LIMIT $${num} `;
        num += 1;
        args = args.concat(limit * 1);
    }

    return ([num, queryString, args]);
}

function Paginate(page, limit, queryString, num, args) 
{
    if(page)
    {
        const page_num = (page * 1) - 1;
        const limit_num = (limit * 1) || 100;

        const num_skip_rows = page_num * limit_num;

        queryString += `OFFSET $${num} `;
        num += 1;
        args = args.concat(num_skip_rows);
    }

    return ([num, queryString, args]);
}

module.exports = {
    Process_Sentence,
    Filter,
    Sort,
    Order,
    Limit,
    Paginate
}