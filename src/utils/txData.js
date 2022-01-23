import moment from 'moment';
import axios from 'axios';
import liquidity from '@/pages/Liquidity/models/liquidity';
import {getContract, supportedTokens} from '@/acy-dex-swap/utils'
import {totalInUSD} from '@/utils/utils';
import { BigNumber } from '@ethersproject/bignumber';
import {getAllSuportedTokensPrice} from '@/acy-dex-swap/utils/index';
import { abi as IUniswapV2Router02ABI } from '@/abis/IUniswapV2Router02.json';
import ACYV1ROUTER02_ABI from '@/acy-dex-swap/abis/AcyV1Router02';
import transaction from '@/models/transaction';
import { useConstantLoader, TOKENLIST, METHOD_LIST, ACTION_LIST, RPC_URL, API_URL, MARKET_TOKEN_LIST } from '@/constants';
import { constantInstance } from '@/constants';
import { FEE_PERCENT } from '@/pages/Market/Util';

var Web3 = require('web3');
const FlashArbitrageResultLogs_ABI = ACYV1ROUTER02_ABI[1];
// TODO :: translate to USD

var tokenPriceUSD;

// THIS FUNCTIONS RETURN TOKEN 
export function findTokenInList(item){ // token has address attribute
    const INITIAL_TOKEN_LIST = TOKENLIST();
    let token =  INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.address.toLowerCase());
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0];
}
export function findTokenWithAddress(item){// input is an address 
    const INITIAL_TOKEN_LIST = TOKENLIST();
    let token = INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.toLowerCase() );
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0]
}
export function findTokenWithAddress_market(item){// input is an address 
    const INITIAL_TOKEN_LIST = MARKET_TOKEN_LIST();
    let token = INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.toLowerCase() );
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0]
}
export function findTokenWithSymbol(item){
    const INITIAL_TOKEN_LIST = TOKENLIST();
    let token = INITIAL_TOKEN_LIST.find(token => token.symbol==item);
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0];
}

function saveTxInDB(data){


    let valueSwapped = totalInUSD([
        {
            token : data.inputTokenSymbol,
            amount : parseFloat(data.inputTokenNum)
        }
    ],tokenPriceUSD);


    let feesPaid = totalInUSD([
        {
            token : constantInstance.gasTokenSymbol,
            amount : data.gasFee
        }
    ],tokenPriceUSD);

    try{
        axios
        .post(
            `${API_URL()}/users/swap?address=${data.address}&hash=${data.hash}&valueSwapped=${valueSwapped}&feesPaid=${feesPaid}`
        )
        .then(response => {
          console.log(response.response);
        });
    }catch(e){
        console.log("service not working...")
    }
    // TODO (Gary): Bonus here
    try{
        axios
        .get(
            `${API_URL()}/launch/allocation/bonus?walletId=${data.address}&T=${valueSwapped}&bonusName=swap`
        )
        .then(response => {
          console.log(response.response);
        });
    } catch(e) {
        console.log("failed to allocate bonus, catching error: ", e)
    }
    if (data.outTokenSymbol == 'ACY') {
        try{
            axios
            .get(
                `${API_URL()}/launch/allocation/bonus?walletId=${data.address}&T=${valueSwapped}&bonusName=acy`
            )
            .then(response => {
              console.log(response.response);
            });
        } catch(e) {
            console.log("failed to allocate bonus, catching error: ", e)
        }
    }

}
function addUserToDB(address){
    try{
        axios
        .post(
            `${API_URL()}/users/adduser?address=${address}`
        )
        .then(response => {
          console.log(response.response);
        });
    }catch(e){
        console.log("service not working...")
    }
}

async function fetchUniqueETHToToken (account, hash, timestamp, FROM_HASH, library, gasPrice){
    console.log("fetchUniqueETHToToken",hash);

    const actionList = ACTION_LIST();

    try{

        let response = await library.getTransactionReceipt(hash);
        
        if(!response.status) return {};
        FROM_HASH = response.from.toLowerCase().slice(2);
        let TO_HASH = response.to.toLowerCase().slice(2);
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(TO_HASH));
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        // console.log("pringting data of tx::::::",response,inLogs,outLogs);
        let inToken = findTokenInList(inLogs[0]);
        let outToken =  findTokenInList(outLogs[0]);

        inLogs = inLogs.filter(log => log.address.toLowerCase() == inToken.address.toLowerCase());
        outLogs = outLogs.filter(log => log.address.toLowerCase() == outToken.address.toLowerCase());

        
        // console.log(inToken,outToken);
        // console.log("debug finished");

        let inTokenNumber = 0;
        let outTokenNumber = 0;

        for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
        // inTokenNumber = inTokenNumber.toString();
        for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
        // outTokenNumber = outTokenNumber.toString();         

        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        let gasFee = (gasPrice / (Math.pow(10,18)) )* response.gasUsed.toNumber();

        let totalAmount = totalInUSD([
            {
                token : inToken.symbol,
                amount : parseFloat(inTokenNumber)
            },
        ],tokenPriceUSD);

        // console.log(response);

        return {
            "address" : response.from,
            "hash": hash,
            "action" : 'Swap',
            "totalToken": totalAmount,
            "inputTokenNum": inTokenNumber,
            "inputTokenSymbol": inToken.symbol,
            "outTokenNum": outTokenNumber,
            "outTokenSymbol": outToken.symbol,
            "transactionTime": transactionTime,
            "gasFee" : gasFee
        };

    }catch(e){
        return null;
    }

        
}

