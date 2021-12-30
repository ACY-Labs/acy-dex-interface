import {useState, useEffect} from "react";
import { useWeb3React } from '@web3-react/core';

import TokenListSelector from './token_list';
import MethodActionSelector from './contract_method_list';
import ScanUrlSelector from './scan_url';
import FarmSettingSelector from './farm_setting';
import SDK_SETTING from './sdk_setting';
import { JsonRpcProvider } from "@ethersproject/providers"; 

const library = new JsonRpcProvider('https://bsc-dataseed1.defibit.io/');
// loading all constants needed in app
const ConstantLoader = (networkName) => {
    // const params = useParams();
    // networkName = params.chainId;
    // console.log("new chainId", networkName)

    // global variable NETWORK_NAME is loaded by umi
    // configure it in /config/constant.config.ts

    // wrap constants in this variable
    const constants = {
        'tokenList': TokenListSelector(networkName ? networkName : NETWORK_NAME),
        'methodMap': MethodActionSelector('method'),
        'actionMap': MethodActionSelector('action'),
        'scanUrlPrefix': ScanUrlSelector(networkName ? networkName : NETWORK_NAME),
        'farmSetting': FarmSettingSelector(networkName ? networkName : NETWORK_NAME),
        'sdkSetting': SDK_SETTING
    }

    // make constants readonly
    Object.freeze(constants);
    return constants;
}

// import constant to normal js file
export let constantInstance = {
    'account': undefined,
    'chainId': 56,
    'library': library,
    'tokenList': TokenListSelector(56),
    'methodMap': MethodActionSelector('method'),
    'actionMap': MethodActionSelector('action'),
    'scanUrlPrefix': ScanUrlSelector(56),
    'farmSetting': FarmSettingSelector(56),
    'sdkSetting': SDK_SETTING
};

// export tokenList
export const TOKENLIST = () => constantInstance.tokenList
// export scanUrlPrefix
export const SCAN_URL_PREFIX = () => constantInstance.scanUrlPrefix.scanUrl
export const SCAN_NAME = () => constantInstance.scanUrlPrefix.scanName
// export farmSetting
export const INITIAL_ALLOWED_SLIPPAGE = () => constantInstance.farmSetting.INITIAL_ALLOWED_SLIPPAGE
export const FACTORY_ADDRESS = () => constantInstance.farmSetting.FACTORY_ADDRESS
export const INIT_CODE_HASH = () => constantInstance.farmSetting.INIT_CODE_HASH
export const WETH = () => constantInstance.farmSetting.WETH
export const ETH_NAME = () => constantInstance.farmSetting.ETH_NAME
export const ROUTER_ADDRESS = () => constantInstance.farmSetting.ROUTER_ADDRESS
export const FARMS_ADDRESS  = () => constantInstance.farmSetting.FARMS_ADDRESS 
export const FLASH_ARBITRAGE_ADDRESS = () => constantInstance.farmSetting.FLASH_ARBITRAGE_ADDRESS
export const BLOCK_TIME = () => constantInstance.farmSetting.BLOCK_TIME
export const BLOCKS_PER_YEAR = () => constantInstance.farmSetting.BLOCKS_PER_YEAR
export const BLOCKS_PER_MONTH = () => constantInstance.farmSetting.BLOCKS_PER_MONTH
export const RPC_URL = () => constantInstance.farmSetting.RPC_URL
export const API_URL = () => constantInstance.farmSetting.API_URL


// import constant to react component
export const useConstantLoader = () => {
    const { account, chainId, library, activate } = useWeb3React();
    const [constant, setConstant] = useState(constantInstance);
    
    useEffect(() => {
        console.log("@/constant: current chain , account", chainId, account);
        const currentConstant = {
            'account': account,
            'chainId': chainId ? chainId : 56,
            'library': library,
            'tokenList': TokenListSelector(chainId ? chainId : 56),
            'methodMap': MethodActionSelector('method'),
            'actionMap': MethodActionSelector('action'),
            'scanUrlPrefix': ScanUrlSelector(chainId ? chainId : 56),
            'farmSetting': FarmSettingSelector(chainId ? chainId : 56),
            'sdkSetting': SDK_SETTING
        }

        console.log("@/constant: current constant", currentConstant)
        
        constantInstance = currentConstant;
        setConstant(currentConstant);
    }, [account, chainId]);

    // useEffect(() => {
    //     if (!chainId) return
    //     if (chainId != params.chainId) {
    //         console.log("redirecting to liquidity")
    //         history.push(`/exchange/${chainId}`)
    //     }
    // }, [chainId])

    return {...constant};
}

export default ConstantLoader;