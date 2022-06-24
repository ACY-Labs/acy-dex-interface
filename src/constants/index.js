import { useState, useEffect } from "react";
import { useWeb3React } from '@web3-react/core';
import { history } from 'umi';

import TokenListSelector from './token_list';
import MethodActionSelector from './contract_method_list';
import ScanUrlSelector from './scan_url';
import ScanAPIUrlSelector from './scan_api_url';
import GlobalSettingsSelector from './global_settings';
import FarmSettingSelector from './farm_setting';
import LaunchpadSettingSelector from './launchpad_setting';
import PerpetualSelector from './perpetuals';
import SDK_SETTING from './sdk_setting';
import GAS_TOKEN_SYMBOL from "./gas_token";
import { JsonRpcProvider } from "@ethersproject/providers";
import axios from 'axios';


export const supportedChainIds = [56, 97, 137, 42161, 80001];
const defaultLibrary = new JsonRpcProvider('https://bsc-dataseed1.defibit.io/');

function replaceUrlParam(url, paramName, paramValue) {
    if (paramValue == null) {
        paramValue = '';
    }
    var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
    if (url.search(pattern) >= 0) {
        return url.replace(pattern, '$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/, '');
    return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
}


// mapping for chainId and names
const urlChainName2ChainId = (urlChainName) => {
    let urlChainId = -1;
    switch (urlChainName) {
        case "bsc":
            urlChainId = 56; break;
        case "bsctest":
            urlChainId = 97; break;
        case "polygon":
            urlChainId = 137; break;
        case "mumbai":
            urlChainId = 80001; break;
        case "arbitrum":
            urlChainId = 42161; break;
        default:
            urlChainId = -1;
    }
    return urlChainId;
}

const chainId2UrlChainName = (chainId) => {
    let chainName = "bsc";
    switch (chainId) {
        case 56:
            chainName = "bsc"; break;
        case 97:
            chainName = "bsctest"; break;
        case 137:
            chainName = "polygon"; break;
        case 80001:
            chainName = "mumbai"; break;
        case 42161:
            chainName = "arbitrum"; break;
        default:
            chainName = "other";
    }
    return chainName;
}

// get chainName from url on load
let initialChainId = parseInt(localStorage.getItem("initialChainId"));
// FOR TESTNET ONLY
if (![97, 80001].includes(initialChainId))
    initialChainId = 80001;

console.log("initialChainId: ", initialChainId);
const chainName = chainId2UrlChainName(initialChainId);
const urlWithNewChain = replaceUrlParam(window.location.href, "chain", chainName);
console.log("test replace url: ", urlWithNewChain)
// replace url without redirecting, https://stackoverflow.com/a/3503206/10566022
window.history.replaceState("", "", urlWithNewChain)

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
    'globalSettings': GlobalSettingsSelector(56),
    'perpetuals': PerpetualSelector(initialChainId),
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
    const fallbackChainId = chainSupportedIndex ? chainId : initialChainId;    // redirect unsupported chainId and undefined to 56

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
        'globalSettings': GlobalSettingsSelector(fallbackChainId),
        'perpetuals': PerpetualSelector(initialChainId)
    };

    return constants;
}


const networkParams = {
    "0x38": {
        chainId: '0x38',
        chainName: 'Binance Smart Chain Netwaok',
        nativeCurrency: {
            name: 'Binance',
            symbol: 'BNB', // 2-6 characters long
            decimals: 18
        },
        blockExplorerUrls: ['https://bscscan.com'],
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
    },
    "0x61": {
        chainId: '0x61',
        chainName: 'Binance Smart Chain Testnet',
        nativeCurrency: {
            name: 'Binance',
            symbol: 'BNB', // 2-6 characters long
            decimals: 18
        },
        blockExplorerUrls: ['https://testnet.bscscan.com'],
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
    "0x89": {
        chainId: '0x89',
        chainName: 'Polygon',
        nativeCurrency: {
            name: 'Matic',
            symbol: 'MATIC', // 2-6 characters long
            decimals: 18
        },
        blockExplorerUrls: ['https://polygonscan.com/'],
        rpcUrls: ['https://polygon-rpc.com/'],
    },
    "0xA4B1": {
        chainId: '0xA4B1',
        chainName: 'Arbitrum',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH', // 2-6 characters long
            decimals: 18
        },
        blockExplorerUrls: ['https://arbiscan.io/'],
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    },
};


