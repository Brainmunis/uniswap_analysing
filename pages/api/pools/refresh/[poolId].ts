import { NextApiRequest, NextApiResponse } from 'next'
import conn from '../../../../lib/db'
import wait from '../../../../lib/wait';
import startEventProcessing from '../../../../migrations/pools'

export default async (req :NextApiRequest, res : NextApiResponse) => {
    const {
        poolId,
        fromBlock,
        force
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
    const indexTrackerQuery = `SELECT * FROM indexing_tracker WHERE pool_id = ${poolId} AND event_type like 'Mint'`
    const [terr, indexTracker] = await wait(
        conn.query,
        conn,
        indexTrackerQuery
    )
    if(terr){
        return res.status(500).send({ error : JSON.stringify(terr)})
    }
    if(indexTracker && indexTracker.rows && 
        indexTracker.rows.length && indexTracker.rows[0].index_status === "initiated" && !force){
            return res.status(400).send("Refreshing for this pool already running. Provide force=true option inside body to forcfully refresh this pool.")
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