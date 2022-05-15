import conn from '../lib/db';

export default async (pool_id, block)=>{
    const deleteQuery = `DELETE FROM pool_activity WHERE pool_id = ${pool_id} AND block_no < ${block}`
    return conn.query(deleteQuery)
}