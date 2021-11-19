import moment from 'moment';
import INITIAL_TOKEN_LIST from '@/constants/TokenList';
import {methodList, actionList} from '@/constants/MethodList';
export async function parseTransactionData (fetchedData,account,library,filter) {
    if(filter == 'SWAP'){
        console.log('debugging here');

        let FROM_HASH = account.toString().toLowerCase().slice(2);
        let TO_HASH ;
        let filteredData = fetchedData.filter(item => item.input.startsWith(methodList.tokenToToken.id));
        let newData = [];

        for (let item of filteredData) {
            let response = await library.getTransactionReceipt(item.hash);
            let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.swap.hash && log.topics[1].includes(FROM_HASH));
            let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.swap.hash && log.topics[2].includes(FROM_HASH));

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
            let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.swap.hash && log.topics[1].includes(TO_HASH));
            let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.swap.hash && log.topics[2].includes(FROM_HASH));
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
            let inLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.swap.hash && log.topics[1].includes(FROM_HASH));
            let outLogs = response.logs.filter(log => log.topics.length > 2 && log.topics[0]===actionList.swap.hash && log.topics[2].includes(TO_HASH));
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
            "inputTokenNum": inTokenNumber,
            "inputTokenSymbol": inToken.symbol,
            "outTokenNum": outTokenNumber,
            "outTokenSymbol": outToken.symbol,
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
    return [];
}
