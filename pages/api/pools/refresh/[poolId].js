import conn from '../../../../lib/db'
import wait from '../../../../lib/wait';
import startEventProcessing from '../../../../migrations/pools/'
export default async (req, res) => {
    const {
        poolId,
        fromBlock
    } = req.body;
    console.log('query ', req.query)
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
    // if(global.refreshingPools[exists.rows[0].contract_address]){
    //     return res.status(400).send({ message : "This pool is already in refreshing phase."})
    // }else{
    //     global.refreshingPools[exists.rows[0].contract_address] = true
    // }
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