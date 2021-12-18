import moment from 'moment';
import axios from 'axios';
// import INITIAL_TOKEN_LIST from '@/constants/uniqueTokens';
import INITIAL_TOKEN_LIST from '@/constants/_TokenList';
import INITIAL_TOKEN_LIST_ from '@/constants/TokenList';
import {methodList, actionList} from '@/constants/MethodList';
import liquidity from '@/pages/Liquidity/models/liquidity';
import {getContract} from '@/acy-dex-swap/utils'
import {totalInUSD} from '@/utils/utils';
import { BigNumber } from '@ethersproject/bignumber';

import {getAllSuportedTokensPrice} from '@/acy-dex-swap/utils/index';
import { abi as IUniswapV2Router02ABI } from '@/abis/IUniswapV2Router02.json';

// THIS FUNCTIONS RETURN TOKEN 
export function findTokenInList(item){ // token has address attribute
    let token = INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.address.toLowerCase() || token.addressOnEth.toLowerCase()==item.address.toLowerCase());
    if(token) return token;
    else return INITIAL_TOKEN_LIST_.find(token => token.address.toLowerCase()==item.address.toLowerCase() || token.addressOnEth.toLowerCase()==item.address.toLowerCase());
}
export function findTokenWithAddress(item){// input is an address 
    let token = INITIAL_TOKEN_LIST.find(token => token.address.toLowerCase()==item.toLowerCase() || token.addressOnEth.toLowerCase()==item.toLowerCase());
    if(token) return token;
    else return INITIAL_TOKEN_LIST_.find(token => token.address.toLowerCase()==item.toLowerCase() || token.addressOnEth.toLowerCase()==item.toLowerCase());
}

export function findTokenWithSymbol(item){
    let token = INITIAL_TOKEN_LIST.find(token => token.symbol==item);
    if(token) return token;
    else INITIAL_TOKEN_LIST_.find(token => token.symbol==item);
}

var API = 'https://api.bscscan.com/api';
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
          `https://api.acy.finance/api/users/swap?address=${data.address}&hash=${data.hash}&valueSwapped=${valueSwapped}&feesPaid=${feesPaid}`
        )
        .then(response => {
          console.log(response.response);
        });
    }catch(e){
        console.log("service not working...")
    }

}

async function fetchUniqueETHToToken (account, hash, timestamp, FROM_HASH, library, gasPrice){

    let response = await library.getTransactionReceipt(hash);
    // console.log("pringting data of tx::::::",response);
    

    if(!response.status) return {};

    let TO_HASH = response.to.toLowerCase().slice(2);
    let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(TO_HASH));
    let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));

    console.log("pringting logs ", inLogs);
    console.log(outLogs);
    console.log()
    let inToken = findTokenInList(inLogs[0]);
    let outToken =  findTokenInList(outLogs[0]);

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
        {
            token : outToken.symbol,
            amount : parseFloat(outTokenNumber)
        },

    ],tokenPriceUSD);

    // console.log(response);

    return {
        "address" : account.toString(),
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
}

async function fetchUniqueTokenToETH(account, hash, timestamp, FROM_HASH, library, gasPrice){

    let response = await library.getTransactionReceipt(hash);
    if(!response.status) return {};
    let TO_HASH = response.to.toLowerCase().slice(2);
    let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
    let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));
    let inToken = findTokenInList(inLogs[0]);
    let outToken =  findTokenInList(outLogs[0]);
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
        {
            token : outToken.symbol,
            amount : parseFloat(outTokenNumber)
        },

    ],tokenPriceUSD);

    return  {
        "address" : account.toString(),
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
}

async function fetchUniqueTokenToToken(account, hash, timestamp, FROM_HASH, library, gasPrice){
    let response = await library.getTransactionReceipt(hash);
    if(!response.status) return {};
    let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
    let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash && log.topics[2].includes(FROM_HASH));

    let inToken = findTokenInList(inLogs[0]);
    let outToken =  findTokenInList(outLogs[0]);

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
        {
            token : outToken.symbol,
            amount : parseFloat(outTokenNumber)
        },

    ],tokenPriceUSD);

    return {
        "address" : account.toString(),
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
}

