import conn from '../../../../lib/db'
import wait from '../../../../lib/wait';

export default async (req, res) => {
    const skip = Number(req.query.skip) || 0;
    const limit = Number(req.query.limit) || 10;
    const {
        status = "all",
        fromDate,
        user_address,
        poolId
    } = req.query;

    let query = `SELECT * FROM pool_activity WHERE pool_id = ${poolId}`
    const limitQuery = ` OFFSET ${skip} LIMIT ${limit}`
    const sortQuery = " ORDER BY transacted_at DESC"
    if(status && status === "add"){
        query += " AND event_type like 'Mint'"
    }else if(status && status === "remove"){
        query += " AND event_type = 'Burn'"
    }
    if(fromDate){
        query += ` AND transacted_at >= '${fromDate}'`
    }
    if(user_address){
        query += ` AND owner_address = '${user_address}'`
    }
    query += sortQuery
    query += limitQuery;
    
    const [cerr, results] = await wait(
        conn.query,
        conn,
        query
    )
    if(cerr){
        return res.status(500).send({ error : JSON.stringify(cerr)})
    }
    return res.status(200).send({ pools : results.rows})
};
