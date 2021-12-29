import {useState, useEffect} from "react";
import { useWeb3React } from '@web3-react/core';

import TokenListSelector from './token_list';
import MethodActionSelector from './contract_method_list';
import ScanUrlSelector from './scan_url';
import FarmSettingSelector from './farm_setting';
import SDK_SETTING from './sdk_setting';
// loading all constants needed in app
// const ConstantLoader = (networkName) => {
//     // const params = useParams();
//     // networkName = params.chainId;
//     // console.log("new chainId", networkName)

//     // global variable NETWORK_NAME is loaded by umi
//     // configure it in /config/constant.config.ts

//     // wrap constants in this variable
//     const constants = {
//         'tokenList': TokenListSelector(networkName ? networkName : NETWORK_NAME),
//         'methodMap': MethodActionSelector('method'),
//         'actionMap': MethodActionSelector('action'),
//         'scanUrlPrefix': ScanUrlSelector(networkName ? networkName : NETWORK_NAME),
//         'farmSetting': FarmSettingSelector(networkName ? networkName : NETWORK_NAME),
//         'sdkSetting': SDK_SETTING
//     }

//     // make constants readonly
//     Object.freeze(constants);
//     return constants;
// }

export let constantInstance = {
    'account': undefined,
    'chainId': 56,
    'library': undefined,
    'tokenList': TokenListSelector(56),
    'methodMap': MethodActionSelector('method'),
    'actionMap': MethodActionSelector('action'),
    'scanUrlPrefix': ScanUrlSelector(56),
    'farmSetting': FarmSettingSelector(56),
    'sdkSetting': SDK_SETTING
};

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