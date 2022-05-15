import conn from '../../lib/db';
import format from 'pg-format'

export default async (eventData) =>{
    const insertQuery = consructInsertManyQuery()
    const values = constructValuesForInsertManyQuery(eventData, insertQuery)
    const l = format(insertQuery, values)
    return conn.query(l)
}

function consructInsertManyQuery(){
    return "INSERT INTO pool_activity (block_no,event_type,owner_address,transaction_hash,total_value,token_amount0,token_amount1,contract_address,transacted_at) VALUES %L"
}

function constructValuesForInsertManyQuery(eventDatas, query){
    const values = []
    for(let i=0; i<eventDatas.length; i ++ ){
        const eventObj = eventDatas[i];
        values.push([
            eventObj.block_no,
            eventObj.event_type,
            eventObj.owner_address,
            eventObj.transaction_hash,
            eventObj.total_value,
            eventObj.token_amount0,
            eventObj.token_amount1,
            eventObj.contract_address,
            eventObj.transacted_at
        ])
        // if(i !== eventDatas.length - 1){
        //     query += `($1, $2, $3, $4, $5, $6, $7, $8, $9),`            
        // }else{
        //     query += `($1, $2, $3, $4, $5, $6, $7, $8, $9)`           
        // }
    }
    return values
}
