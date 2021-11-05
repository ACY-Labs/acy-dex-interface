import ERC20ABI from '@/abis/ERC20.json';
import WETHABI from '@/abis/WETH.json';
import { get } from '@umijs/deps/compiled/got';
import Eth from "web3-eth";
import Utils from "web3-utils";
var Contract = require('web3-eth-contract');
// set provider for all later instances to use

var eth = new Eth('https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
Contract.setProvider('https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
const ACY_ADDRESS = '0xaf9db9e362e306688af48c4acb9618c06db38ac3';

const getBlockTime = async (blockNumber) => {
    const timeStamp = await eth.getBlock(blockNumber).then(function(events){
        const timeStamp = events['timestamp'];
        return events['timestamp'] * 1000;
    });
    const date = new Date(timeStamp);
    //format date to YYYY-MM-DD hh:mm:ss
    return date.getFullYear(timeStamp)  + "-" + ("0"+(date.getMonth(timeStamp)+1)).slice(-2) + "-" + ("0" + date.getDate(timeStamp)).slice(-2)
                 + " " + ("0" + date.getHours(timeStamp)).slice(-2) + ":" + ("0" + date.getMinutes(timeStamp)).slice(-2) + ":"  + ("0" + date.getSeconds(timeStamp)).slice(-2);
}
const getTransferData = async () =>
{
    const transferData = [];
    const contract = new Contract(ERC20ABI, ACY_ADDRESS);
    const result = (contract.getPastEvents("Transfer", {
        fromBlock: 0 ,
        toBlock: 'latest'
    }).then(function(events){
        events.forEach(async (element) => {
            const blockData = {
                dateTime: await getBlockTime(element['blockNumber']),
                participant: element['returnValues']['to'],
                quantity: element['returnValues']['value']/1e18,
                token: "ACY",
            };
            transferData.push(blockData);
        });
    }));
    return transferData;
};

export {getTransferData};