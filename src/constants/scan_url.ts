const BscMainNetScan = {
    "scanUrl": "https://www.bscscan.com",
    "scanName": "BSC Scan"
}

const BscTestNetScan = {
    "scanUrl": "https://testnet.bscscan.com",
    "scanName": "BSC Scan"
}

const ScanUrlSelector = (arg: string) => {
    return {
        56: BscMainNetScan,
        97: BscTestNetScan
    }[arg];
}

export default ScanUrlSelector;