export async function appendNewSwapTx(currList,receiptHash,account,library){


    // console.log("printing curr...", currList);

    if(currList.length > 0 && currList[0].hash.toLowerCase() == receiptHash.toLowerCase()) return currList;

    let FROM_HASH = account.toString().toLowerCase().slice(2);
    let TO_HASH;

    let transaction = await library.getTransaction(receiptHash);
    let gasPrice = transaction.gasPrice.toNumber();


    let newData;
    
    if(transaction.data.startsWith(methodList.ethToToken.id)){

        console.log("adding eth to token");
        newData = await fetchUniqueETHToToken(account, receiptHash,null,FROM_HASH, library, gasPrice);
        

    }else if(transaction.data.startsWith(methodList.tokenToEth.id)){
        console.log("adding token to eth");
        newData  = await fetchUniqueTokenToETH(account, receiptHash,null,FROM_HASH, library, gasPrice);
        
    }else{
        console.log("addding normal token to token");
        newData = await fetchUniqueTokenToToken(account,receiptHash,null,FROM_HASH, library, gasPrice);
    }

    saveTxInDB(
        {
            ...newData

        }
    );

    let temp = [];
    temp.push(newData);
    temp.push(...currList);

    return temp;

}

export async function parseTransactionData (fetchedData,account,library,filter) {

    if(filter == 'SWAP'){


        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
        fetchedData = fetchedData.filter(item => item.txreceipt_status == 1);
        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToToken.id,0));
        let newData = [];

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToToken(account, item.hash,item.timeStamp,FROM_HASH, library);
            newData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.ethToToken.id,0));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueETHToToken(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            newData.push(fetchedItem);
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToEth.id));

        for (let item of filteredData) {
            let fetchedItem = await fetchUniqueTokenToETH(account, item.hash,item.timeStamp,FROM_HASH, library,0);
            newData.push(fetchedItem);
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
            
            let response = await library.getTransactionReceipt(item.hash);
            let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
            const tokensOut = new Set();
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
                if(log.address == token1.address) token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))
            };
            // token1Number = token1Number.toString();
            let token2Number = 0;
            for(let log of logsToken2){
                if(log.address == token2.address) token2Number += (log.data / Math.pow(10, token2.decimals))
            };
            // token2Number = token2Number.toString();

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');

            let totalAmount = totalInUSD([
                {
                    token : token1.symbol,
                    amount : parseFloat(token1Number)
                },
                {
                    token : token2.symbol,
                    amount : parseFloat(token2Number)
                },

            ],tokenPriceUSD);

            newData.push({
            "address" : account.toString(),
            "hash": item.hash,
            "action":'Add',
            "totalToken": totalAmount,
            "token1Number": token1Number,
            "token1Symbol": token1.symbol,
            "token2Number": token2Number,
            "token2Symbol": token2.symbol,
            "transactionTime": transactionTime
            })
        }
        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.addLiquidityEth.id));

        for (let item of filteredData) {
            
            let response = await library.getTransactionReceipt(item.hash);
            TO_HASH = response.to.toLowerCase().slice(2);
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

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');

            let totalAmount = totalInUSD([
                {
                    token : token1.symbol,
                    amount : parseFloat(token1Number)
                },
                {
                    token : token2.symbol,
                    amount : parseFloat(token2Number)
                },

            ],tokenPriceUSD);

            newData.push({
            "address" : account.toString(),
            "hash": item.hash,
            "action":'Add',
            "totalToken": totalAmount,
            "token1Number": token1Number,
            "token1Symbol": token1.symbol,
            "token2Number": token2Number,
            "token2Symbol": token2.symbol,
            "transactionTime": transactionTime
            })
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.removeLiquidity.id));
        for (let item of filteredData) {
            
            let response = await library.getTransactionReceipt(item.hash);
            // console.log('filtered data',response);
            let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
            // console.log('filtered logs',outLogs);
            const tokensIn = new Set();
            for(let log of inLogs){
                tokensIn.add(log.address);
            }
            tokensIn = Array.from(tokensIn);
            // console.log('set',tokensOut);

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

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');

            let totalAmount = totalInUSD([
                {
                    token : token1.symbol,
                    amount : parseFloat(token1Number)
                },
                {
                    token : token2.symbol,
                    amount : parseFloat(token2Number)
                },

            ],tokenPriceUSD);

            newData.push({
            "address" : account.toString(),
            "hash": item.hash,
            "action":'Remove',
            "totalToken": totalAmount,
            "token1Number": token1Number,
            "token1Symbol": token1.symbol,
            "token2Number": token2Number,
            "token2Symbol": token2.symbol,
            "transactionTime": transactionTime
            })
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.removeLiquidityETH.id));

        for (let item of filteredData) {
            
            let response = await library.getTransactionReceipt(item.hash);
            TO_HASH = response.to.toLowerCase().slice(2);
            let logsToken1 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
            let logsToken2 = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));

            let token1 = findTokenInList(logsToken1[0]);
            let token2 =  findTokenInList(logsToken2[0]);

            let token1Number = 0;
            for(let log of logsToken1){
                if(log.address == token1.address) token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))
            };

            let token2Number = 0;
            for(let log of logsToken2){
                if(log.address == token2.address) token2Number += (log.data / Math.pow(10, token2.decimals))
            };

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');

            let totalAmount = totalInUSD([
                {
                    token : token1.symbol,
                    amount : parseFloat(token1Number)
                },
                {
                    token : token2.symbol,
                    amount : parseFloat(token2Number)
                },

            ],tokenPriceUSD);

            newData.push({
            "address" : account.toString(),
            "hash": item.hash,
            "action":'Remove',
            "totalToken": totalAmount,
            "token1Number": token1Number,
            "token1Symbol": token1.symbol,
            "token2Number": token2Number,
            "token2Symbol": token2.symbol,
            "transactionTime": transactionTime
            })
        }
        return newData;
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
        let offset='50'; // NUMBER OF RESULTS FETCHED FROM ETHERSCAN
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

    let amm = data.totalIn * 0.3;
    let revenue = data.totalIn - amm;

    return{
        "acy_output" : data.totalIn,
        "amm_output" : amm,
        "flash_revenue" : revenue,
        "liquidity_provider" : revenue * 0.4,
        "farms_standard" : revenue * 0.1,
        "farms_acydao" : revenue * 0.1,
        "farms_premier" :  revenue * 0.1,
        "ecosystem_dao" : revenue * 0.1,
        "trading_fee" : 0,

    }
}

