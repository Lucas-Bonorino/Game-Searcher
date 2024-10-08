const connection = require('./../utils/connection');
const crypto = require('crypto');

function generateFilters(query)
{
    let filters=[];

    if(query.email){
        const emailFilter={column: 'email', operation:'=', value:query.email};

        filters.push(emailFilter);
    }

    if(query.name){
        const nameFilter={column:'name', operation:"=", value:query.name};

        filters.push(nameFilter);
    }

    if(query.role){
        const roleFilter={column:'role', operation:"=", value:query.role};

        filters.push(roleFilter);
    }

    return(filters);
}

function generateUpdates(body)
{
    let updates=[];

    if(body.password){
        const date=new Date();
        console.log(date.toString());
        const passwordUpdate={column:"password", value: body.password};
        const passwordChangedUpdate={column: "password_changed_at", value:date  };

        updates.push(passwordUpdate, passwordChangedUpdate);
    }

    if(body.email){
        const emailUpdate={column:"email", value:body.email};

        updates.push(emailUpdate);
    }

    if(body.name){
        const nameUpdate={column:"name", value:body.name};

        updates.push(nameUpdate);
    }

    if(body.role){
        const roleUpdate={column:"role", value:body.role};

        updates.push(roleUpdate);
    }

    return(updates);
}

function generateValues(userData)
{
    let values=[];
    let cols=[];

    if(userData.email){
        values.push(userData.email);
        cols.push('email');
    }

    if(userData.name){
        values.push(userData.name);
        cols.push('name');
    }

    if(userData.password){
        values.push(userData.password);
        cols.push('password');

        const date=new Date();
        values.push(date);
        cols.push('password_changed_at');
    }

    if(userData.role){
        values.push(userData.role);
        cols.push('role');
    }

    return([values, cols]);
}

function getResourceName()
{
    return('users');
}

function generateIdentifierFilter(req)
{
    return([{column: "email", operation: "=", value: req.params.email}]);
}



module.exports={
    generateFilters,
    generateUpdates,
    generateIdentifierFilter,
    generateValues,
    getResourceName,
}