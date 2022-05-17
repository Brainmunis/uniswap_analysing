import { NextApiRequest, NextApiResponse } from 'next'
import conn from '../../../../lib/db'
import wait from '../../../../lib/wait';
import startEventProcessing from '../../../../migrations/pools'

export default async (req :NextApiRequest, res : NextApiResponse) => {
    const {
        poolId,
        fromBlock
    } = req.body;
    
    if(!req.body.hasOwnProperty('fromBlock')){
        return res.status(400).send({ message : "fromBlock is required."})
    }
    const fetchQuery = `SELECT * FROM pools WHERE id = ${poolId}`

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
    const [peerr, data] = await wait(
        startEventProcessing,
        this,
        exists.rows[0].contract_address,
        fromBlock,
        res,
        poolId
    )
    if(peerr){
        return res.status(400).send({ message : peerr})
    }
    return res.status(200).send(
        { 
            message : `Event refreshment started.`,
            fromBlock,
            contractAddress : exists.rows[0].contract_address,
            pair : exists.rows[0].label
        }
    )
};