async function fetchUniqueTokenToETH(account, hash, timestamp, FROM_HASH, library, gasPrice){

    console.log("fetchUniqueTokenToETH",hash);

    const actionList = ACTION_LIST();

    try {

        let response = await library.getTransactionReceipt(hash);
        
        if(!response.status) return {};
        FROM_HASH = response.from.toLowerCase().slice(2);
        let TO_HASH = response.to.toLowerCase().slice(2);
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));
        let inToken = findTokenInList(inLogs[0]);
        let outToken =  findTokenInList(outLogs[0]);
        let inTokenNumber = 0;
        let outTokenNumber = 0;

        inLogs = inLogs.filter(log => log.address.toLowerCase() == inToken.address.toLowerCase());
        outLogs = outLogs.filter(log => log.address.toLowerCase() == outToken.address.toLowerCase());

        for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
        // inTokenNumber = inTokenNumber.toString();
        for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
        // outTokenNumber = outTokenNumber.toString();
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        let gasFee = (gasPrice / (Math.pow(10,18)) )* response.gasUsed.toNumber();

        let totalAmount = totalInUSD([
            {
                token : inToken.symbol,
                amount : parseFloat(inTokenNumber)
            },
        ],tokenPriceUSD);

        return  {
            "address" : response.from,
            "action" : 'Swap',
            "hash": hash,
            "totalToken": totalAmount,
            "inputTokenNum": inTokenNumber,
            "inputTokenSymbol": inToken.symbol,
            "outTokenNum": outTokenNumber,
            "outTokenSymbol": outToken.symbol,
            "transactionTime": transactionTime,
            "gasFee" : gasFee
        };

    }catch(e){
        return null;

    }

    
}

async function fetchUniqueTokenToToken(account, hash, timestamp, FROM_HASH, library, gasPrice){

    console.log("fetchUniqueTokenToToken",hash);

    const actionList = ACTION_LIST();

    try{
    
        let response = await library.getTransactionReceipt(hash);
        FROM_HASH = response.from.toLowerCase().slice(2);
        if(!response.status) return {};
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
    
        let inToken = findTokenInList(inLogs[0]);
        let outToken =  findTokenInList(outLogs[0]);
    
        let inTokenNumber = 0;
        let outTokenNumber = 0;

        inLogs = inLogs.filter(log => log.address.toLowerCase() == inToken.address.toLowerCase());
        outLogs = outLogs.filter(log => log.address.toLowerCase() == outToken.address.toLowerCase());
    
        for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
        // inTokenNumber = inTokenNumber.toString();
        for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
        // outTokenNumber = outTokenNumber.toString();
    
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');
    
        let gasFee = (gasPrice / (Math.pow(10,18)) )* response.gasUsed.toNumber();
    
        let totalAmount = totalInUSD([
            {
                token : inToken.symbol,
                amount : parseFloat(inTokenNumber)
            },
        ],tokenPriceUSD);
    
        return {
            "address" : response.from,
            "hash": hash,
            "action" : 'Swap',
            "totalToken": totalAmount,
            "inputTokenNum": inTokenNumber,
            "inputTokenSymbol": inToken.symbol,
            "outTokenNum": outTokenNumber,
            "outTokenSymbol": outToken.symbol,
            "transactionTime": transactionTime,
            "gasFee" : gasFee
        }

    }catch(e){
        return null;
    }
    
}

async function fetchUniqueAddLiquidity(account, hash, timestamp, FROM_HASH, library){

    console.log("fetchUniqueAddLiquidity",hash);

    const actionList = ACTION_LIST();

    try {

        let response = await library.getTransactionReceipt(hash);
        FROM_HASH = response.from.toLowerCase().slice(2);
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let tokensOut = new Set();
        for(let log of outLogs){
            tokensOut.add(log.address);
        }
         
        tokensOut = Array.from(tokensOut);

        let logsToken1 = outLogs.filter(log => log.address==tokensOut[0]);
        let logsToken2 = outLogs.filter(log => log.address==tokensOut[1]);

        let token1 = findTokenInList(logsToken1[0]);
        let token2 =  findTokenInList(logsToken2[0]);

        let token1Number = 0;
        for(let log of logsToken1){
            if(log.address.toLowerCase() == token1.address.toLowerCase()) token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))
        };
        // console.log(token1Number);
        // token1Number = token1Number.toString();
        let token2Number = 0;
        for(let log of logsToken2){
            if(log.address.toLowerCase() == token2.address.toLowerCase()) token2Number += (log.data / Math.pow(10, token2.decimals))
        };
        // token2Number = token2Number.toString();
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        let totalAmount = totalInUSD([
            {
                token : token1.symbol,
                amount : parseFloat(token1Number)
            },
            {
                token : token2.symbol,
                amount : parseFloat(token2Number)
            }
        ],tokenPriceUSD);

        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Add',
        "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })

    }catch (e){
        console.log(e);
        return null;
    }
    

            
}
        
