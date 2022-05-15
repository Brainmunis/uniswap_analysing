import _ from 'lodash';
import wait from '../../lib/wait';
// import * as web3 from '../../lib/web3'
import Web3 from 'web3';
const web3 = new Web3("https://mainnet.infura.io/v3/5b53c456464f4ef384af20b4117bf01d");


import insertMany from '../db_operations/insertMany';

const supportedEvents = [
    "Mint",
    "Burn"
]
const processBlockLimit = 1000;

async function startEventProcessing(contract_address, fromBlock, res){
    const eventPromises = [];
    for(let event of supportedEvents){
        try{
            const contract = getContractInstance(contract_address);
            var eventData = await getEventsData(fromBlock, event, contract);
        }catch(e){
            throw JSON.stringify(e)
        }
        console.log(`Event processing started for contract : ${contract_address} for event : ${event}`)
        if(!eventData || !eventData.length){
            throw "Event data not found."
        }
        const processId = refreshEvents( contract_address, event, eventData)
        eventPromises.push(processId)
    }
    // res.status(200).send({
    //     message : "Event regresh has been started. You can track progress in below API.",
    //     API : "/api/refresh/:contract_address/status"
    // })
    const [perr, status] = await wait(
        Promise.all,
        Promise,
        eventPromises
    )
    if(perr){
        console.log(`Event processing error for contract : ${contract_address}. error : ${JSON.stringify(perr)}`)
    }
    console.log(`Event processing completed for contract : ${contract_address}.`)
}

async function refreshEvents(contract_address, event_type, eventData){
    console.log(`Event processing started for contract : ${contract_address} for event : ${event_type}`)
    
    console.log(`Events data fetched. for contract : ${contract_address} for event : ${event_type}`)
    const constructedResponse = await constructPoolActivityEventDate(eventData);
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
    return contract.getPastEvents(
        eventType, 
        { 
            fromBlock: historical_block, 
            toBlock: 'latest' 
        }
    );
}

async function constructPoolActivityEventDate(data_events){
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
            transacted_at : timestamp || new Date()
        }
        poolsActivity.push(obj)
    };
    return poolsActivity
}
export default startEventProcessing;