// import constant to react component
export const useConstantLoader = () => {
    const { account, chainId, library } = useWeb3React();
    const [constant, setConstant] = useState(constantInstance);

    const marketChainId = Number(localStorage.getItem("market"));


    useEffect(() => {
        const chainSupportedIndex = (supportedChainIds.indexOf(chainId) !== -1);
        const fallbackChainId = chainSupportedIndex ? chainId : initialChainId;    // redirect unsupported chainId and undefined to 56
        console.log("chainId before fallback:", chainId);
        console.log("fallbackChainId chainId:", fallbackChainId);
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


    // 将实际的 chainId 显示在 url 的参数里
    const changeUrlChainId = (nextChainId) => {
        const chainName = chainId2UrlChainName(nextChainId);
        if (history.location.query.chain !== chainName) {
            // history.replace({
            //     pathname: history.location.pathname,
            //     query: {
            //       chain: chainName,
            //     },
            // })

            function replaceUrlParam(url, paramName, paramValue) {
                if (paramValue == null) {
                    paramValue = '';
                }
                var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
                if (url.search(pattern) >= 0) {
                    return url.replace(pattern, '$1' + paramValue + '$2');
                }
                url = url.replace(/[?#]$/, '');
                return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
            }
            const urlWithNewChain = replaceUrlParam(window.location.href, "chain", chainName);
            // window.location.replace(urlWithNewChain);
            // window.location.reload();
            console.log("redirected")
        }
    }


    // 请求切换 chain network
    const switchChain = async (givenChainId) => {
        if (localStorage.getItem("wallet") === "metamask") {
            try {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: givenChainId }],
                });
            } catch (e) {
                if (e.code === 4902) {
                    try {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                networkParams[givenChainId]
                            ],
                        });
                    } catch (addError) {
                        console.error(addError);
                    }
                } else {
                    // 失败时，将 url 的 chainId 切换回原本的
                    changeUrlChainId();
                }
            }
        }
        else if (localStorage.getItem("wallet") === "nabox") {
            try {
                await NaboxWallet.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: givenChainId }],
                });
            } catch (e) {
                if (e.code === 4902) {
                    try {
                        await NaboxWallet.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                networkParams[givenChainId]
                            ],
                        });
                    } catch (addError) {
                        console.error(addError);
                    }
                } else {
                    // 失败时，将 url 的 chainId 切换回原本的
                    changeUrlChainId();
                }
            }
        }
        else if (localStorage.getItem("wallet") === "binance") {
            try {
                await BinanceChain.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: givenChainId }],
                });
            } catch (e) {
                if (e.code === 4902) {
                    try {
                        await BinanceChain.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                networkParams[givenChainId]
                            ],
                        });
                    } catch (addError) {
                        console.error(addError);
                    }
                } else {
                    // 失败时，将 url 的 chainId 切换回原本的
                    changeUrlChainId();
                }
            }
        }
    }


    // // chainId 有更动时，url 显示的 chainId 也应该修改
    // useEffect(() => {
    //     // debugger;
    //     changeUrlChainId()
    //     // console.log("current chainId: " , history.location);
    //   }, [chainId])


    useEffect(() => {
        if (window.ethereum) {
            ethereum.on("chainChanged", (_chainId) => {
                const nextChainId = parseInt(_chainId);
                console.log("initialChainId changed to ", nextChainId);
                localStorage.setItem("initialChainId", nextChainId);
                window.location.reload()
                // changeUrlChainId(nextChainId)
            })
        }
    }, [])




    // // 如果手动修改 url 的 chainId，就触发切换 chain network 的请求
    // // @TODO: 用户还没 connect 钱包时不要触发 request
    // useEffect(() => {
    //     if ("chain" in history.location.query) {
    //         const urlChainName = history.location.query.chain;
    //         const urlChainId = urlChainName2ChainId(urlChainName);
    //         // localStorage.setItem("initialChainId", urlChainId);
    //         if (urlChainId !== -1 && urlChainId !== chainId) {
    //             // console.log("switch to chainId:", urlChainId);
    //             switchChain("0x".concat(urlChainId.toString(16)));
    //         }
    //     }
    // }, [history.location.query])

    return constant;
}

export const getGlobalTokenList = () => {
    const [tokenList, setTokenList] = useState([])

    useEffect(() => {
        const apiUrlPrefix = "https://api.coingecko.com/api/v3"
        axios.get(
            `${apiUrlPrefix}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1&sparkline=false`
        ).then(data => {
            let tmp = []
            data.data.map(token => {
                tmp.push({
                    name: token.name,
                    symbol: token.symbol.toUpperCase(),
                    logoURI: token.image,
                    current_price: token.current_price,
                    price_change_percentage_24h: token.price_change_percentage_24h,
                    total_volume: token.total_volume,
                    market_cap: token.market_cap,
                    max_supply: token.max_supply,
                    total_supply: token.total_supply,
                })
            })
            setTokenList(tmp)
            console.log('joy init tokenList', data.data)
        })
            .catch(e => {
                console.log(e);
            });
    }, []);

    return tokenList
}