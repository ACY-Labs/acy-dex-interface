import { useState, useEffect } from "react";
import { useWeb3React } from '@web3-react/core';

import TokenListSelector from './token_list';
import MethodActionSelector from './contract_method_list';
import ScanUrlSelector from './scan_url';
import ScanAPIUrlSelector from './scan_api_url';
import FarmSettingSelector from './farm_setting';
import LaunchpadSettingSelector from './launchpad_setting';
import SDK_SETTING from './sdk_setting';
import GAS_TOKEN_SYMBOL from "./gas_token";
import { JsonRpcProvider } from "@ethersproject/providers";


export const supportedChainIds = [56, 97, 137, 80001];
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
    'scanAPIPrefix': ScanAPIUrlSelector(56),
    'farmSetting': FarmSettingSelector(56),
    'launchpadSetting': LaunchpadSettingSelector(56),
    'sdkSetting': SDK_SETTING,
    'gasTokenSymbol': GAS_TOKEN_SYMBOL[56],
    'marketNetwork': 56,
    'marketAPISetting': FarmSettingSelector(56),
    'marketTokenList': TokenListSelector(56),
};

// export web3 wallet status
export const CHAINID = () => constantInstance.chainId
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
export const FARMS_ADDRESS = () => constantInstance.farmSetting.FARMS_ADDRESS
export const FLASH_ARBITRAGE_ADDRESS = () => constantInstance.farmSetting.FLASH_ARBITRAGE_ADDRESS
export const BLOCK_TIME = () => constantInstance.farmSetting.BLOCK_TIME
export const BLOCKS_PER_YEAR = () => constantInstance.farmSetting.BLOCKS_PER_YEAR
export const BLOCKS_PER_MONTH = () => constantInstance.farmSetting.BLOCKS_PER_MONTH
export const RPC_URL = () => constantInstance.farmSetting.RPC_URL
export const API_URL = () => constantInstance.farmSetting.API_URL
export const LAUNCHPAD_ADDRESS = () => constantInstance.launchpadSetting.ADDRESS
export const LAUNCH_RPC_URL = () => constantInstance.launchpadSetting.RPC_URL
export const LAUNCH_MAIN_TOKEN = () => constantInstance.launchpadSetting.MAIN_TOKEN
export const METHOD_LIST = () => constantInstance.methodMap
export const ACTION_LIST = () => constantInstance.actionMap
export const TOKEN_LIST = () => constantInstance.tokenList
// export market Setting
export const MARKET_API_URL = () => constantInstance.marketAPISetting.API_URL
export const MARKET_TOKEN_LIST = () => constantInstance.marketTokenList

export const ConstantLoader = (chainId = 56, marketChainId = 56) => {
    const chainSupportedIndex = (supportedChainIds.indexOf(chainId) !== -1);
    const fallbackChainId = chainSupportedIndex ? chainId : 56;    // redirect unsupported chainId and undefined to 56

    const marketChainSupportedIndex = (supportedChainIds.indexOf(marketChainId) !== -1);
    const marketNetwork = marketChainSupportedIndex ? marketChainId : 56;

    const constants = {
        'tokenList': TokenListSelector(fallbackChainId),
        'methodMap': MethodActionSelector('method'),
        'actionMap': MethodActionSelector('action'),
        'scanUrlPrefix': ScanUrlSelector(fallbackChainId),
        'scanAPIPrefix': ScanAPIUrlSelector(fallbackChainId),
        'farmSetting': FarmSettingSelector(fallbackChainId),
        'launchpadSetting': LaunchpadSettingSelector(fallbackChainId),
        'sdkSetting': SDK_SETTING,
        'gasTokenSymbol': GAS_TOKEN_SYMBOL[fallbackChainId],
        'marketAPISetting': FarmSettingSelector(marketNetwork),
        'marketTokenList': TokenListSelector(marketNetwork),
    };

    return constants;
}

// import constant to react component
export const useConstantLoader = () => {
    const { account, chainId, library } = useWeb3React();
    const [constant, setConstant] = useState(constantInstance);

    const marketChainId = Number(localStorage.getItem("market"));


    useEffect(() => {
        const chainSupportedIndex = (supportedChainIds.indexOf(chainId) !== -1);
        const fallbackChainId = chainSupportedIndex ? chainId : 56;    // redirect unsupported chainId and undefined to 56

        const marketChainSupportedIndex = (supportedChainIds.indexOf(marketChainId) !== -1);
        const marketNetwork = marketChainSupportedIndex ? marketChainId : 56;

        const staticConstants = ConstantLoader(fallbackChainId, marketNetwork);
        const constants = Object.assign({
            'account': chainSupportedIndex ? account : undefined,
            'chainId': fallbackChainId,
            'library': chainSupportedIndex ? library : defaultLibrary,
            'marketNetwork': marketNetwork,
        }, staticConstants);

        constantInstance = constants;
        setConstant(constants);
    }, [account, chainId, marketChainId]);

    return constant;
}