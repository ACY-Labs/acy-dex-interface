interface ContractMethod {
    name: string,
    id: string
}

interface ContractAction {
    name: string,
    hash: string
}


const methodMap: {
    [key: string]: ContractMethod
} = {
    ethToToken: {
        name: 'swapExactETHForTokens',
        id: '0x7ff36ab5'
    },
    ethToTokenArb: {
        name: 'swapExactETHForTokensByArb',
        id: '0xf4ff4e22'
    },
    ethToExactToken: {
        name : 'swapETHForExactTokens',
        id : '0xfb3bdb41'
    },
    ethToExactTokenArb: {
        name: 'swapETHForExactTokensByArb',
        id: '0x357252ac'
    },
    tokenToEth: {
        name: 'swapExactTokensForETH',
        id: '0x18cbafe5'
    },
    tokenToEthArb: {
        name: 'swapExactTokensForETHByArb',
        id: '0x00423e88'
    },            
    tokenToExactEth: {
        name: 'swapTokensForExactETH',
        id: '0x4a25d94a'
    }, 
    tokenToExactEthArb: {
        name: 'swapTokensForExactETHByArb',
        id: '0xdc1892da'
    }, 
    tokenToToken: {
        name: 'swapExactTokensForTokens',
        id: '0x38ed1739'
    },
    tokenToTokenArb: {
        name: 'swapExactTokensForTokensByArb',
        id:'0x38f0b154'
    },
    tokenToExactToken: {
        name : 'swapTokensForExactTokens',
        id : '0x8803dbee'
    },
    tokenToExactTokenArb:  {
        name: 'swapTokensForExactTokensByArb',
        id: '0xad5639fe'
    },
    
    addLiquidity : {
        name: 'addLiquidity',
        id: '0xe8e33700'
    },
    addLiquidityEth : {
        name: 'addLiquidityETH',
        id: '0xf305d719'
    },
    removeLiquidityWithPermit : {
        name: 'removeLiquidityWithPermit',
        id: '0x2195995c'
    },
    removeLiquidity : {
        name: 'removeLiquidity',
        id: '0xbaa2abde'
    },
    removeLiquidityETHwithPermit : {
        name : 'removeLiquidityETHWithPermit',
        id : '0xded9382a'
    },
    removeLiquidityETH : {
        name : 'removeLiquidityETH',
        id : '0x02751cec'
    },
}

const actionMap: {
    [key: string]: ContractAction
} = {

    transfer :    {
                    name: 'Transfer',
                    hash: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
                },
    sync :     {
                    name: 'Sync',
                    hash: '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1'
                }
}

const MethodActionSelector = (arg: string) => {
    return {
      'method': methodMap,
      'action': actionMap
    }[arg];
  }
  
export default MethodActionSelector;