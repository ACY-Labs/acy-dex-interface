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
import ConstantLoader from '@/constants';
const INITIAL_TOKEN_LIST = ConstantLoader().tokenList;
const methodList = ConstantLoader().methodMap;
const actionList = ConstantLoader().actionMap;
const apiUrlPrefix = ConstantLoader().farmSetting.API_URL;

// THIS FUNCTIONS RETURN TOKEN 
export function findTokenInList(item){ // token has address attribute
    let token =  INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.address.toLowerCase());
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0];
}
export function findTokenWithAddress(item){// input is an address 
    let token = INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.toLowerCase() );
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0]
}

export function findTokenWithSymbol(item){
    let token = INITIAL_TOKEN_LIST.find(token => token.symbol==item);
    if(token) return token;
    else return INITIAL_TOKEN_LIST[0];
}

var Web3 = require('web3');
const API = 'https://api.bscscan.com/api';
const BSC_MAINNET_RPC = "https://bsc-dataseed.binance.org/";
var web3 = new Web3(BSC_MAINNET_RPC);
const FlashArbitrageResultLogs_ABI = ACYV1ROUTER02_ABI[1];
// TODO :: translate to USD

var tokenPriceUSD;

function saveTxInDB(data){

    let valueSwapped = totalInUSD([
        {
            token : data.inputTokenSymbol,
            amount : parseFloat(data.inputTokenNum)
        },
        {
            token : data.outTokenSymbol,
            amount : parseFloat(data.outTokenNum)
        }
    ],tokenPriceUSD);


    let feesPaid = totalInUSD([
        {
            token : 'BNB',
            amount : data.gasFee
        }
    ],tokenPriceUSD);

    try{
        axios
        .post(
          `${apiUrlPrefix}/users/swap?address=${data.address}&hash=${data.hash}&valueSwapped=${valueSwapped}&feesPaid=${feesPaid}`
        )
        .then(response => {
          console.log(response.response);
        });
    }catch(e){
        console.log("service not working...")
    }

}
function addUserToDB(address){
    try{
        axios
        .post(
            // `http://localhost:3001/api/users/adduser?address=${address}`
          `${apiUrlPrefix}/users/adduser?address=${address}`
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
    console.log("Debugging hereeeeeeee:::::::::::")

    try{

        let response = await library.getTransactionReceipt(hash);
        
        if(!response.status) return {};
        FROM_HASH = response.from.toLowerCase().slice(2);
        let TO_HASH = response.to.toLowerCase().slice(2);
        let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(TO_HASH));
        let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        console.log("pringting data of tx::::::",response,inLogs,outLogs);
        let inToken = findTokenInList(inLogs[0]);
        let outToken =  findTokenInList(outLogs[0]);

        inLogs = inLogs.filter(log => log.address.toLowerCase() == inToken.address.toLowerCase());
        outLogs = outLogs.filter(log => log.address.toLowerCase() == outToken.address.toLowerCase());

        
        console.log(inToken,outToken);
        console.log("debug finished");

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

    try {

        let response = await library.getTransactionReceipt(hash);
        let TO_HASH = response.to.toLowerCase().slice(2);
        FROM_HASH = response.from.toLowerCase().slice(2);
        let logsToken1 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
        let logsToken2 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));

        let token1 = findTokenInList(logsToken1[0]);
        let token2 =  findTokenWithSymbol('BNB');


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


    // console.log("printing curr...", currList);

    if(currList.length > 0 && currList[0].hash.toLowerCase() == receiptHash.toLowerCase()) return currList;

    let FROM_HASH = account.toString().toLowerCase().slice(2);
    let TO_HASH;

    let transaction = await library.getTransaction(receiptHash);
    let gasPrice = transaction.gasPrice.toNumber();


    let newData;
    
    if(transaction.data.startsWith(methodList.ethToToken.id) || transaction.data.startsWith(methodList.ethToExactToken.id) || transaction.data.startsWith(methodList.ethToTokenAbr.id) || transaction.data.startsWith(methodList.ethToExactTokenAbr.id)){

        console.log("adding eth to token");
        newData = await fetchUniqueETHToToken(account, receiptHash,null,FROM_HASH, library, gasPrice);
        

    }else if(transaction.data.startsWith(methodList.tokenToEth.id) || transaction.data.startsWith(methodList.tokenToEthAbr.id) || transaction.data.startsWith(methodList.tokenToExactEth.id) || transaction.data.startsWith(methodList.tokenToExactEthAbr.id)){
        console.log("adding token to eth");
        newData  = await fetchUniqueTokenToETH(account, receiptHash,null,FROM_HASH, library, gasPrice);
        
    }else if(transaction.data.startsWith(methodList.tokenToToken.id) || transaction.data.startsWith(methodList.tokenToTokenAbr.id) || transaction.data.startsWith(methodList.tokenToExactTokenAbr.id) || transaction.data.startsWith(methodList.tokenToExactToken.id)){
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
    // console.log("printing curr...", currList);

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

    if(filter == 'SWAP'){


        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
        fetchedData = fetchedData.filter(item => item.txreceipt_status == 1);

        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToToken.id) || item.input.startsWith(methodList.tokenToTokenAbr.id) || item.input.startsWith(methodList.tokenToExactToken.id) || item.input.startsWith(methodList.tokenToExactTokenAbr.id));
        let newData = [];

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(fetchedItem) newData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.ethToToken.id) || item.input.startsWith(methodList.ethToExactToken.id) || item.input.startsWith(methodList.ethToTokenAbr.id) || item.input.startsWith(methodList.ethToExactTokenAbr.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueETHToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(fetchedItem) newData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToEth.id) || item.input.startsWith(methodList.tokenToEthAbr.id) || item.input.startsWith(methodList.tokenToExactEth.id) || item.input.startsWith(methodList.tokenToExactEthAbr.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToETH(account, item.hash,item.timeStamp,FROM_HASH, library,0);
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

        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToToken.id) || item.input.startsWith(methodList.tokenToTokenAbr.id) || item.input.startsWith(methodList.tokenToExactToken.id) || item.input.startsWith(methodList.tokenToExactTokenAbr.id));
        let swapData = [];
        let liquidityData =[];

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(fetchedItem) swapData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.ethToToken.id) || item.input.startsWith(methodList.ethToExactToken.id) || item.input.startsWith(methodList.ethToTokenAbr.id) || item.input.startsWith(methodList.ethToExactTokenAbr.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueETHToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            if(fetchedItem) swapData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToEth.id) || item.input.startsWith(methodList.tokenToEthAbr.id) || item.input.startsWith(methodList.tokenToExactEth.id) || item.input.startsWith(methodList.tokenToExactEthAbr.id));

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
    if(account){
        tokenPriceUSD = await getAllSuportedTokensPrice();
        try{
        let address =  account.toString();
        let apikey = 'H2W1JHHRFB5H7V735N79N75UVG86E9HFH2';
        let URL = 'https://api-testnet.bscscan.com/api?module=account&action=txlist';
        let startBlock = '0';
        let endBlock = '99999999';
        let page = '1';
        let offset=filter=='ALL'? '30':'50'; // NUMBER OF RESULTS FETCHED FROM ETHERSCAN
        let sort='asc';
        let request = API+'?module=account&action=txlist&address='+address+'&startblock=0&endblock=99999999&page=1&offset='+offset+'&sort=desc&apikey='+apikey;

        let response = await fetch(request);
        let data = await response.json();

        console.log("got this tx data", data.result);


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
    const transferLog = transferLogs.find(item => fromAddress == (web3.eth.abi.decodeParameter("address", item.topics[1])).toLowerCase());
    const transferToAddress = (web3.eth.abi.decodeParameter("address", transferLog.topics[2])).toLowerCase();
    pathList.push(transferLogs.indexOf(transferLog));
    if (transferToAddress == destAddress) {
        return pathList;
    }
    pathList = getTransferLogPath(transferLogs, pathList, transferToAddress, destAddress);
    return pathList;
}

//below code is used for transaction detail page

export async function fetchTransactionData(address,library, account){

    console.log("fetching tx" , address);

    // console.log("before get All Supported Tokens Price");
    tokenPriceUSD = await getAllSuportedTokensPrice();

    // eth to token: 0x529c18b7eed512c24ab3755eb18316f7ea764907b51924eceab4c31e72300d01
    // token to token: 0x19bf42a261ccf0d64c4c6ca3112e3ac24b54272fb6ad622a1c622a47d64d4fea
    // token to eth: 0xedffbb4fc760c3133d8d66483f0dc6fc80ce109ab1286b0f3eb46ea67083c47b

    try{
        const apikey = 'H2W1JHHRFB5H7V735N79N75UVG86E9HFH2';

        const transactionData = await library.getTransaction(address.toString());
        const sourceAddress = (transactionData.from).toLowerCase();
        const destAddress = (transactionData.to).toLowerCase();
        console.log("transactionData", transactionData);
        // console.log(sourceAddress, destAddress);

        // this code is used to get METHOD ID
        // for (let i = 0; i < ACYV1ROUTER02_ABI.length; i ++) {
        //     console.log(ACYV1ROUTER02_ABI[i]["name"]);
        //     console.log(web3.eth.abi.encodeFunctionSignature(ACYV1ROUTER02_ABI[i]));
        // }

        const methodUsed = Object.keys(methodList.bsc).find(key => transactionData.data.startsWith(methodList.bsc[key].id));
        // console.log("methodUsed", methodUsed);
        
        if (Object.keys(methodList.bsc).includes(methodUsed)) {
            const methodUsedABI = ACYV1ROUTER02_ABI.find(item => item.name == methodUsed)
            const parsedInputData = "0x" + transactionData.data.substring(10, transactionData.data.length);
            const txnDataDecoded = web3.eth.abi.decodeParameters(methodUsedABI.inputs, parsedInputData);
            console.log("txnDataDecoded", txnDataDecoded);
            const fromTokenAddress = txnDataDecoded.path[0];
            const toTokenAddress = txnDataDecoded.path[1];
            
            // parsing loggings
            const response = await library.getTransactionReceipt(address.toString());
            // console.log("Response: ",response);
            const gasFee = (transactionData.gasPrice.toNumber() / (Math.pow(10,18)) ) * response.gasUsed.toNumber()
            const FlashArbitrageResult_Log = response.logs[response.logs.length-1];
            const FlashArbitrageResultLogs_ABI = ACYV1ROUTER02_ABI.find(item => item.name == 'FlashArbitrageResultLogs');
            const txnReceiptDecoded = web3.eth.abi.decodeLog(
                FlashArbitrageResultLogs_ABI.inputs, 
                FlashArbitrageResult_Log.data, 
                FlashArbitrageResult_Log.topics
                )
            console.log("txnReceiptDecoded", txnReceiptDecoded);
            
            /**
             * Parse transfer logs
             * 1. find all the routes from sourceAddress to destAddress
             * */
            const transferLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0] == actionList.transfer.hash);
            console.log("transferLogs", transferLogs);
            const routes_loglists = [];
            for (let i = 0; i < transferLogs.length; i ++) {
                let transferFromAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[1])).toLowerCase();
                let transferToAddress = (web3.eth.abi.decodeParameter("address", transferLogs[i].topics[2])).toLowerCase();
                if (transferFromAddress == sourceAddress) {
                    let pathList = [i];
                    let path = getTransferLogPath(transferLogs, pathList, transferToAddress, destAddress);
                    routes_loglists.push(path);
                }
            } 
            console.log("routes_loglists", routes_loglists);

            /**
             * Parse the routes_loglists into frontend readable data
             */
            let routes = []
            let totalIn = 0;
            let totalOut = 0;
            let token1 = null;
            let token2 = null;
            let token3 = null;
            for (const path of routes_loglists) {
                token1 = INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[0]].address.toLowerCase());
                token2 = null;
                let amount1 = (transferLogs[path[0]].data / Math.pow(10, token1.decimals)); 
                let amount2 = null;
                let amount3 = null;
                // direct path
                if (path.length == 2) {
                    token3 = token3 == null ? INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[1]].address.toLowerCase()) : token3;
                    amount3 = (transferLogs[path[1]].data / Math.pow(10, token3.decimals)); 
                    // console.log(token1, token3);
                    routes.push({
                        "token1": token1.symbol,
                        "token2": null,
                        "token3": token3.symbol,
                        "token1Num": amount1,
                        "token2Num": null,
                        "token3Num": amount3,
                        "logoURI": null
                    })
                } 
                // routed path
                else {
                    token2 = INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[1]].address.toLowerCase());
                    token3 = token3 == null ? INITIAL_TOKEN_LIST.find(item => item.address.toLowerCase() == transferLogs[path[2]].address.toLowerCase()) : token3;
                    amount2 = (transferLogs[path[1]].data / Math.pow(10, token2.decimals)); 
                    amount3 = (transferLogs[path[2]].data / Math.pow(10, token3.decimals)); 
                    // console.log(token1, token2, token3);
                    routes.push({
                        "token1": token1.symbol,
                        "token2": token2.symbol,
                        "token3": token3.symbol,
                        "token1Num": amount1,
                        "token2Num": amount2,
                        "token3Num": amount3,
                        "logoURI": token2.logoURI
                    })
                }
                totalIn += amount3;
                totalOut += amount1;
            }

            let requestPrice = API+'?module=stats&action=bnbprice&apikey='+apikey;
            let responsePrice = await fetch(requestPrice);
            let ethPrice = await responsePrice.json();
            ethPrice = parseFloat(ethPrice.result.ethusd);

            // console.log("fetching ethprice",ethPrice);
            // console.log("txnReceiptDecoded.AMMOutput", txnReceiptDecoded.AMMOutput);
            // console.log("txnReceiptDecoded.FAOutput", txnReceiptDecoded.FAOutput);
            // console.log("txnReceiptDecoded.userDistributionAmount", txnReceiptDecoded.userDistributionAmount);

            const newData = {
                "routes" : routes,
                "totalIn" : totalIn,
                "totalOut" : totalOut,
                "gasFee" : gasFee,
                "token1" : token1,
                "token2" : token3,
                "ethPrice" : ethPrice,
                "AMMOutput": (Math.floor(txnReceiptDecoded.AMMOutput) / Math.pow(10, token3.decimals)), // this number is actually too large for integer, so it doesnt convert the string to int completely, but its enough for frontend showcase, wont be effecting the result.
                "FAOutput": (Math.floor(txnReceiptDecoded.FAOutput) / Math.pow(10, token3.decimals)),
                "userDistributionAmount": (Math.floor(txnReceiptDecoded.userDistributionAmount) / Math.pow(10, token3.decimals))
            }
            console.log("newData", newData);

            let chartData = getChartData(newData);
            newData.chartData = chartData;
            return newData;
        }
        // // token to eth
        // else if (transactionData.data.startsWith(methodList.bsc.swapExactTokensForETHByArb.id)
        //     || transactionData.data.startsWith(methodList.bsc.swapTokensForExactETHByArb.id)) {
            
        //     console.log("A token to eth transaction");
        //     let response = await library.getTransactionReceipt(address.toString());
        //     console.log("Response: ",response);
        //     let FROM_HASH = account.toString().toLowerCase().slice(2);
        //     let TO_HASH = response.to.toLowerCase().slice(2);
        //     let logs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash);
        //     let gasFee = (transactionData.gasPrice.toNumber() / (Math.pow(10,18)) )* response.gasUsed.toNumber()
        //     console.log("gas fee: ",gasFee);

        //     let routes = [];
        //     let totalIn = 0;
        //     let totalOut = 0;
        //     let newData = {};
        //     let token1;
        //     let token2;
        //     let token3;
        //     for (let i=0;i<logs.length;){
        //         token1 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
        //         let ammount1 = (logs[i].data / Math.pow(10, token1.decimals)); 
        //         i++;

        //         let ammount2 = 0;

        //         if(!logs[i].topics[2].includes(TO_HASH)){
        //             token2 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
        //             ammount2 = (logs[i].data / Math.pow(10, token2.decimals)); 
        //             i++;
        //         }else{
        //             token2 = null;
        //         }
        //         token3 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
        //         let ammount3 = (logs[i].data / Math.pow(10, token3.decimals));
        //         i++;
                
        //         routes.push({
        //             "token1" : token1.symbol,
        //             "token2" : token2 ? token2.symbol : null,
        //             "token3" : token3.symbol,
        //             "token1Num" : ammount1,
        //             "token2Num" : token2 ? ammount2 : null,
        //             "token3Num" : ammount3,
        //             "logoURI" : token2 ? token2.logoURI : null
        //         })

        //         totalIn += ammount3;
        //         totalOut += ammount1;
        //     }
            
        //     //get amm output 
        //     // var contract = getContract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',IUniswapV2Router02ABI,library,account);
        //     // let addressPath = [token1.addressOnEth,token2.addressOnEth];
        //     // var liquidityOut = contract.getAmountsIn(1079,addressPath);
        //     // console.log('testing :: ', liquidityOut);
            
        //     //get ether last price
        //     let requestPrice = API+'?module=stats&action=bnbprice&apikey='+apikey;
        //     let responsePrice = await fetch(requestPrice);
        //     let ethPrice = await responsePrice.json();
        //     ethPrice = parseFloat(ethPrice.result.ethusd);

        //     console.log("fetching ethprice",ethPrice);

        //     newData = {
        //         "routes" : routes,
        //         "totalIn" : totalIn,
        //         "totalOut" : totalOut,
        //         "gasFee" : gasFee,
        //         "token1" : token1,
        //         "token2" : token3,
        //         "ethPrice" : ethPrice,
        //         "AMMOutput": 0,
        //     }

        //     let chartData = getChartData(newData);
        //     newData.chartData = chartData;
        //     return newData;
        // }
        // // eth to token
        // else if (transactionData.data.startsWith(methodList.bsc.swapETHForExactTokensByArb.id)
        //     || transactionData.data.startsWith(methodList.bsc.swapExactETHForTokensByArb.id)) {
            
        //     console.log("A eth to token transaction");
        //     let response = await library.getTransactionReceipt(address.toString());
        //     console.log("Response: ",response);
        //     let FROM_HASH = account.toString().toLowerCase().slice(2);
        //     let TO_HASH = response.to.toLowerCase().slice(2);
        //     let logs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash);
        //     let gasFee = (transactionData.gasPrice.toNumber() / (Math.pow(10,18)) )* response.gasUsed.toNumber()
        //     console.log("gas fee: ",gasFee);
        //     let routes = [];
        //     let totalIn = 0;
        //     let totalOut = 0;
        //     let newData = {};
        //     let token1;
        //     let token2;
        //     let token3;
        //     for (let i=0;i<logs.length;){
        //         token1 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
        //         let ammount1 = (logs[i].data / Math.pow(10, token1.decimals)); 
        //         i++;

        //         let ammount2 = 0;

        //         if(!logs[i].topics[2].includes(FROM_HASH)){
        //             token2 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
        //             ammount2 = (logs[i].data / Math.pow(10, token2.decimals)); 
        //             i++;
        //         }else{
        //             token2 = null;
        //         }
        //         token3 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
        //         let ammount3 = (logs[i].data / Math.pow(10, token3.decimals));
        //         i++;
                
        //         routes.push({
        //             "token1" : token1.symbol,
        //             "token2" : token2 ? token2.symbol : null,
        //             "token3" : token3.symbol,
        //             "token1Num" : ammount1,
        //             "token2Num" : token2 ? ammount2 : null,
        //             "token3Num" : ammount3,
        //             "logoURI" : token2 ? token2.logoURI : null
        //         })

        //         totalIn += ammount3;
        //         totalOut += ammount1;
        //     }
        //     //get amm output 
        //     // var contract = getContract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',IUniswapV2Router02ABI,library,account);
        //     // let addressPath = [token1.addressOnEth,token2.addressOnEth];
        //     // var liquidityOut = contract.getAmountsIn(1079,addressPath);
        //     // console.log('testing :: ', liquidityOut);
            
        //     //get ether last price
        //     let requestPrice = API+'?module=stats&action=bnbprice&apikey='+apikey;
        //     let responsePrice = await fetch(requestPrice);
        //     let ethPrice = await responsePrice.json();
        //     ethPrice = parseFloat(ethPrice.result.ethusd);

        //     console.log("fetching ethprice",ethPrice);

        //     newData = {
        //         "routes" : routes,
        //         "totalIn" : totalIn,
        //         "totalOut" : totalOut,
        //         "gasFee" : gasFee,
        //         "token1" : token1,
        //         "token2" : token3,
        //         "ethPrice" : ethPrice
        //     }

        //     let chartData = getChartData(newData);
        //     newData.chartData = chartData;
        //     return newData;
        // }
        else if(transactionData.data.startsWith(methodList.addLiquidity.id)){

        }else if(transactionData.data.startsWith(methodList.addLiquidityEth.id)){

        }else if(transactionData.data.startsWith(methodList.removeLiquidity.id)){

        }else if(transactionData.data.startsWith(methodList.removeLiquidityETH.id)){

        }else {
            console.log("Transaction not parseable");
        }

    } catch (e){
        console.log(e);
    }
    return {};
}