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
        // Reader: '0x4768083Eb19E78E9ECD39aCdc25C6CaE96699dF2',
        Vault: '0x24B918F5ee6E8Fc464a0fBBf5F5433C39a2e6522',
        NATIVE_TOKEN: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
        Router: '0x7eE375b63dbDA21F87fdD1A730072829Bb7bf209',
        
        oracleManager: '0x1F9c627BD3E8ef0b7152e4a3fAbD0B3eF1676821',
        pool: '0xFd940a610A820b2e72Fd6cAaC4F903646d8906f3',
        poolImplementation: '0xaB3d8DF435309C475449a836475A9f8154c39194',
        symbolManager: "0x9CC0b982f427b1dE01E46610d8247F4b10a81AAf",
        symbolManagerImplementation: "0xbEe6eDABcC42Ed8c0B46b6fcA8Ec04decaDc0A09",
        alp: "0x002d190863243E09e83245FEE736B0B463Af5a74",
        symbolsLens: "0xE56710F67eAf87Cf998fb3bFf4B1332080942b2F",
        reader: "0xE74C76425bf0EaBfC88813A0dFf9952d136aA171",
      },
}

const tokenLists = {
    56: [
       
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
    ],
    80001: [
        {
            name: "Tether",
            symbol: "USDT",
            decimals: 18,
            address: "0x3C8e6FCaB51e01bd6e70A8e3d7A579c37d69f971",
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