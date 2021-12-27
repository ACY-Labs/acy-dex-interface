interface FarmSetting {
    INITIAL_ALLOWED_SLIPPAGE: number,
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
    ROUTER_ADDRESS: '0x4DCa8E42634abdE1925ebB7f82AC29Ea00d34bA2',
    FARMS_ADDRESS : '0xcd0b5136d2e9972077cd769714ade9c3506fb5d6',
    FLASH_ARBITRAGE_ADDRESS: '0x4a4783Cf89593127180FD216d1302EE11f72D085',
    BLOCK_TIME: 3,
    BLOCKS_PER_YEAR: calcBlocksPerPeriod('year', 3),
    BLOCKS_PER_MONTH: calcBlocksPerPeriod('month', 3),
    RPC_URL: "https://bsc-dataseed.binance.org/",
    API_URL: "https://api.acy.finance/api"
}

const FarmSettingSelector = (arg: string) => {
    return {
        'BscMainNet': BscMainNetFarmSetting
    }[arg];
}

export default FarmSettingSelector;