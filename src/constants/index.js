import TokenListSelector from './token_list';
import MethodActionSelector from './contract_method_list';
import ScanUrlPrefix from './scan_url';

// loading all constants needed in app
const ConstantLoader = (networkName) => {
    // global variable NETWORK_NAME is loaded by umi
    // configure it in /config/constant.config.ts

    // wrap constants in this variable
    const constants = {
        'tokenList': TokenListSelector(networkName ? networkName : NETWORK_NAME),
        'methodMap': MethodActionSelector('method'),
        'actionMap': MethodActionSelector('action'),
        'scanUrlPrefix': ScanUrlPrefix(networkName ? networkName : NETWORK_NAME)
    }

    // make constants readonly
    Object.freeze(constants);
    return constants;
}

export default ConstantLoader;