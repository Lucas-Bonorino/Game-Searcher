const connection = require('./connection');

class queryWrapper {
    constructor(tableName){
        this.tableName=tableName;
        this.num=1;
        this.args=new Array();
        this.queryString='';
    }

    logQuery()
    {
        console.log(this.queryString, this.args);
    }

    Filter()
    {
        this.queryString+=" where ";

        return (this);
    }

    addFilter(filter)
    {
        let preparationValue=`$${this.num}`;

        if(filter.modifier)
            preparationValue= `${filter.modifier}($${this.num})`; 
        
        this.queryString+=`${filter.column} ${filter.operation} ${preparationValue}`;
        this.num+=1;
        this.args.push(filter.value);
        
        return (this);
    }

    Or()
    {
        this.queryString+=" or ";
        return (this);
    }

    And()
    {
        this.queryString+= " and ";
        return (this);
    }

    addFiltersALL(filters)
    {
        if(filters)
        {
            this.Filter();

            filters.forEach(filter => {
                this.addFilter(filter).And();
            });

            const indexLastAnd=this.queryString.lastIndexOf('and');
            this.queryString=this.queryString.slice(0, indexLastAnd);
        }
        
        return(this);
    }

    addFiltersANY(filters)
    {
        if(filters)
        {
            this.Filter();
        
            filters.forEach(filter => {
                this.addFilter(filter).Or();
            });

            const indexLastOr=this.queryString.lastIndexOf('or');
            this.queryString=this.queryString.slice(0, indexLastOr);
        }

        return(this);
    }

    addFilters(filters, option)
    {
        switch(option){
            case 'ANY': this.addFiltersANY(filters); break;
            case 'ALL': this.addFiltersALL(filters); break;
            default:    this.addFiltersALL(filters); break;
        }

        return(this);
    }

    Sort(orderBy) 
    {
        if (orderBy)
        {
            this.queryString += `ORDER BY ${orderBy} `;
        }

        return(this);
    }

    Order(orderProgression) 
    {
        if(orderProgression)
        {
            this.queryString += `${orderProgression} `;
        }

        return (this);
    }

    Limit(limit) 
    {
        if(limit)
        {
            this.queryString += `LIMIT $${this.num} `;
            this.num += 1;
            this.args.push(limit * 1);
        }

        return (this);
    }

    Paginate(page, limit) 
    {
        if(page)
        {
            const page_num = (page * 1) - 1;
            const limit_num = (limit * 1) || 100;

            const num_skip_rows = page_num * limit_num;

            this.queryString += `OFFSET $${this.num} `;
            this.num += 1;
            this.args.push(num_skip_rows);
        }

        return (this);
    }

    Create(columns)
    {   
        let columnNames='';
        if(columns)
            columnNames='('+columns.join(',')+')'

        this.queryString=`INSERT INTO ${this.tableName} ${columnNames} VALUES `;
        
        return(this);
    }

    Delete()
    {
        this.queryString=`DELETE FROM ${this.tableName} `;

        return(this);
    }

    Update()
    {
        this.queryString=`UPDATE ${this.tableName} set `;
        
        return(this);
    }

    Read(columns)
    {   
        let columnNames='*';

        if(columns)
            columnNames=columns.join(',');

        this.queryString=`SELECT ${columnNames} FROM ${this.tableName} `;
        return(this);
    }

    Returning(columns)
    {
        let columnNames='*';

        if(columns)
            columnNames=columns.join(',');

        this.queryString+=` RETURNING ${columnNames}`;

        return(this);
    }

    addFunction(update)
    {
        let updateString=` ${update.function.operation}(`;

        update.function.args.forEach(arg=>{
            if(arg.type==='col'){
                updateString+=` ${arg.value},`
            }
            else{
                updateString+=` $${this.num},`;
                this.num+=1;
                this.args.push(arg.value)
            }
        })

        const lastComma=updateString.lastIndexOf(',');
        updateString=updateString.slice(0, lastComma);

        updateString+=')';

        this.queryString+=updateString;

        return(this);
    }

    addOperator(update)
    {
        let operandStrings=[];

        update.operands.forEach(operand=>{
            if(operand.type==='col')
                operandStrings.push(` ${operand.value}`);
            else{
                operandStrings.push(` $${this.num} `);
                this.num+=1;
                this.args.push(operand.value);
            }
        })

        this.queryString+=` ${operandStrings[0]} ${update.operator} ${operandStrings[1]} `;

        return(this);
    }

    addUpdate(update)
    {   
        this.queryString+=` ${update.column}=`;
       
        if(update.function)
            this.addFunction(update);
        else
            this.addOperator(update);

        this.queryString+=',';

        return(this);
    }

    addUpdates(updateList)
    {
        updateList.forEach(update=>{
            this.addUpdate(update);
        });

        const lastComma=this.queryString.lastIndexOf(',');
        this.queryString=this.queryString.slice(0, lastComma);

        return(this);
    }

    endQuery()
    {
        this.queryString+=';';
        
        this.queryString.replaceAll(/ +/g, ' ');

        return(this);
    }

    addValues(values)
    {
        this.queryString+='(';

        values.forEach(value=>{
            this.queryString+=`$${this.num},`;
            this.num+=1;
            this.args.push(value);
        })

        const lastComma=this.queryString.lastIndexOf(',');
        this.queryString=this.queryString.slice(0, lastComma);

        this.queryString+=')';

        return(this);
    }

    async Query()
    {
        const client = await connection.connect();
        let answer;
        this.logQuery();

        try{
            answer= (await client.query(this.queryString, this.args)).rows;
        }
        catch(err){
            answer=undefined;
        }

        client.release();

        return(answer);
    }
}

module.exports={
    queryWrapper
}