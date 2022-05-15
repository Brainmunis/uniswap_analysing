import conn from '../../../../lib/db'
import wait from '../../../../lib/wait';

export default async (req, res) => {
    const {
        poolId
    } = req.query
    console.log('query ', req.query)
    const fetchQuery = `SELECT * FROM pools WHERE id = ${poolId}`
    const deleteQuery = `DELETE FROM pools WHERE id = ${poolId}`

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