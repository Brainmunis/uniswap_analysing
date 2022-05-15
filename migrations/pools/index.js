import _ from 'lodash';
import wait from '../../lib/wait';
import updateIndexStatus from '../../lib/index_tracker_operations';
import clearOldEvents from '../../lib/clearPoolData';
import Web3 from 'web3';
const web3 = new Web3("https://mainnet.infura.io/v3/5b53c456464f4ef384af20b4117bf01d");


import insertMany from '../db_operations/insertMany';

const supportedEvents = [
    "Mint",
    "Burn"
]
const processBlockLimit = 1000;

async function startEventProcessing(contract_address, fromBlock, res, pool_id){
    const eventPromises = [];
    const _this = this;
    for(let event of supportedEvents){
        try{
            const contract = getContractInstance(contract_address);
            var [eventData, historical_block] = await getEventsData(fromBlock, event, contract);
        }catch(e){
            throw JSON.stringify(e)
        }
        console.log(`Event processing started for contract : ${contract_address} for event : ${event}`)
        if(!eventData || !eventData.length){
            throw "Event data not found."
        }
        const [iserr, status] = await wait(
            updateIndexStatus,
            _this,
            event,
            pool_id,
            "initiated",
            "",
            new Date()
        )
        if(iserr){
            throw iserr
        }
        const processId = refreshEvents( contract_address, event, eventData, pool_id)
        eventPromises.push(processId)
    }
    res.status(200).send({
        message : "Event regresh has been started. You can track progress in below API.",
        API : "/api/refresh/:contract_address/status"
    })
    const [perr, pstatus] = await wait(
        Promise.all,
        Promise,
        eventPromises
    )
    if(perr){
        console.log(`Event processing error for contract : ${contract_address}. error : ${JSON.stringify(perr)}`)
    }
    const [eeerr, poolClearStatus] = await wait(
        clearOldEvents,
        this,
        pool_id,
        historical_block
    );
    if(eeerr){
        const [iserr, status1] = await wait(
            updateIndexStatus,
            _this,
            supportedEvents[0],
            pool_id,
            "completed-failed-cleanup",
            "Error while cleaning up old indexes",
            new Date()
        )
        if(iserr){
            console.log(`Error while updating index status for contract : ${contract_address}. error : ${iserr}`)
        }
        const [iserr2, status2] = await wait(
            updateIndexStatus,
            _this,
            supportedEvents[1],
            pool_id,
            "completed-failed-cleanup",
            "Error while cleaning up old indexes",
            new Date()
        )
        if(iserr2){
            console.log(`Error while updating index status for contract : ${contract_address}. error : ${iserr}`)
        }
        console.log(`Error while clearing old indexes for contract : ${contract_address}. error : ${iserr}`)
    }
    const [iserr, status2] = await wait(
        updateIndexStatus,
        this,
        supportedEvents[0],
        pool_id,
        "completed",
        "",
        new Date()
    )
    if(iserr){
        console.log(`Error while updating index status for contract : ${contract_address}. error : ${iserr}`)
    }
    const [idserr, status3] = await wait(
        updateIndexStatus,
        this,
        supportedEvents[1],
        pool_id,
        "completed",
        "",
        new Date()
    )
    if(idserr){
        console.log(`Error while updating index status for contract : ${contract_address}. error : ${iserr}`)
    }
    console.log(`Event processing completed for contract : ${contract_address}.`)
}

async function refreshEvents(contract_address, event_type, eventData, pool_id){
    console.log(`Event processing started for contract : ${contract_address} for event : ${event_type}`)
    
    console.log(`Events data fetched. for contract : ${contract_address} for event : ${event_type}`)
    const constructedResponse = await constructPoolActivityEventDate(eventData, pool_id);
    console.log(`Events data constructed. for contract : ${contract_address} for event : ${event_type}`)
    console.log(`${constructedResponse.length} blocks inserting in db. for contract : ${contract_address} for event : ${event_type}`)
    const chunks = _.chunk(constructedResponse, processBlockLimit);
    console.log(`${chunks.length} chunk to process for contract : ${contract_address} for event : ${event_type}`)
    for(let i=0; i< chunks.length; i++){
        const chunk = chunks[i]
        console.log(`Processing ${i+1}/${chunks.length} for contract : ${contract_address} for event : ${event_type}`)
        const [ierr, instatus] = await wait(
            insertMany,
            this,
            chunk
        )
        if(ierr){
            console.log(`Error while processing chunk for contract : ${contract_address} for event : ${event_type}`)
            break;
        }
    }
    return
}

function getContractInstance(contractAddress){
    const CONTRACT_ADDRESS = contractAddress;
    const CONTRACT_ABI = require('./abi.json')[contractAddress];
    if(!CONTRACT_ABI){
        throw "Missing Contract ABI"
    }
    return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
}

async function getEventsData(fromBlock, eventType, contract){

    const latest_block = await web3.eth.getBlockNumber();
    if(latest_block < fromBlock){
        throw 'Recent block value is greater than latest block value.'
    }
    const historical_block = latest_block - fromBlock;
    console.log("latest: ", latest_block, "historical block: ", historical_block);
    const eventData = await contract.getPastEvents(
        eventType, 
        { 
            fromBlock: historical_block, 
            toBlock: 'latest' 
        }
    );
    return [eventData, historical_block]
}

async function constructPoolActivityEventDate(data_events, pool_id){
    const poolsActivity = [];
    for (let i = 0; i < data_events.length; i++) {
        const ownerAddress = data_events[i]['returnValues']['owner'];
        const tokenAmount0 = data_events[i]['returnValues']['amount0'];
        const tokenAmount1 = data_events[i]['returnValues']['amount1'];
        const totalValue = data_events[i]['returnValues']['amount'];
        
        const blockDetails = await web3.eth.getBlock(data_events[i].blockNumber)
        
        if(blockDetails && blockDetails.timestamp){
            var timestamp = new Date(blockDetails.timestamp * 1000)
        }
        const obj = {
            block_no : data_events[i].blockNumber,
            event_type : data_events[i].event,
            owner_address : ownerAddress,
            transaction_hash : data_events[i].transactionHash,
            total_value : totalValue,
            token_amount0 : tokenAmount0,
            token_amount1 : tokenAmount1,
            contract_address : data_events[i].address,
            transacted_at : timestamp || new Date(),
            pool_id
        }
        poolsActivity.push(obj)
    };
    return poolsActivity
}
export default startEventProcessing;