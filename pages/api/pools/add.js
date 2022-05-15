import conn from '../../../lib/db'
import wait from '../../../lib/wait';

export default async (req, res) => {
    const {
        contract_address,
        token0,
        token1,
        label
    } = req.body;

    if(!contract_address || typeof contract_address !== 'string'){
        return res.status(400).send("Contract address required and it should be string.")
    }
    if(!token0 || typeof token0 !== 'string'){
        return res.status(400).send("Pool token0 required and it should be string.")
    }
    if(!token1 || typeof token1 !== 'string'){
        return res.status(400).send("Pool token1 required and it should be string.")
    }
    const values = [
        contract_address,
        token0,
        token1,
        label
    ]
    const query = 'INSERT INTO pools(contract_address,token0,token1,label) VALUES ($1, $2, $3, $4)'

    const [cerr, results] = await wait(
        conn.query,
        conn,
        query,
        values
    )
    if(cerr){
        return res.status(500).send({ error : JSON.stringify(cerr)})
    }
    console.log("result ", results)
    return res.status(200).send("Pool created successfully")
};