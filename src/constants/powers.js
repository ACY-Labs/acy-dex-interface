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
        NATIVE_TOKEN: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    },
    80001: {
        Reader: '0x4768083Eb19E78E9ECD39aCdc25C6CaE96699dF2',
        Vault: '0x24B918F5ee6E8Fc464a0fBBf5F5433C39a2e6522',
        NATIVE_TOKEN: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
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
            name: "Tether",
            symbol: "USDT",
            decimals: 18,
            address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f",
            isStable: true
        },
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