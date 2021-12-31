import {useState, useEffect} from "react";
import { useWeb3React } from '@web3-react/core';

import TokenListSelector from './token_list';
import MethodActionSelector from './contract_method_list';
import ScanUrlSelector from './scan_url';
import FarmSettingSelector from './farm_setting';
import SDK_SETTING from './sdk_setting';
import { JsonRpcProvider } from "@ethersproject/providers"; 

const supportedChainIds = [56, 97, 137];
const defaultLibrary = new JsonRpcProvider('https://bsc-dataseed1.defibit.io/');

// import constant to normal js file
export let constantInstance = {
    'account': undefined,
    'chainId': 56,
    'library': defaultLibrary,
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
export const NATIVE_CURRENCY = () => constantInstance.farmSetting.NATIVE_CURRENCY
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
    const { account, chainId, library } = useWeb3React();
    const [constant, setConstant] = useState(constantInstance);
    
    useEffect(() => {
        console.log("@/constant: current chain , account", chainId, account);
        
        console.log("do our site support this chain?", chainId, supportedChainIds.indexOf(chainId))
        const chainSupported = supportedChainIds.indexOf(chainId) != -1;
        const fallbackChainId = chainSupported ? chainId : 56;    // redirect unsupported chainId and undefined to 56

        const currentConstant = {
            'account': chainSupported ? account : undefined,
            'chainId': fallbackChainId,
            'library': chainSupported ? library : defaultLibrary,
            'tokenList': TokenListSelector(fallbackChainId),
            'methodMap': MethodActionSelector('method'),
            'actionMap': MethodActionSelector('action'),
            'scanUrlPrefix': ScanUrlSelector(fallbackChainId),
            'farmSetting': FarmSettingSelector(fallbackChainId),
            'sdkSetting': SDK_SETTING
        }

        console.log("@/constant: current constant", chainId, currentConstant)
        
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