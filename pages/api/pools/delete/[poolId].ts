import { NextApiRequest, NextApiResponse } from 'next'
import conn from '../../../../lib/db'
import wait from '../../../../lib/wait';

export default async (req :NextApiRequest, res : NextApiResponse) => {
    const {
        poolId
    } = req.query
    
    const fetchQuery :string = `SELECT * FROM pools WHERE id = ${poolId}`
    const deleteQuery :string = `DELETE FROM pools WHERE id = ${poolId}`

    const [cerr, exists] = await wait(
        conn.query,
        conn,
        fetchQuery
    )
    if(cerr){
        return res.status(500).send({ error : JSON.stringify(cerr)})
    }
    if(!exists.rows.length){
        return res.status(400).send({ error : "Invalid pool id"})
    }
    const [derr, deletedStatus] = await wait(
        conn.query,
        conn,
        deleteQuery
    )
    if(derr){
        return res.status(500).send({ error : JSON.stringify(cerr)})
    }
    return res.status(200).send({ message : "Pool deleted successfully"})
};