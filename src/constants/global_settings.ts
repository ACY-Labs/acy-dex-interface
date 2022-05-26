const BscMainNet = {
    "onBlockUpdateInterval": 8,
}

const BscTestNet = {
    "onBlockUpdateInterval": 8,
}

const PolygonMainNet = {
    "onBlockUpdateInterval": 4,
}

const PolygonTestNet = {
    "onBlockUpdateInterval": 4,
}

const GlobalSettingsSelector = (arg: string) => {
    return {
        56: BscMainNet,
        97: BscTestNet,
        137: PolygonMainNet,
        80001: PolygonTestNet
    }[arg];
}

export default GlobalSettingsSelector;