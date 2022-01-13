const BscMainNetAPI = {
    "scanUrl": "https://api.bscscan.com/api",
    "APIKey" : "H2W1JHHRFB5H7V735N79N75UVG86E9HFH2",
    "scanName": "BSC Scan API"
}

const BscTestNetAPI = {
    "scanUrl": "https://api-testnet.bscscan.com/api",
    "APIKey" : "H2W1JHHRFB5H7V735N79N75UVG86E9HFH2",
    "scanName": "BSC Test Scan API"
}

const PlygonMainNetAPI = {
    "scanUrl": "https://api.polygonscan.com/api",
    "APIKey" : "Z5VBTTG7RFZWPZ6TUUTQ6IJ485FGFCS5QA",
    "scanName": "Polygon Scan API"
}

const PlygonTestNetAPI = {
    "scanUrl": "https://api-testnet.polygonscan.com/api",
    "APIKey" : "Z5VBTTG7RFZWPZ6TUUTQ6IJ485FGFCS5QA",
    "scanName": "Polygon Test Scan API"
}

const ScanAPIUrlSelector = (arg: string) => {
    return {
        56: BscMainNetAPI,
        97: BscTestNetAPI,
        137: PlygonMainNetAPI,
        80001: PlygonTestNetAPI
    }[arg];
}

export default ScanAPIUrlSelector;