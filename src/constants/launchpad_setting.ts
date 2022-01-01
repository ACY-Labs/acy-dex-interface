interface LaunchpadSetting {
    CHAIN_ID: number,
    ADDRESS: string,
    RPC_URL: string
    // INITIAL_ALLOWED_SLIPPAGE: number,
    // FACTORY_ADDRESS: string,
    // INIT_CODE_HASH: string,
    // WETH: string,
    // NATIVE_CURRENCY: string,
    // ROUTER_ADDRESS: string,
    // FARMS_ADDRESS: string,
    // FLASH_ARBITRAGE_ADDRESS: string,
    // BLOCK_TIME: number,
    // BLOCKS_PER_YEAR: number,
    // BLOCKS_PER_MONTH: number,
    // RPC_URL: string,
    // API_URL: string
}

const BscMainNetLaunchpadSetting: LaunchpadSetting = {
    CHAIN_ID: 56,
    ADDRESS: "0x5868c3e82B668ee74D31331EBe9e851684c8bD99",
    RPC_URL: "https://bsc-dataseed.binance.org/"
}

const BscTestNetLaunchpadSetting: LaunchpadSetting = {
    CHAIN_ID: 97,
    ADDRESS: "0x6e0EC29eA8afaD2348C6795Afb9f82e25F196436",
    RPC_URL: "https://data-seed-prebsc-1-s1.binance.org:8545/"
}

const PolygonMainNetLaunchpadSetting: LaunchpadSetting = {
    CHAIN_ID: 137,
    ADDRESS: "0x5868c3e82B668ee74D31331EBe9e851684c8bD99",
    RPC_URL: "https://polygon-rpc.com"
}

// TODO: add Polygon net

const LaunchpadSettingSelector = (arg: string) => {
    return {
        97: BscTestNetLaunchpadSetting,
        56: BscMainNetLaunchpadSetting, 
        137: PolygonMainNetLaunchpadSetting
    }[arg];
}

export default LaunchpadSettingSelector;