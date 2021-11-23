import moment from 'moment';
import INITIAL_TOKEN_LIST from '@/constants/TokenList';
import {methodList, actionList} from '@/constants/MethodList';
import liquidity from '@/pages/Liquidity/models/liquidity';

export async function parseTransactionData (fetchedData,account,library,filter) {
    if(filter == 'SWAP'){

        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToToken.id));
        let newData = [];

        for (let item of filteredData) {
            let response = await library.getTransactionReceipt(item.hash);
            let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
            let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));

            let inToken = INITIAL_TOKEN_LIST.find(token => token.address==inLogs[0].address);
            let outToken =  INITIAL_TOKEN_LIST.find(token => token.address==outLogs[0].address);

            let inTokenNumber = 0;
            for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
            inTokenNumber = inTokenNumber.toString();
            let outTokenNumber = 0;
            for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
            outTokenNumber = outTokenNumber.toString();

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            newData.push({
            "hash": item.hash,
            "totalToken": 0,
            "inputTokenNum": inTokenNumber,
            "inputTokenSymbol": inToken.symbol,
            "outTokenNum": outTokenNumber,
            "outTokenSymbol": outToken.symbol,
            "transactionTime": transactionTime
            })
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.ethToToken.id));

        for (let item of filteredData) {
            let response = await library.getTransactionReceipt(item.hash);
            TO_HASH = response.to.toLowerCase().slice(2);
            let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(TO_HASH));
            let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(FROM_HASH));
            let inToken = INITIAL_TOKEN_LIST.find(token => token.address==inLogs[0].address);
            let outToken =  INITIAL_TOKEN_LIST.find(token => token.address==outLogs[0].address);

            let inTokenNumber = 0;
            for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
            inTokenNumber = inTokenNumber.toString();
            let outTokenNumber = 0;
            for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
            outTokenNumber = outTokenNumber.toString();

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            newData.push({
            "hash": item.hash,
            "totalToken": 0,
            "inputTokenNum": inTokenNumber,
            "inputTokenSymbol": inToken.symbol,
            "outTokenNum": outTokenNumber,
            "outTokenSymbol": outToken.symbol,
            "transactionTime": transactionTime
            })
        }

        filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToEth.id));

        for (let item of filteredData) {
            let response = await library.getTransactionReceipt(item.hash);
            TO_HASH = response.to.toLowerCase().slice(2);
            let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[1].includes(FROM_HASH));
            let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.transfer.hash && log.topics[2].includes(TO_HASH));
            let inToken = INITIAL_TOKEN_LIST.find(token => token.address==inLogs[0].address);
            let outToken =  INITIAL_TOKEN_LIST.find(token => token.address==outLogs[0].address);

            let inTokenNumber = 0;
            for(let log of inLogs){inTokenNumber = inTokenNumber + (log.data / Math.pow(10, inToken.decimals))};
            inTokenNumber = inTokenNumber.toString();
            let outTokenNumber = 0;
            for(let log of outLogs){outTokenNumber += (log.data / Math.pow(10, outToken.decimals))};
            outTokenNumber = outTokenNumber.toString();

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            newData.push({
            "hash": item.hash,
            "totalToken": 0,
            "inputTokenNum": inTokenNumber,
            "inputTokenSymbol": inToken.symbol,
            "outTokenNum": outTokenNumber,
            "outTokenSymbol": outToken.symbol,
            "transactionTime": transactionTime
            })
        }
        
        return newData;
    }
    else if (filter == 'LIQUIDITY') {
        // console.log("Debugging luquidity");
        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
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

            let token1 = INITIAL_TOKEN_LIST.find(token => token.address==logsToken1[0].address);
            let token2 =  INITIAL_TOKEN_LIST.find(token => token.address==logsToken2[0].address);

            let token1Number = 0;
            for(let log of logsToken1){token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))};
            token1Number = token1Number.toString();
            let token2Number = 0;
            for(let log of logsToken2){token2Number += (log.data / Math.pow(10, token2.decimals))};
            token2Number = token2Number.toString();

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            newData.push({
            "hash": item.hash,
            "action":'Add',
            "totalToken": 0,
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

            let token1 = INITIAL_TOKEN_LIST.find(token => token.address==logsToken1[0].address);
            let token2 =  INITIAL_TOKEN_LIST.find(token => token.address==logsToken2[0].address);

            let token1Number = 0;
            for(let log of logsToken1){token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))};
            token1Number = token1Number.toString();
            let token2Number = 0;
            for(let log of logsToken2){token2Number += (log.data / Math.pow(10, token2.decimals))};
            token2Number = token2Number.toString();

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            newData.push({
            "hash": item.hash,
            "action":'Add',
            "totalToken": 0,
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

            let token1 = INITIAL_TOKEN_LIST.find(token => token.address==logsToken1[0].address);
            let token2 =  INITIAL_TOKEN_LIST.find(token => token.address==logsToken2[0].address);

            let token1Number = 0;
            for(let log of logsToken1){token1Number = token1Number + (log.data / Math.pow(10, token1.decimals))};
            token1Number = token1Number.toString();
            let token2Number = 0;
            for(let log of logsToken2){token2Number += (log.data / Math.pow(10, token2.decimals))};
            token2Number = token2Number.toString();

            let transactionTime = moment(parseInt(item.timeStamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            newData.push({
            "hash": item.hash,
            "action":'Remove',
            "totalToken": 0,
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
        try{
        let address =  account.toString();
        let apikey = 'Y6H9S7521BGREFMGSETVA72F1HT74FE3M5';
        let URL = 'https://api-rinkeby.etherscan.io/api?module=account&action=txlist';
        let startBlock = '0';
        let endBlock = '99999999';
        let page = '1';
        let offset='10';
        let sort='asc';
        let request = 'https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address='+address+'&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey='+apikey;

        let response = await fetch(request);
        let data = await response.json();

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
    let amm = data.liquidity1 * data.liquidity2;
    amm = amm / (data.totalOut + data.liquidity1);
    amm = data.liquidity2 - amm;
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

export async function fetchTransactionData(address,library){

    try{

        let apikey = 'Y6H9S7521BGREFMGSETVA72F1HT74FE3M5';

        let response = await library.getTransactionReceipt(address.toString());
        console.log("Response: ",response);
        let logs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]==actionList.transfer.hash);
        let gasFee = (response.effectiveGasPrice.toNumber() / (Math.pow(10,18)) )* response.gasUsed.toNumber()
        console.log("gas fee: ",gasFee);
        // console.log("cumulativegasused",response.cumulativeGasUsed.toNumber());
        console.log("gasprice",response.effectiveGasPrice.toNumber());
        // console.log("gasused",response.gasUsed.toNumber());
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
        //fetch liquidity pools for 2 ending points
        let requestLiquidity1 = 'https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress='+token1.addressOnEth+'&apikey='+apikey;
        let responseLiquidity1 = await fetch(requestLiquidity1);
        let liquidity1 = await responseLiquidity1.json();
        liquidity1 = parseInt(liquidity1.result)/Math.pow(10,token1.decimals);

        let requestLiquidity2 = 'https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress='+token3.addressOnEth+'&apikey='+apikey;
        let responseLiquidity2 = await fetch(requestLiquidity2);
        let liquidity2 = await responseLiquidity2.json();
        liquidity2 = parseInt(liquidity2.result)/Math.pow(10,token3.decimals);
        
        //get ether last price

        let requestPrice = 'https://api.etherscan.io/api?module=stats&action=ethprice&apikey='+apikey;
        let responsePrice = await fetch(requestPrice);
        let ethPrice = await responsePrice.json();
        ethPrice = parseFloat(ethPrice.result.ethusd);

        console.log("fetching ethprice",ethPrice);

        newData = {
            "routes" : routes,
            "totalIn" : totalIn,
            "totalOut" : totalOut,
            "gasFee" : gasFee,
            "token1" : token1.symbol,
            "token2" : token2.symbol,
            "liquidity1" : liquidity1,
            "liquidity2" : liquidity2,
            "ethPrice" : ethPrice
        }

        let chartData = getChartData(newData);
        newData.chartData = chartData;
        return newData;

    } catch (e){
        console.log(e);
    }
    return {};
}