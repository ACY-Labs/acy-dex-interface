const BscMainNetScan = {
    "scanUrl": "https://www.bscscan.com",
    "scanName": "BSC Scan"
}

const BscTestNetScan = {
    "scanUrl": "https://testnet.bscscan.com",
    "scanName": "BSC Scan"
}

const PolygonMainNetScan = {
    "scanUrl": "https://polygonscan.com",
    "scanName": "Polygon Scan"
}

const PolygonTestNetScan = {
    "scanUrl": "https://mumbai.polygonscan.com",
    "scanName": "Polygon Scan"
}

const ScanUrlSelector = (arg: string) => {
    return {
        56: BscMainNetScan,
        97: BscTestNetScan,
        137: PolygonMainNetScan,
        80001: PolygonTestNetScan
    }[arg];
}

export default ScanUrlSelector;