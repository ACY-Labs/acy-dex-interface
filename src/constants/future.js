import { ethers } from 'ethers';;

const contracts = {
    56: { // bsc mainnet
        Reader: "",
    },
    137: {
        // TODO: this is placeholder
        Reader: '',
    },
    97: {
        Reader: '0x6EadCd226bAEAe09016D4954A43845eD9b6046AA',
        Vault: '0x2c0Db16377ec2c80D5ed2C343DD3D0cb9268c8A0',
        USDG: '0xAAC4FA25c4Df52768B86DBC5F65774BFA25FbFA9',
        NATIVE_TOKEN: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
        Router: '0x8060631Ff0b94e7934B8768DA86cFfB513053118',
        GlpManager: '0xfd72eae36D520F477D9cBBb91B9Fe6B78bA13e95',
        GLP: '0xee0068982aA8512bE9A4b625DCC585A6388c929b',
        OrderBook: '0xE01A9BDCe95a2635144A0997FE62BCc66DB39Afe',
    },
    80001: {
        Reader: '0x4768083Eb19E78E9ECD39aCdc25C6CaE96699dF2',
        Vault: '0x24B918F5ee6E8Fc464a0fBBf5F5433C39a2e6522',
        USDG: '0xc85cC3bbEA07a7Fd4De4Cc18399A09CD821De550',
        NATIVE_TOKEN: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
        Router: '0x7eE375b63dbDA21F87fdD1A730072829Bb7bf209',
        GlpManager: '0x267DE43231876eEeB9a3E81ADc5AE65e976B4b60',
        GLP: '0x53a2eD45d06518f903782134aB28C0E99E3C3A13',
        OrderBook: '0xDbF5F6861f1F69Fc834BA9Ea8233085baeD4657c',
    },
}

const tokenLists = {
    56: [
        {
            name: "Binance Coin",
            symbol: "BNB",
            decimals: 18,
            address: ethers.constants.AddressZero,
            isNative: true,
            isShortable: true
        },
        {
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            address: "0xE971616d94335dec2E54939118AdFcB68E6dCAd6",
            isStable: true
        },
        {
            name: "Wrapped Bitcoin",
            symbol: "BTC",
            decimals: 18,
            address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
            isShortable: true
        },
        {
            name: "Wrapped ETH",
            symbol: "ETH",
            decimals: 18,
            address: "0xeBC8428DC717D440d5deCE1547456B115b868F0e",
            isShortable: true
        }
    ],
    97: [
        {
            name: "Binance Coin",
            symbol: "BNB",
            decimals: 18,
            address: ethers.constants.AddressZero,
            isNative: true,
            isShortable: true
        },
        {
            name: "Wrapped Bitcoin",
            symbol: "BTC",
            decimals: 8,
            address: "0x6E59735D808E49D050D0CB21b0c9549D379BBB39",
            isShortable: true
        },
        {
            name: "Wrapped BNB",
            symbol: "WBNB",
            decimals: 18,
            address: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
            isWrapped: true,
            baseSymbol: "BNB"
        },
        {
            name: "Wrapped ETH",
            symbol: "ETH",
            decimals: 18,
            address: "0xF471F7051D564dE03F3736EeA037D2dA2fa189c1",
            isShortable: true,
            isStable: false
        },
        {
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            address: "0xE971616d94335dec2E54939118AdFcB68E6dCAd6",
            isStable: true
        },
        {
            name: "Tether",
            symbol: "USDT",
            decimals: 18,
            address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f",
            isStable: true
        },
    ],
    80001: [
        {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
            address: ethers.constants.AddressZero,
            isNative: true,
            isShortable: true
        },
        {
            name: "Wrapped Bitcoin",
            symbol: "BTC",
            decimals: 8,
            address: "0x05d6f705C80d9F812d9bc1A142A655CDb25e2571",
            isShortable: true
        },
        {
            name: "Wrapped MATIC",
            symbol: "WMATIC",
            decimals: 18,
            address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
            isWrapped: true,
            baseSymbol: "MATIC"
        },
        {
            name: "Wrapped ETH",
            symbol: "ETH",
            decimals: 18,
            address: "0xeBC8428DC717D440d5deCE1547456B115b868F0e",
            isShortable: true,
            isStable: false
        },
        {
            name: "USD Coin",
            symbol: "USDC",
            decimals: 6,
            address: "0x7a96316B13bD7d0529e701d2ED8b9fC4E4fd8696",
            isStable: true
        },
        {
            name: "Tether",
            symbol: "USDT",
            decimals: 18,
            address: "0x158653b66fd72555F68eDf983736781E471639Cc",
            isStable: true
        },
    ],
};




export const getTokens = (chainId) => {
    return tokenLists[chainId];
}
export const getContract = (chainId, name) => {
    return contracts[chainId][name];
}

export const getTokenByAddress = (chainId, address) => getTokens(chainId).find(t => t.address.toLowerCase() == address.toLowerCase());

export const getTokenBySymbol = (chainId, symbol) => getTokens(chainId).find(t => t.symbol == symbol);