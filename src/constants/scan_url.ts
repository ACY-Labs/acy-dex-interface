const ScanUrlSelector = (arg: string) => {
    return {
        56: "https://www.bscscan.com",
        97: "https://testnet.bscscan.com"
    }[arg];
}

export default ScanUrlSelector;