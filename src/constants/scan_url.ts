const scanUrlSelector = (arg: string) => {
    return {
        'BscMainNet': "https://www.bscscan.com",
        'BscTestNet': "https://testnet.bscscan.com"
    }[arg];
}

export default scanUrlSelector;