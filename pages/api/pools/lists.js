import conn from '../../../lib/db'
import wait from '../../../lib/wait';

export default async (req, res) => {
    const skip = Number(req.query.skip) || 0;
    const limit = Number(req.query.limit) || 10;
    const query = `SELECT * FROM pools OFFSET ${skip} LIMIT ${limit}`

    const [cerr, results] = await wait(
        conn.query,
        conn,
        query
    )
    if(cerr){
        return res.status(500).send({ error : JSON.stringify(cerr)})
    }
    return res.status(200).send({ pools : results && results.rows || []})
};