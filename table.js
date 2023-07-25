class TbTable {

    constructor(dataRows) {
        this.sourceDataRows = dataRows;
        this.table = [];
        this.resetTable();

        this.grouping = {
            sum: this._sum.bind(this),
            count: this._count.bind(this),
        }
    }

    resetTable() {
        this.table = this.createFromValueRows(this.sourceDataRows);        
    }

    createFromValueRows(dataRows) {
        return dataRows.map(columns => Object.assign(...Object.keys(columns).map(key => {
            return { 
                    [key]: this._getTypeAndValue(columns[key])
                }
        })));
    }

    _getTypeAndValue(value) {

        if (typeof value === "string" && value.match(/^\d{2,4}[-/]\d{1,2}[-/]\d{1,2}/)) {
            if (new Date(value) == undefined) return { type: typeof value, value: value };
            return { type: "date", value: new Date(value) }
        }
    
        return { type: typeof value, value: value };
    }

    _count(groupingColumnNames, countColumnNames) {

        this.table = this._calclation(groupingColumnNames, countColumnNames, 
        (data, key) => {
            countColumnNames.forEach(name => data[key][name] = ({ type: "CNT", value: 0}));
            return data[key];
        }, 
        (current, newItem, key) => {
            countColumnNames.forEach(name => current[key][name].value++);
            return current[key];
        });

        return this;
    }

    _sum(groupingColumnNames, sumColumnNames) {

        this.table = this._calclation(groupingColumnNames, sumColumnNames, 
        (data, key) => {
            sumColumnNames.forEach(name => data[key][name] = ({ type: "SUM", value: 0}));
            return data[key];
        }, 
        (current, newItem, key) => {
            sumColumnNames.forEach(name => current[key][name].value += newItem[name].value);
            return current[key];
        });

        return this;
    }

    _calclation(groupingColumnNames, calcColumnNames, initFunc, calcFunc) {

        return Object.values(this.table.reduce((data, item) => 
        {
            const hasAllKey = groupingColumnNames.map(name => item[name] != undefined).filter(val => val != undefined).length == item.length;
            if (hasAllKey) throw "指定されたキーが存在しません";
        
            const key = groupingColumnNames.map(name => item[name] ? item[name].value : undefined).join("-");
    
            if (!data[key]) {
    
                const obj = structuredClone(item);
                const names = [...groupingColumnNames, ...calcColumnNames];
    
                data[key] = Object.assign(...names.map(name => ({[name]: obj[name]})));
                data[key] = initFunc(data, key);
            }
    
            data[key] = calcFunc(data, item, key);
            
            return data;
    
        }, {}));

    }

    newFomulaColumn(fomulaColumnSet) {                
        this.table.forEach((data) => {
            fomulaColumnSet.forEach(([name, calcFunc]) => {
                const value = calcFunc(data);
                data[name] = this._getTypeAndValue(value);
            })                
        });

        return this;
    }
    

}

class TableView {

    constructor(element, table, rowsNames, columnNames) {
        this.element = element;
        this.table = table;
        this.rowNames = rowsNames;
        this.columnNames = columnNames;
    
        this.refresh();
    }

    clear() {  
        console.log([this.element]);      
        while (this.element.firstElementChild != undefined) {
            this.element.firstElementChild.remove();
        }
    }

    draw() {

        const ul = document.createElement("ul");
        const headers = document.createElement("li");

        this.columnNames.map(columnName => { 

            const span = document.createElement("span");
            span.innerText = columnName;
            return span;

        }).forEach(column => headers.appendChild(column));        

        ul.appendChild(headers);
        this.element.appendChild(ul);
    }

    refresh() {

        this.clear();
        this.draw();

    }


}