interface FarmSetting {
    INITIAL_ALLOWED_SLIPPAGE: number,
    FACTORY_ADDRESS: string,
    INIT_CODE_HASH: string,
    WETH: string,
    NATIVE_CURRENCY: string,
    ROUTER_ADDRESS: string,
    FARMS_ADDRESS: string,
    FLASH_ARBITRAGE_ADDRESS: string,
    BLOCK_TIME: number,
    BLOCKS_PER_YEAR: number,
    BLOCKS_PER_MONTH: number,
    RPC_URL: string,
    API_URL: string
}

const calcBlocksPerPeriod = (period: 'month' | 'year', blockTime: number) => {
    if(period == 'month') {
        return 60*60*24*31 / blockTime;
    } else {
        return 60*60*24*365 / blockTime;
    }
}

const BscMainNetFarmSetting: FarmSetting = {
    INITIAL_ALLOWED_SLIPPAGE: 50,
    FACTORY_ADDRESS: "0x3d077c05c3AbCE52257E453607209f81D9db01fC",
    INIT_CODE_HASH: "0xfbf3b88d6f337be529b00f1dc9bff44bb43fa3c6b5b7d58a2149e59ac5e0c4a8",
    WETH: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    NATIVE_CURRENCY: "BNB",
    ROUTER_ADDRESS: '0x4DCa8E42634abdE1925ebB7f82AC29Ea00d34bA2',
    FARMS_ADDRESS : '0xcd0b5136d2e9972077cd769714ade9c3506fb5d6',
    FLASH_ARBITRAGE_ADDRESS: '0x4a4783Cf89593127180FD216d1302EE11f72D085',
    BLOCK_TIME: 3,
    BLOCKS_PER_YEAR: calcBlocksPerPeriod('year', 3),
    BLOCKS_PER_MONTH: calcBlocksPerPeriod('month', 3),
    RPC_URL: "https://bsc-dataseed.binance.org/",
    API_URL: "https://api.acy.finance/api"
}

const BscTestNetFarmSetting: FarmSetting = {
    INITIAL_ALLOWED_SLIPPAGE: 50,
    FACTORY_ADDRESS: "0x89D20aB13D093Eecea6C5af0a22566d4e780892A",
    INIT_CODE_HASH: "0xfbf3b88d6f337be529b00f1dc9bff44bb43fa3c6b5b7d58a2149e59ac5e0c4a8",
    WETH: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
    NATIVE_CURRENCY: "BNB",
    ROUTER_ADDRESS: '0xFc54693d805F5CFe81fd3B6Cbfe6B06dA4e88003',
    FARMS_ADDRESS : '0x6ef448ecb7f650c3a1157acf37ca19ae86dee8da',   // not yet changed
    FLASH_ARBITRAGE_ADDRESS: '0x1836DcE7B2016cDE80f241F5ed60D8eE69eAF0C8',
    BLOCK_TIME: 3,
    BLOCKS_PER_YEAR: calcBlocksPerPeriod('year', 3),
    BLOCKS_PER_MONTH: calcBlocksPerPeriod('month', 3),
    RPC_URL: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    API_URL: "http://localhost:3001/api"
}

const FarmSettingSelector = (arg: string) => {
    return {
        56: BscMainNetFarmSetting,
        97: BscTestNetFarmSetting
    }[arg];
}

export default FarmSettingSelector;