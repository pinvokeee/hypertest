from io import TextIOWrapper
import json
from tableauhyperapi import HyperProcess, TableName, Telemetry, \
    Connection, CreateMode, \
    NOT_NULLABLE, NULLABLE, SqlType, TableDefinition, \
    Inserter, Timestamp, \
    escape_name, escape_string_literal, \
    HyperException, date

def valuesToString(value):

    if (type(value) is str):
        return '"' + value.replace('"', '\\"') + '"'
    elif (type(value) is Timestamp or type(value) is date.Date):
        return '"' + str(value) + '"'

    return str(value)

def m(line):    
    return "[" + ",".join(list(map(valuesToString, line))) + "]"

with HyperProcess(telemetry=Telemetry.SEND_USAGE_DATA_TO_TABLEAU) as hyper:
    with Connection(endpoint=hyper.endpoint, database="C:/Users/nanas/Downloads/出力2.hyper") as connection:

        table_name = TableName("Extract", "Extract")
        table_definition = connection.catalog.get_table_definition(name=table_name)

        columns = list(map(lambda s: s.name.unescaped, table_definition.columns))

        rows_in_table = connection.execute_list_query(query=f"SELECT * FROM {table_name}")
            
        aa: list = list(map(m, rows_in_table))
        
        data : str = ",\n".join(aa)
        columns : str = "[" + ",".join(list(map(lambda s: '"' + s.replace('"', '\"') + '"', columns))) + "]"

        joinFunc : str = "const globalTabHyperData = globalTabHyperDataBody.map((values) => Object.assign(...values.map((value, index) => ({[globalTabHyperHeaders[index]]: value}))));"

        jssource : str = "const globalTabHyperDataBody = [\n" + data + "\n];\nconst globalTabHyperHeaders=" + columns + ";\n" + joinFunc 

        f : TextIOWrapper = open('tabl.js', 'w', encoding="utf8")

        f.write(jssource)

        print (jssource)