export async function fetchUniqueRemoveLiquidity(account, hash, timestamp, FROM_HASH, library){

    console.log("fetchUniqueRemoveLiquidity",hash);

    const actionList = ACTION_LIST();

    try {

        let response = await library.getTransactionReceipt(hash);
        FROM_HASH = response.from.toLowerCase().slice(2);
        // console.log('filtered data',response);
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        // console.log('filtered logs',outLogs);
        let tokensIn = new Set();
        for(let log of inLogs){
            tokensIn.add(log.address);
        }
        // console.log(tokensIn);
        tokensIn = Array.from(tokensIn);
        // console.log('set',tokensIn);

        let logsToken1 = inLogs.filter(log => log.address==tokensIn[0]);
        let logsToken2 = inLogs.filter(log => log.address==tokensIn[1]);

        let token1 = findTokenInList(logsToken1[0]);
        let token2 =  findTokenInList(logsToken2[0]);

        let token1Number = 0;
        for(let log of logsToken1){token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))};
        // token1Number = token1Number.toString();
        let token2Number = 0;
        for(let log of logsToken2){token2Number += (log.data / Math.pow(10, token2.decimals))};
        // token2Number = token2Number.toString();

        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        let totalAmount = totalInUSD([
            {
                token : token1.symbol,
                amount : parseFloat(token1Number)
            },
            {
                token : token2.symbol,
                amount : parseFloat(token2Number)
            }
        ],tokenPriceUSD);

        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Remove',
        "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })
    }catch (e){
        console.log(e)
        return null;
    }
    
}

export async function fetchUniqueAddLiquidityEth(account, hash, timestamp, FROM_HASH, library){
    console.log("fetchUniqueAddLiquidityEth",hash);

    const actionList = ACTION_LIST();

    try{

        let response = await library.getTransactionReceipt(hash);
        let TO_HASH = response.to.toLowerCase().slice(2);
        FROM_HASH = response.from.toLowerCase().slice(2);
        let logsToken1 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
        let logsToken2 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(TO_HASH));
    
        let token1 = findTokenInList(logsToken1[0]);
        let token2 =  findTokenInList(logsToken2[0]);
    
        let token1Number = 0;
        for(let log of logsToken1){token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))};
        // token1Number = token1Number.toString();
        let token2Number = 0;
        for(let log of logsToken2){token2Number += (log.data / Math.pow(10, token2.decimals))};
        // token2Number = token2Number.toString();
    
        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');
    
        let totalAmount = totalInUSD([
            {
                token : token1.symbol,
                amount : parseFloat(token1Number)
            },
            {
                token : token2.symbol,
                amount : parseFloat(token2Number)
            }
        ],tokenPriceUSD);
    
        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Add',
        "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })

    }catch (e){
        console.log(e);
        return null;
    }

}

export async function fetchUniqueRemoveLiquidityEth(account, hash, timestamp, FROM_HASH, library){

    console.log("fetchUniqueRemoveLiquidityEth",hash);

    const actionList = ACTION_LIST();

    try {

        let response = await library.getTransactionReceipt(hash);
        let TO_HASH = response.to.toLowerCase().slice(2);
        FROM_HASH = response.from.toLowerCase().slice(2);
        let logsToken1 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        let logsToken2 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));

        let token1 = findTokenInList(logsToken1[0]);
        let token2 =  findTokenWithSymbol(constantInstance.gasTokenSymbol);


        console.log(token1,token2,logsToken1,logsToken2);

        let token1Number = 0;
        for(let log of logsToken1){
            if(log.address.toLowerCase() == token1.address.toLowerCase()) token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))
        };

        let token2Number = 0;
        for(let log of logsToken2){
            if(log.address.toLowerCase() == token2.address.toLowerCase()) token2Number += (log.data / Math.pow(10, token2.decimals))
        };

        let now = Date.now();
        let transactionTime ;
        if(timestamp) transactionTime = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
        else transactionTime = moment(now).format('YYYY-MM-DD HH:mm:ss');

        let totalAmount = totalInUSD([
            {
                token : token1.symbol,
                amount : parseFloat(token1Number)
            },
            {
                token : token2.symbol,
                amount : parseFloat(token2Number)
            }
        ],tokenPriceUSD);

        return ({
        "address" : response.from,
        "hash": hash,
        "action":'Remove',
        "totalToken": totalAmount,
        "token1Number": token1Number,
        "token1Symbol": token1.symbol,
        "token2Number": token2Number,
        "token2Symbol": token2.symbol,
        "transactionTime": transactionTime
        })        
    }catch(e){
        console.log(e);
        return null;
    }

}
export async function appendNewSwapTx(currList,receiptHash,account,library){

    const methodList = METHOD_LIST();


    // console.log("printing curr...", currList);

    if(currList.length > 0 && currList[0].hash.toLowerCase() == receiptHash.toLowerCase()) return currList;

    let FROM_HASH = account.toString().toLowerCase().slice(2);
    let TO_HASH;

    let transaction = await library.getTransaction(receiptHash);
    let gasPrice = transaction.gasPrice.toNumber();


    let newData;
    
    if(transaction.data.startsWith(methodList.ethToToken.id) || transaction.data.startsWith(methodList.ethToExactToken.id) || transaction.data.startsWith(methodList.ethToTokenArb.id) || transaction.data.startsWith(methodList.ethToExactTokenArb.id)){

        console.log("adding eth to token");
        newData = await fetchUniqueETHToToken(account, receiptHash,null,FROM_HASH, library, gasPrice);
        

    }else if(transaction.data.startsWith(methodList.tokenToEth.id) || transaction.data.startsWith(methodList.tokenToEthArb.id) || transaction.data.startsWith(methodList.tokenToExactEth.id) || transaction.data.startsWith(methodList.tokenToExactEthArb.id)){
        console.log("adding token to eth");
        newData  = await fetchUniqueTokenToETH(account, receiptHash,null,FROM_HASH, library, gasPrice);
        
    }else if(transaction.data.startsWith(methodList.tokenToToken.id) || transaction.data.startsWith(methodList.tokenToTokenArb.id) || transaction.data.startsWith(methodList.tokenToExactTokenArb.id) || transaction.data.startsWith(methodList.tokenToExactToken.id)){
        console.log("addding normal token to token");
        newData = await fetchUniqueTokenToToken(account,receiptHash,null,FROM_HASH, library, gasPrice);
    }
    else {
        return currList;
    }

    if(newData.address) saveTxInDB(
        {
            ...newData

        }
    );

    let temp = [];
    if(newData)temp.push(newData);
    temp.push(...currList);

    return temp;

}

