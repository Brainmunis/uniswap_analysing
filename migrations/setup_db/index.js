import conn from '../../lib/db';
import wait from '../../lib/wait';

async function initialDbSetup(req, res){
    const [perr, pools] = await wait(
        createPoolTable,
        this
    )
    if(perr){
        console.log(`Error creating pool table. Error : ${JSON.stringify(perr)}`)
        return res.status(400).send("Error creating pool table.")
    }
    const [aperr, activity_pools] = await wait(
        createPoolActivityTable,
        this
    )
    if(aperr){
        console.log(`Error creating activity pool table. Error : ${JSON.stringify(aperr)}`)
        return res.status(400).send("Error activity creating pool table.")
    }
    const [iterr, indexTracking] = await wait(
        createPoolActivityTable,
        this
    )
    if(iterr){
        console.log(`Error creating Index tracking table. Error : ${JSON.stringify(iterr)}`)
        return res.status(400).send("Error creating Index tracking table")
    }
    const [sperr, SamplePools] = await wait(
        createSamplePoolPairs,
        this
    )
    if(sperr){
        console.log(`Error creating sample pool pairs. Error : ${JSON.stringify(sperr)}`)
        return res.status(400).send("Error creating sample pool pairs")
    }
    return res.status(200).send("Db Setup Successfully")
}

async function createPoolTable(){
    if(!isTableExists('pools')){
        await conn.query(`
        CREATE TABLE pools (
            id BIGSERIAL NOT NULL UNIQUE,
            contract_address VARCHAR(100) NOT NULL PRIMARY KEY,
            label VARCHAR(50) NOT NULL,
            token0 VARCHAR(50) NOT NULL,
            token1 VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`)
        console.log("Pool table created.")
    }else{
        console.log("Pool table already Exists")
    }
}

async function isTableExists(table_name){
    let a = await conn.query(`SELECT EXISTS (SELECT relname FROM pg_class WHERE relname = '${table_name}'`)
    if(a && a.rows.length && a.rows[0].exists){
        return true
    }else{
        return false
    }
}

async function createPoolActivityTable(){
    if(!isTableExists('pool_activity')){
        await conn.query(`
        CREATE TABLE pool_activity (
            id BIGSERIAL NOT NULL PRIMARY KEY,
            block_no int NOT NULL,
            event_type VARCHAR(50) NOT NULL,
            owner_address VARCHAR(100) NOT NULL,
            transaction_hash VARCHAR(100) NOT NULL,
            total_value VARCHAR(100) NOT NULL,
            token_amount0 VARCHAR(100) NOT NULL,
            token_amount1 VARCHAR(100) NOT NULL,
            contract_address VARCHAR(100) NOT NULL REFERENCES pools(contract_address),
            transacted_at TIMESTAMPTZ NOT NULL,
            pool_id INT NOT NULL REFERENCES pools(id)
        )`)
    }else{
        console.log("Pool activity table created.")
    }
}

async function createIndexTrackingTable(){
    if(!isTableExists('indexing_tracker')){
        await conn.query(
            `CREATE TABLE indexing_tracker (
                id BIGSERIAL NOT NULL PRIMARY KEY,
                pool_id INT NOT NULL REFERENCES pools(id),
                index_status VARCHAR(50) NOT NULL,
                last_sync_at TIMESTAMPTZ,
                event_type VARCHAR(50) NOT NULL,
                last_block_id int,
                failure_message VARCHAR(1000)
            )`
        )
        console.log("Index tracking table created.")
    }else{
        console.log("Index tracking table already exists")
    }
    
}

function createSamplePoolPairs(){
    if(isTableExists("pools")){
        let findQuery = "SELECT * FROM pools"

        let pools = await conn.query(findQuery)

        if(pools && pools.rows && pools.rows.length){
            console.log('Pools data already created')
            return true
        }else{
            const query = `INSERT INTO pools
            (contract_address,token0,token1,label) 
            VALUES 
            ("0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8", "USDC", "ETH", "USDC-ETH")
            ("0x290A6a7460B308ee3F19023D2D00dE604bcf5B42", "MATIC", "ETH", "MATIC-ETH")
            ("0x127452F3f9cDc0389b0Bf59ce6131aA3Bd763598", "ETH", "SOL", "SOL-SOL")`

            await conn.query(query)
            console.log("Sample pools created")
        }
    }
}

export default initialDbSetup;