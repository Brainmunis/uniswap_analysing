import { NextApiRequest, NextApiResponse } from 'next'
import conn from '../../../lib/db'
import wait from '../../../lib/wait';

export default async (req : NextApiRequest, res : NextApiResponse) => {
    const {
        poolId
    } = req.query;

    let query : string = `SELECT * FROM pool_activity WHERE pool_id = ${poolId}`
    const limitQuery = ` LIMIT 10`
    const sortQuery = " ORDER BY transacted_at DESC"
   
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
    const outputObj = {
        recentTransaction : results.rows
    }
    return res.status(200).send(outputObj)
};