export async function appendNewLiquidityTx(currList,receiptHash,account,library){

    const methodList = METHOD_LIST();

    if(currList.length > 0 && currList[0].hash.toLowerCase() == receiptHash.toLowerCase()) return currList;

    let FROM_HASH = account.toString().toLowerCase().slice(2);
    let TO_HASH;

    let transaction = await library.getTransaction(receiptHash);


    let newData;
    
    if(transaction.data.startsWith(methodList.addLiquidity.id)){

        console.log("adding eth to token");
        newData = await fetchUniqueAddLiquidity(account, receiptHash,null,FROM_HASH, library);
        

    }else if(transaction.data.startsWith(methodList.removeLiquidity.id)){
        console.log("adding eth to token");
        newData = await fetchUniqueRemoveLiquidity(account, receiptHash,null,FROM_HASH, library);
        
    }else if(transaction.data.startsWith(methodList.removeLiquidityETH.id)){
        console.log("adding eth to token");
        newData = await fetchUniqueRemoveLiquidityEth(account, receiptHash,null,FROM_HASH, library);
    }else{
        console.log("adding eth to token");
        newData = await fetchUniqueAddLiquidityEth(account, receiptHash,null,FROM_HASH, library);
    }

    if(account) addUserToDB(account.toString());

    let temp = [];
    if(newData)temp.push(newData);
    temp.push(...currList);

    return temp;
}
export async function parseTransactionData (fetchedData,account,library,filter) {

    const methodList = METHOD_LIST();

    if(filter == 'SWAP'){


        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
        fetchedData = fetchedData.filter(item => item.txreceipt_status == 1);

        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToToken.id) || item.input.startsWith(methodList.tokenToTokenArb.id) || item.input.startsWith(methodList.tokenToExactToken.id) || item.input.startsWith(methodList.tokenToExactTokenArb.id));
        let newData = [];

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(item.input.startsWith(methodList.tokenToTokenArb.id)) fetchedItem['FA']=true;
            if(fetchedItem) newData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.ethToToken.id) || item.input.startsWith(methodList.ethToExactToken.id) || item.input.startsWith(methodList.ethToTokenArb.id) || item.input.startsWith(methodList.ethToExactTokenArb.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueETHToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(item.input.startsWith(methodList.ethToTokenArb.id)) fetchedItem['FA']=true;
            if(fetchedItem) newData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToEth.id) || item.input.startsWith(methodList.tokenToEthArb.id) || item.input.startsWith(methodList.tokenToExactEth.id) || item.input.startsWith(methodList.tokenToExactEthArb.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToETH(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(item.input.startsWith(methodList.tokenToEthArb.id)) fetchedItem['FA']=true;
            if(fetchedItem) newData.push(fetchedItem);
        }

        
        return newData;
    }
    else if (filter == 'LIQUIDITY') {
        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
        fetchedData = fetchedData.filter(item => item.txreceipt_status == 1);
        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.addLiquidity.id));
        let newData = [];

        for (let item of filteredData) {

            let fetchedItem = await fetchUniqueAddLiquidity(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) newData.push(fetchedItem);

        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.addLiquidityEth.id));
            
        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueAddLiquidityEth(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) newData.push(fetchedItem);

        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.removeLiquidity.id) || item.input.startsWith(methodList.removeLiquidityWithPermit.id));
        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueRemoveLiquidity(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) newData.push(fetchedItem);
            
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.removeLiquidityETHwithPermit.id) || item.input.startsWith(methodList.removeLiquidityETH.id));

        for (let item of filteredData) {

            let fetchedItem = await fetchUniqueRemoveLiquidityEth(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) newData.push(fetchedItem);

        }
        return newData;
    }
    else if ( filter == "ALL"){

        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
        fetchedData = fetchedData.filter(item => item.txreceipt_status == 1);

        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToToken.id) || item.input.startsWith(methodList.tokenToTokenArb.id) || item.input.startsWith(methodList.tokenToExactToken.id) || item.input.startsWith(methodList.tokenToExactTokenArb.id));
        let swapData = [];
        let liquidityData =[];

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(fetchedItem) swapData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.ethToToken.id) || item.input.startsWith(methodList.ethToExactToken.id) || item.input.startsWith(methodList.ethToTokenArb.id) || item.input.startsWith(methodList.ethToExactTokenArb.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueETHToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(fetchedItem) swapData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToEth.id) || item.input.startsWith(methodList.tokenToEthArb.id) || item.input.startsWith(methodList.tokenToExactEth.id) || item.input.startsWith(methodList.tokenToExactEthArb.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToETH(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(fetchedItem) swapData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.addLiquidity.id));

        for (let item of filteredData) {

            let fetchedItem = await fetchUniqueAddLiquidity(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) liquidityData.push(fetchedItem);

        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.addLiquidityEth.id));
            
        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueAddLiquidityEth(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) liquidityData.push(fetchedItem);

        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.removeLiquidity.id) || item.input.startsWith(methodList.removeLiquidityWithPermit.id));
        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueRemoveLiquidity(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) liquidityData.push(fetchedItem);
            
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.removeLiquidityETHwithPermit.id) || item.input.startsWith(methodList.removeLiquidityETH.id));

        for (let item of filteredData) {

            let fetchedItem = await fetchUniqueRemoveLiquidityEth(account, item.hash,item.timeStamp,FROM_HASH, library);
            if(fetchedItem) liquidityData.push(fetchedItem);

        }
        return [swapData,liquidityData];

    }
    
    return [];
  }
