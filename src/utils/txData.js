import moment from 'moment';
import INITIAL_TOKEN_LIST from '@/constants/TokenList';
import {methodList, actionList} from '@/constants/MethodList';
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
