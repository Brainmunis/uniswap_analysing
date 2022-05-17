import { NextApiRequest, NextApiResponse } from 'next'
import conn from '../../../../lib/db'
import wait from '../../../../lib/wait';

export default async (req : NextApiRequest, res : NextApiResponse) => {
    const {
        poolId
    } = req.query
    
    const fetchQuery = `SELECT * FROM indexing_tracker WHERE pool_id = ${poolId}`

    const [cerr, stats ] = await wait(
        conn.query,
        conn,
        fetchQuery
    )
    if(cerr){
        return res.status(500).send({ error : JSON.stringify(cerr)})
    }
   
    return res.status(200).send({ stats : stats.rows})
};