export async function getTransactionsByAccount (account,library,filter){
    let newData = [];
    let SCAN_API = constantInstance.scanAPIPrefix;
    console.log("printing constant instance,,,, ",constantInstance);
    if(account){
        tokenPriceUSD = await getAllSuportedTokensPrice();
        try{
        let address =  account.toString();
        // let apikey = 'H2W1JHHRFB5H7V735N79N75UVG86E9HFH2';
        let offset=filter=='ALL'? '50':'50'; // NUMBER OF RESULTS FETCHED FROM ETHERSCAN
        console.log("printing API endpoint", SCAN_API);
        console.log("printing gas token symbol", constantInstance.gasTokenSymbol);
        let request = `${SCAN_API.scanUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${offset}&sort=desc&apikey=${SCAN_API.APIKey}`;
        console.log("trying to fethc data for:", request);

        let response = await fetch(request);
        let data = await response.json();

        // console.log("got this tx data", data.result);


        let newData = await parseTransactionData(data.result,account,library,filter);
        
        return newData;
        }
        catch(e) {
            console.log(e);
            return [];
        }
        
    }
    return [];
}
function getChartData (data){

    let amm = data.AMMOutput;
    let revenue = data.FAOutput - amm;
    
    return{
        "acy_output" : data.FAOutput,
        "amm_output" : amm,
        "flash_revenue" : revenue,
        "acy_treasury": revenue * 0.6,
        "trading_fee" : 0,
    }
}

// Pass in start of the path.
function getTransferLogPath(transferLogs, pathList, fromAddress, destAddress) {
    const web3 = new Web3(RPC_URL());
    const transferLog = transferLogs.find(item => fromAddress == (web3.eth.abi.decodeParameter("address", item.topics[1])).toLowerCase());
    if (transferLog == null) {
        return null
    }
    const transferToAddress = (web3.eth.abi.decodeParameter("address", transferLog.topics[2])).toLowerCase();
    pathList.push(transferLogs.indexOf(transferLog));
    if (transferToAddress == destAddress) {
        return pathList;
    } 
    // else {
    //     console.log("transferLog", transferLog);
    // }
    pathList = getTransferLogPath(transferLogs, pathList, transferToAddress, destAddress);
    // console.log("pathList:", pathList);
    return pathList;
}

function decodeFinalLog(log, from, to, transferLogs ,input){

    const methodList = METHOD_LIST();

    //settting from and to ::::
    if(input.startsWith(methodList.tokenToTokenArb.id)){
        from = from;
        to = to;
    } else if(input.startsWith(methodList.tokenToExactTokenArb.id)){
        from = from;
        to = from;
    }else if(input.startsWith(methodList.ethToExactTokenArb.id)){
        let temp = from;
        from = to;
        to = temp;
    }else if (input.startsWith(methodList.ethToTokenArb.id)){
        from = to;
        to = to;
    }else if (input.startsWith(methodList.tokenToEthArb.id)){
        from = from;
        to = to;
    }

    let i = 0;
    let length = log.data.length;
    let data = log.data.slice(2);
    let inputList = [];

    while(i + 64 <= length){
        inputList.push( data.substring(i,i+64));
        i = i+64;
    }

    let num_path = parseInt(inputList[5],16);
    let pathTokens = inputList.slice(6,6+num_path);
    let pathAmmounts = inputList.slice(6+num_path + 1, 6+ 2*num_path + 1);

    from = from.slice(2);
    to = to.slice(2);
    let sourceToken = transferLogs.find(item=>item.topics[1].toLowerCase().includes(from.toLowerCase())).address;
    let destToken = transferLogs.find(item=> item.topics[2].toLowerCase().includes(to.toLowerCase())).address;

    sourceToken = findTokenWithAddress(sourceToken);
    destToken = findTokenWithAddress(destToken);

    let k = 0;

    let routes = [];

    for(let j = 0 ; j < num_path ; j++){
        let route = {};
        route['token1'] = findTokenWithAddress(transferLogs[k].address).symbol;
        route['token1Num'] = transferLogs[k].data / Math.pow(10, findTokenWithAddress(transferLogs[k].address).decimals);

        k++;
        
        if(!pathTokens[j].toLowerCase().includes(destToken.address.toLowerCase().slice(2))){
            route['token2'] = findTokenWithAddress(transferLogs[k].address).symbol;
            route['token2Num'] = transferLogs[k].data / Math.pow(10, findTokenWithAddress(transferLogs[k].address).decimals);
            route['logoURI'] = findTokenWithAddress(transferLogs[k].address).logoURI; 
            k++;
        }else{

            route['token2'] = null;
            route['token2Num'] = null;

        }
        route['token3'] = findTokenWithAddress(transferLogs[k].address).symbol;
        route['token3Num'] = transferLogs[k].data / Math.pow(10, findTokenWithAddress(transferLogs[k].address).decimals);
        k++;
        console.log(route);
        routes.push(route);
    }
    console.log(routes);

    return [routes, `0x${inputList[3]}` / Math.pow(10, destToken.decimals), `0x${inputList[4]}` / Math.pow(10, destToken.decimals)];

}