//below code is used for transaction detail page

export async function fetchTransactionData(address,library, account){

    console.log("fetching tx" , address);

    tokenPriceUSD = await getAllSuportedTokensPrice();

    try{
        let apikey = 'H2W1JHHRFB5H7V735N79N75UVG86E9HFH2';

        let transactionData = await library.getTransaction(address.toString());
        console.log(transactionData);

        if (transactionData.data.startsWith(methodList.tokenToToken.id)) {

            let response = await library.getTransactionReceipt(address.toString());
            console.log("Response: ",response);
            let logs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash);
            let gasFee = (transactionData.gasPrice.toNumber() / (Math.pow(10,18)) )* response.gasUsed.toNumber()
            console.log("gas fee: ",gasFee);

            let routes = [];
            let totalIn = 0;
            let totalOut = 0;
            let newData = {};
            let token1;
            let token2;
            let token3;
            for (let i=0;i<logs.length;i+=3){
                token1 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
                let ammount1 = (logs[i].data / Math.pow(10, token1.decimals)); 
                token2 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i+1].address);
                let ammount2 = (logs[i+1].data / Math.pow(10, token2.decimals)); 
                token3 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i+2].address);
                let ammount3 = (logs[i+2].data / Math.pow(10, token3.decimals));
                
                routes.push({
                    "token1" : token1.symbol,
                    "token2" : token2.symbol,
                    "token3" : token3.symbol,
                    "token1Num" : ammount1,
                    "token2Num" : ammount2,
                    "token3Num" : ammount3,
                    "logoURI" : token2.logoURI
                })

                totalIn += ammount3;
                totalOut += ammount1;
            }


            let requestPrice = API+'?module=stats&action=bnbprice&apikey='+apikey;
            let responsePrice = await fetch(requestPrice);
            let ethPrice = await responsePrice.json();
            ethPrice = parseFloat(ethPrice.result.ethusd);

            console.log("fetching ethprice",ethPrice);

            newData = {
                "routes" : routes,
                "totalIn" : totalIn,
                "totalOut" : totalOut,
                "gasFee" : gasFee,
                "token1" : token1,
                "token2" : token3,
                "ethPrice" : ethPrice
            }

            let chartData = getChartData(newData);
            newData.chartData = chartData;
            return newData;
        }
        else if (transactionData.data.startsWith(methodList.tokenToEth.id)){
            let response = await library.getTransactionReceipt(address.toString());
            console.log("Response: ",response);
            let FROM_HASH = account.toString().toLowerCase().slice(2);
            let TO_HASH = response.to.toLowerCase().slice(2);
            let logs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash);
            let gasFee = (transactionData.gasPrice.toNumber() / (Math.pow(10,18)) )* response.gasUsed.toNumber()
            console.log("gas fee: ",gasFee);

            let routes = [];
            let totalIn = 0;
            let totalOut = 0;
            let newData = {};
            let token1;
            let token2;
            let token3;
            for (let i=0;i<logs.length;){
                token1 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
                let ammount1 = (logs[i].data / Math.pow(10, token1.decimals)); 
                i++;

                let ammount2 = 0;

                if(!logs[i].topics[2].includes(TO_HASH)){
                    token2 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
                    ammount2 = (logs[i].data / Math.pow(10, token2.decimals)); 
                    i++;
                }else{
                    token2 = null;
                }
                token3 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
                let ammount3 = (logs[i].data / Math.pow(10, token3.decimals));
                i++;
                
                routes.push({
                    "token1" : token1.symbol,
                    "token2" : token2 ? token2.symbol : null,
                    "token3" : token3.symbol,
                    "token1Num" : ammount1,
                    "token2Num" : token2 ? ammount2 : null,
                    "token3Num" : ammount3,
                    "logoURI" : token2 ? token2.logoURI : null
                })

                totalIn += ammount3;
                totalOut += ammount1;
            }
            
            //get amm output 
            // var contract = getContract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',IUniswapV2Router02ABI,library,account);
            // let addressPath = [token1.addressOnEth,token2.addressOnEth];
            // var liquidityOut = contract.getAmountsIn(1079,addressPath);
            // console.log('testing :: ', liquidityOut);
            
            //get ether last price
            let requestPrice = API+'?module=stats&action=bnbprice&apikey='+apikey;
            let responsePrice = await fetch(requestPrice);
            let ethPrice = await responsePrice.json();
            ethPrice = parseFloat(ethPrice.result.ethusd);

            console.log("fetching ethprice",ethPrice);

            newData = {
                "routes" : routes,
                "totalIn" : totalIn,
                "totalOut" : totalOut,
                "gasFee" : gasFee,
                "token1" : token1,
                "token2" : token3,
                "ethPrice" : ethPrice
            }

            let chartData = getChartData(newData);
            newData.chartData = chartData;
            return newData;
        }else if (transactionData.data.startsWith(methodList.ethToToken.id)){
            let response = await library.getTransactionReceipt(address.toString());
            console.log("Response: ",response);
            let FROM_HASH = account.toString().toLowerCase().slice(2);
            let TO_HASH = response.to.toLowerCase().slice(2);
            let logs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash);
            let gasFee = (transactionData.gasPrice.toNumber() / (Math.pow(10,18)) )* response.gasUsed.toNumber()
            console.log("gas fee: ",gasFee);
            let routes = [];
            let totalIn = 0;
            let totalOut = 0;
            let newData = {};
            let token1;
            let token2;
            let token3;
            for (let i=0;i<logs.length;){
                token1 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
                let ammount1 = (logs[i].data / Math.pow(10, token1.decimals)); 
                i++;

                let ammount2 = 0;

                if(!logs[i].topics[2].includes(FROM_HASH)){
                    token2 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
                    ammount2 = (logs[i].data / Math.pow(10, token2.decimals)); 
                    i++;
                }else{
                    token2 = null;
                }
                token3 = INITIAL_TOKEN_LIST.find(item => item.address == logs[i].address);
                let ammount3 = (logs[i].data / Math.pow(10, token3.decimals));
                i++;
                
                routes.push({
                    "token1" : token1.symbol,
                    "token2" : token2 ? token2.symbol : null,
                    "token3" : token3.symbol,
                    "token1Num" : ammount1,
                    "token2Num" : token2 ? ammount2 : null,
                    "token3Num" : ammount3,
                    "logoURI" : token2 ? token2.logoURI : null
                })

                totalIn += ammount3;
                totalOut += ammount1;
            }
            //get amm output 
            // var contract = getContract('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',IUniswapV2Router02ABI,library,account);
            // let addressPath = [token1.addressOnEth,token2.addressOnEth];
            // var liquidityOut = contract.getAmountsIn(1079,addressPath);
            // console.log('testing :: ', liquidityOut);
            
            //get ether last price
            let requestPrice = API+'?module=stats&action=bnbprice&apikey='+apikey;
            let responsePrice = await fetch(requestPrice);
            let ethPrice = await responsePrice.json();
            ethPrice = parseFloat(ethPrice.result.ethusd);

            console.log("fetching ethprice",ethPrice);

            newData = {
                "routes" : routes,
                "totalIn" : totalIn,
                "totalOut" : totalOut,
                "gasFee" : gasFee,
                "token1" : token1,
                "token2" : token3,
                "ethPrice" : ethPrice
            }

            let chartData = getChartData(newData);
            newData.chartData = chartData;
            return newData;
        }else if(transactionData.data.startsWith(methodList.addLiquidity.id)){

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