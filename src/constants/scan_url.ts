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

const ScanUrlSelector = (arg: string) => {
    return {
        56: BscMainNetScan,
        97: BscTestNetScan,
        137: PolygonMainNetScan
    }[arg];
}

export default ScanUrlSelector;