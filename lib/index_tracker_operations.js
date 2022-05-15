import wait from '../lib/wait';
import conn from '../lib/db';

async function updateIndexStatus(event_type, poolId, status, failMessage, lastSyncDate){
    const indexTrackerQuery = `SELECT * FROM indexing_tracker WHERE pool_id = ${poolId} AND event_type like'${event_type}'`

    const [terr, indexTracker] = await wait(
        conn.query,
        conn,
        indexTrackerQuery
    )
    if(terr){
        return res.status(500).send({ error : JSON.stringify(terr)})
    }
    if(indexTracker && indexTracker.rows.length){
        let updateQuery = `UPDATE indexing_tracker SET`
        let whereCond = ` WHERE pool_id = ${poolId} AND event_type like '${event_type}'`
        let updateStatus = ` index_status = '${status}',`
        let lastSyncAt = ` last_sync_at = '${lastSyncDate}',`
        let failure_message = ` failure_message = '${failMessage || "empty"}'`

        if(status){
            updateQuery += updateStatus
        }
        updateQuery += failure_message
        
        updateQuery += whereCond
        const [cerr, status1] = await wait(
            conn.query,
            conn,
            updateQuery
        )
        if(cerr){
            throw "error while updating indexing status."
        }
    }else{
        const values = [
            poolId,
            status,
            failMessage,
            event_type
        ]
        const query = 'INSERT INTO indexing_tracker(pool_id,index_status,failure_message,event_type) VALUES ($1, $2, $3, $4)'

        const [cerr, results] = await wait(
            conn.query,
            conn,
            query,
            values
        )
        if(cerr){
            throw "error while creating index status"
        }
    }
    return;
}

export default updateIndexStatus