//below code is used for transaction detail page

export async function fetchTransactionData(address,library){

    tokenPriceUSD = await getAllSuportedTokensPrice();
    const web3 = new Web3(RPC_URL());
    let SCAN_API = constantInstance.scanAPIPrefix.scanUrl;
    let GAS_TOKEN = constantInstance.gasTokenSymbol;
    const actionList = ACTION_LIST();
    const methodList = METHOD_LIST();

    const txReceipt = await library.getTransactionReceipt(address.toString());
    const transactionData = await library.getTransaction(address.toString());

    console.log(txReceipt);
    console.log(transactionData);

    const from = (transactionData.from).toLowerCase();
    const to = (transactionData.to).toLowerCase();

    //parse ROUTES  and AMM Output

    const [routes,amm_output,dist_output] = decodeFinalLog(
        txReceipt.logs[txReceipt.logs.length-1],
        from , 
        to, 
        txReceipt.logs.filter(item=>item.topics.length > 2 && item.topics[0].includes(actionList.transfer.hash)),
        transactionData.data);
    
    console.log("found routes", routes);
    //get GAS PRICE and symbol
    // let priceRequest = '';
    // let gasPrice;
    // if(GAS_TOKEN == 'BNB'){
    //     priceRequest = SCAN_API + '?module=stats&action=bnbprice';
    //     priceRequest = await fetch(priceRequest);
    //     gasPrice = await priceRequest.json();
    //     gasPrice = gasPrice.result.ethusd;
    // }else if( GAS_TOKEN == 'MATIC'){
    //     priceRequest = SCAN_API + '?module=stats&action=maticprice';
    //     priceRequest = await fetch(priceRequest);
    //     gasPrice = await priceRequest.json();
    //     gasPrice = gasPrice.result.maticusd;
    // }else {
    //     console.log("GAS NOT DEFINED YET");
    // }

    let gasUsed = txReceipt.gasUsed * transactionData.gasPrice.toNumber() / Math.pow(10, findTokenWithSymbol(GAS_TOKEN).decimals) ; //expressed in BNB
    console.log(gasUsed);

    // calculate total amounts of TX

    let totalIn = 0;
    routes.forEach(element => {
        totalIn += element.token1Num;
    });

    let totalOut = 0;
    routes.forEach(element => {
        totalOut += element.token3Num;
    });
    
    let inToken = findTokenWithSymbol(routes[0].token1);
    let outToken = findTokenWithSymbol(routes[0].token3);
    // calculate trading fee

    let trading_fee = totalInUSD([
        {
            token : inToken.symbol,
            amount : totalIn * FEE_PERCENT
        },
    ],tokenPriceUSD);

    // temporary fix for dist_output AKA trader output/treasury

    let new_dist = (totalOut - amm_output) * .5;

    return {
        'token1' : inToken,
        'token2' : outToken,
        'totalIn' : totalIn,
        'totalOut' : totalOut,
        'routes' : routes,
        'gasFee' : gasUsed,
        'gasFeeUSD' : totalInUSD([
            {
                token : GAS_TOKEN,
                amount : gasUsed
            },
        ],tokenPriceUSD),
        'amm_output': amm_output,
        'acy_treasury': totalOut - amm_output - new_dist,
        'trader_treasury': new_dist,
        'gas_symbol' : GAS_TOKEN,
        'trading_fee' : trading_fee,
        'trader_final' : new_dist + amm_output,
        'trader_finalUSD' : totalInUSD([
            {
                token : outToken.symbol,
                amount : new_dist + amm_output
            }
        ],tokenPriceUSD)

    }

    // try{
    //     const apikey = 'H2W1JHHRFB5H7V735N79N75UVG86E9HFH2';

    //     const transactionData = await library.getTransaction(address.toString());
    //     const sourceAddress = (transactionData.from).toLowerCase();
    //     const destAddress = (transactionData.to).toLowerCase();
    //     // console.log("transactionData", transactionData);
    //     // console.log(sourceAddress, destAddress);

    //     // this code is used to get METHOD ID
    //     // for (let i = 0; i < ACYV1ROUTER02_ABI.length; i ++) {
    //     //     console.log(ACYV1ROUTER02_ABI[i]["name"]);
    //     //     console.log(web3.eth.abi.encodeFunctionSignature(ACYV1ROUTER02_ABI[i]));
    //     // }

    //     const methodUsed = Object.keys(methodList).find(key => transactionData.data.startsWith(methodList[key].id));
    //     console.log("methodUsed", methodUsed);
        
    //     if (Object.keys(methodList).includes(methodUsed)) {
    //         const methodUsedABI = ACYV1ROUTER02_ABI.find(item => item.name == methodList[methodUsed].name)
    //         const parsedInputData = "0x" + transactionData.data.substring(10, transactionData.data.length);
    //         const txnDataDecoded = web3.eth.abi.decodeParameters(methodUsedABI.inputs, parsedInputData);
    //         console.log("txnDataDecoded", txnDataDecoded);
    //         const fromTokenAddress = txnDataDecoded.path[0];
    //         const toTokenAddress = txnDataDecoded.path[1];
            
    //         // parsing loggings
    //         const response = await library.getTransactionReceipt(address.toString());
    //         // console.log("Response: ",response);
    //         const gasFee = (transactionData.gasPrice.toNumber() / (Math.pow(10,18)) ) * response.gasUsed.toNumber()
    //         const FlashArbitrageResult_Log = response.logs[response.logs.length-1];
    //         const FlashArbitrageResultLogs_ABI = ACYV1ROUTER02_ABI.find(item => item.name == 'FlashArbitrageResultLogs');
    //         const txnReceiptDecoded = web3.eth.abi.decodeLog(
    //             FlashArbitrageResultLogs_ABI.inputs, 
    //             FlashArbitrageResult_Log.data, 
    //             FlashArbitrageResult_Log.topics
    //             )
    //         // console.log("txnReceiptDecoded", txnReceiptDecoded);
            
    //         /**
    //          * Parse transfer logs
    //          * 1. find all the routes from sourceAddress to destAddress
    //          * */
    //         const transferLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0] == actionList.transfer.hash);
    //         // console.log("transferLogs", transferLogs);
    //         const routes_loglists = [];
    //         if (methodList[methodUsed].name === methodList.tokenToTokenArb.name) {
    //             // console.log("method: swapExactTokensForTokensByArb")
    //             for (let i = 0; i < transferLogs.length; i ++) {
    //                 let transferFromAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[1])).toLowerCase();
    //                 let transferToAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[2])).toLowerCase();
    //                 if (transferFromAddress == sourceAddress) {
    //                     let pathList = [i];
    //                     let path = getTransferLogPath(transferLogs, pathList, transferToAddress, destAddress);
    //                     if (path != null) {
    //                         routes_loglists.push(path);
    //                     }
    //                 }
    //             } 
    //         } else if (methodList[methodUsed].name === methodList.ethToTokenArb.name) {
    //             // console.log("method: swapExactETHForTokensByArb")
    //             for (let i = 0; i < transferLogs.length; i++) {
    //                 let transferFromAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[1])).toLowerCase();
    //                 let transferToAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[2])).toLowerCase();
    //                 if (transferFromAddress == destAddress) {
    //                     let pathList = [i];
    //                     let path = getTransferLogPath(transferLogs, pathList, transferToAddress, destAddress);
    //                     if (path != null) {
    //                         routes_loglists.push(path);
    //                     }
    //                 }
    //             } 
    //         } else if (methodList[methodUsed].name === methodList.tokenToEthArb.name) {
    //             // console.log("method: swapExactTokensForETHByArb")
    //             for (let i = 0; i < transferLogs.length; i++) {
    //                 let transferFromAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[1])).toLowerCase();
    //                 let transferToAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[2])).toLowerCase();
    //                 if (transferFromAddress == sourceAddress) {
    //                     let pathList = [i];
    //                     let path = getTransferLogPath(transferLogs, pathList, transferToAddress, destAddress);
    //                     if (path != null) {
    //                         routes_loglists.push(path);
    //                     }
    //                 }
    //             }
    //         } else if (methodList[methodUsed].name === methodList.tokenToExactTokenArb.name) {
    //             // console.log("method: swapTokensForExactTokensByArb")
    //             for (let i = 0; i < transferLogs.length; i++) {
    //                 let transferFromAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[1])).toLowerCase();
    //                 let transferToAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[2])).toLowerCase();
    //                 if (transferFromAddress == sourceAddress) {
    //                     let pathList = [i];
    //                     let path = getTransferLogPath(transferLogs, pathList, transferToAddress, sourceAddress);
    //                     if (path != null) {
    //                         routes_loglists.push(path);
    //                     }
    //                 }
    //             }
    //         } else if (methodList[methodUsed].name === methodList.ethToExactTokenArb.name) {
    //             // console.log("method: swapETHForExactTokensByArb")
    //             for (let i = 0; i < transferLogs.length; i++) {
    //                 let transferFromAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[1])).toLowerCase();
    //                 let transferToAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[2])).toLowerCase();
    //                 if (transferFromAddress == destAddress) {
    //                     let pathList = [i];
    //                     let path = getTransferLogPath(transferLogs, pathList, transferToAddress, sourceAddress);
    //                     if (path != null) {
    //                         routes_loglists.push(path);
    //                     }
    //                 }
    //             }
    //         } else if (methodList[methodUsed].name === methodList.tokenToExactEthArb.name) {
    //             // console.log("method: swapTokensForExactETHByArb")
    //             for (let i = 0; i < transferLogs.length; i++) {
    //                 let transferFromAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[1])).toLowerCase();
    //                 let transferToAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[2])).toLowerCase();
    //                 if (transferFromAddress == sourceAddress) {
    //                     let pathList = [i];
    //                     let path = getTransferLogPath(transferLogs, pathList, transferToAddress, destAddress);
    //                     if (path != null) {
    //                         routes_loglists.push(path);
    //                     }
    //                 }
    //             }
    //         } else {
    //             console.log("no method matched")
    //         }


    //         // console.log("routes_loglists", routes_loglists);

    //         /**
    //          * Parse the routes_loglists into frontend readable data
    //          */
    //         let routes = []
    //         let totalIn = 0;
    //         let totalOut = 0;
    //         let token1 = null;
    //         let token2 = null;
    //         let token3 = null;
    //         const INITIAL_TOKEN_LIST = TOKENLIST();
    //         for (const path of routes_loglists) {
    //             token1 = INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[0]].address.toLowerCase());
    //             token2 = null;
    //             let amount1 = (transferLogs[path[0]].data / Math.pow(10, token1.decimals)); 
    //             let amount2 = null;
    //             let amount3 = null;
    //             // direct path
    //             if (path.length == 2) {
    //                 token3 = token3 == null ? INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[1]].address.toLowerCase()) : token3;
    //                 amount3 = (transferLogs[path[1]].data / Math.pow(10, token3.decimals)); 
    //                 // console.log(token1, token3);
    //                 routes.push({
    //                     "token1": token1.symbol,
    //                     "token2": null,
    //                     "token3": token3.symbol,
    //                     "token1Num": amount1,
    //                     "token2Num": null,
    //                     "token3Num": amount3,
    //                     "logoURI": null
    //                 })
    //             } 
    //             // routed path
    //             else {
    //                 token2 = INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[1]].address.toLowerCase());
    //                 token3 = token3 == null ? INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[2]].address.toLowerCase()) : token3;
    //                 amount2 = (transferLogs[path[1]].data / Math.pow(10, token2.decimals)); 
    //                 amount3 = (transferLogs[path[2]].data / Math.pow(10, token3.decimals)); 
    //                 // console.log(token1, token2, token3);
    //                 routes.push({
    //                     "token1": token1.symbol,
    //                     "token2": token2.symbol,
    //                     "token3": token3.symbol,
    //                     "token1Num": amount1,
    //                     "token2Num": amount2,
    //                     "token3Num": amount3,
    //                     "logoURI": token2.logoURI
    //                 })
    //             }
    //             totalIn += amount3;
    //             totalOut += amount1;
    //         }

    //         // let requestPrice = API()+'?module=stats&action=bnbprice&apikey='+apikey;
    //         // let responsePrice = await fetch(requestPrice);
    //         // let ethPrice = await responsePrice.json();
    //         // ethPrice = parseFloat(ethPrice.result.ethusd);

    //         // console.log("fetching ethprice",ethPrice);
    //         // console.log("txnReceiptDecoded.AMMOutput", txnReceiptDecoded.AMMOutput);
    //         // console.log("txnReceiptDecoded.FAOutput", txnReceiptDecoded.FAOutput);
    //         // console.log("txnReceiptDecoded.userDistributionAmount", txnReceiptDecoded.userDistributionAmount);

    //         const newData = {
    //             "routes" : routes,
    //             "totalIn" : totalIn,
    //             "totalOut" : totalOut,
    //             "gasFee" : gasFee,
    //             "token1" : token1,
    //             "token2" : token3,
    //             "ethPrice" : 0,
    //             "AMMOutput": (Math.floor(txnReceiptDecoded.AMMOutput) / Math.pow(10, token3.decimals)), // this number is actually too large for integer, so it doesnt convert the string to int completely, but its enough for frontend showcase, wont be effecting the result.
    //             "FAOutput": (Math.floor(txnReceiptDecoded.FAOutput) / Math.pow(10, token3.decimals)),
    //             "userDistributionAmount": (Math.floor(txnReceiptDecoded.userDistributionAmount) / Math.pow(10, token3.decimals))
    //         }
    //         // console.log("newData", newData);

    //         let chartData = getChartData(newData);
    //         newData.chartData = chartData;
    //         return newData;
    //     } else if(transactionData.data.startsWith(methodList.addLiquidity.id)){

    //     } else if(transactionData.data.startsWith(methodList.addLiquidityEth.id)){

    //     } else if(transactionData.data.startsWith(methodList.removeLiquidity.id)){

    //     } else if(transactionData.data.startsWith(methodList.removeLiquidityETH.id)){

    //     } else {
    //         console.log("Transaction not parseable");
    //     }

    // } catch (e){
    //     console.log(e);
    // }
    // return {};
}