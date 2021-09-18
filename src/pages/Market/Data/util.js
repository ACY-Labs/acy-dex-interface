
// SAMPLE TRANSACTION DATA
// {
//     coin1: 'USDC',
//     coin2: 'WBTC',
//     type: TransactionType.SWAP,
//     totalValue: 57385063.19,
//     coin1Amount: 63.52037022,
//     coin2Amount: 93.65125987,
//     account: '0x8e4806c17347a9fc6f52b25e73c5e772973b4e3605ddc3cea30742ec8c53d13f',
//     time: '2021-09-01T04:02:39Z',
//     transactionID: ''
// }


// converts raw tx form into frontend compatible
export function convertTx(raw, id, time, type){
    return {
        coin1: raw.pool.token0.symbol,
        coin2: raw.pool.token1.symbol,
        type: type,
        totalValue: parseFloat(raw.amountUSD),
        coin1Amount: Math.abs(parseFloat(raw.amount0)),
        coin2Amount: Math.abs(parseFloat(raw.amount1)),
        account: raw.origin,
        time: new Date(time * 1000).toISOString(),
        transactionID: id
    }
    
}