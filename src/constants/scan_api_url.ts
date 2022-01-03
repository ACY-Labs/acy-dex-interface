const BscMainNetAPI = {
    "scanUrl": "https://api.bscscan.com/api",
    "scanName": "BSC Scan API"
}

const BscTestNetAPI = {
    "scanUrl": "https://api-testnet.bscscan.com/api",
    "scanName": "BSC Test Scan API"
}

const PlygonMainNetAPI = {
    "scanUrl": "https://api.polygonscan.com/api",
    "scanName": "Polygon Scan API"
}

const ScanAPIUrlSelector = (arg: string) => {
    return {
        56: BscMainNetAPI,
        97: BscTestNetAPI,
        137: PlygonMainNetAPI
    }[arg];
}

export default ScanAPIUrlSelector;