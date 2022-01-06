import { useMemo, useState, useEffect, useCallback } from "react";
import styles from './index.less';
import { sortAddress } from '@/utils/utils';
import { useWeb3React } from '@web3-react/core';
import { useConstantLoader } from "@/constants";

// 钱包余额显示
import { asyncForEach } from "@/utils/asynctools";
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { processString } from "@/components/AcyCoinItem";
import { getAllSuportedTokensPrice } from '@/acy-dex-swap/utils';


import { Button, Icon } from 'antd';
const AcyConnectWallet = props => {

  const { onClick, isMobile, chainId: walletChainId, pendingLength, ...rest } = props;
  const { account, chainId: fallbackChainId, library } = useConstantLoader();
  const { tokenList: INITIAL_TOKEN_LIST } = useConstantLoader();
  const [tokenBalanceDict, setTokenBalanceDict] = useState();
  const [userBalance, setUserBalance]=useState(123);

  console.log("web3 and constant chainId", walletChainId, fallbackChainId)
  

  const displayedChainId = useMemo(() => {
    // if chainId from useWeb3React and useConstantLoader are different, that means user's wallet is on an unsupported chainId. 
    return walletChainId == fallbackChainId ? walletChainId : undefined
  }, [walletChainId, fallbackChainId])

  // 钱包余额
  
  const initTokenBalanceDict = (tokenList) => {
    console.log('Init Token Balance!!!! with chainId, TokenList', fallbackChainId, tokenList);
    const newTokenBalanceDict = {};
    //const tokenPriceList = {};
    asyncForEach(tokenList, async (element, index) => {
      console.log("dispatched async", element)
      const token = element;
      var { address, symbol, decimals } = token;
      const bal = await getUserTokenBalance(
        { address, symbol, decimals },
        fallbackChainId,
        account,
        library
      ).catch(err => {
        newTokenBalanceDict[token.symbol] = 0;
        console.log("Failed to load balance, error param: ", address, symbol, decimals, err);
      })
      const balString = processString(bal);
      newTokenBalanceDict[token.symbol] = balString;
      return balString;
    })
    console.log("ymj 1", newTokenBalanceDict);
    setTokenBalanceDict(newTokenBalanceDict);
    console.log("ymj 2", tokenBalanceDict);
    
  }

  const newGetAllPools = async (library, account, chainId) => {
    const tokenPriceList = await getAllSuportedTokensPrice();
    //console.log("ymj 4", tokenPriceList);
  }
  const Test = useMemo(() => {
    newGetAllPools(library, account, fallbackChainId);
    if(INITIAL_TOKEN_LIST){
      // 在这个函数set State
      initTokenBalanceDict(INITIAL_TOKEN_LIST);
    }
    // console.log('ymj 10', tokenBalanceDict)
    // if (Object.keys(tokenBalanceDict)){
    //   return tokenBalanceDict["BNB"];
    // }
    // return 0;
  }, [account, fallbackChainId])
  const Test2 = useEffect(() => {
    console.log('ymj 5', tokenBalanceDict);
    var a = tokenBalanceDict["BNB"];
    var b = Object.keys(tokenBalanceDict).length === 0 && tokenBalanceDict.constructor === Object
    var c = Object.getOwnPropertyNames(tokenBalanceDict);
    console.log("ymj 6", a, b, c); // a显示undefined
    
    //return Number(tokenBalanceDict["BNB"])
    //setUserBalance(tokenBalanceDict)
}, [tokenBalanceDict])
  

  const chainName = useMemo(() => {
    let chainName;
    switch (displayedChainId) {
      case 137:
      case 80001:
        chainName = 'Polygon'; break;
      case 97:
      case 56:
        chainName = 'BSC'; break;
      case 4:
      case 1:
        chainName = 'Ethereum'; break;
      default:
        chainName = 'Other'; break;
    }
    return chainName
  }, [displayedChainId])

  return (
    (isMobile && (
      <div {...rest} className={styles.connect}>
        {/* pending */}
        {pendingLength
          &&
          <div className={styles.pending}>
            {pendingLength} Pending <Icon type="redo" spin />
          </div>
          ||
          <div className={styles.address} onClick={onClick}>
            {account && sortAddress(account) || 'Connect'}
          </div>
        }
      </div>
    )) || (
      <div {...rest} className={styles.connect}>
        <div className={styles.wrap}>
          {/* {chainName} ( {displayedChainId || 'disconnected'} ) */}
          {chainName}
          (
          {}
          )
          {/* pending */}
          {pendingLength
            &&
            <div className={styles.pending}>
              {pendingLength} Pending <Icon type="redo" spin />
            </div>
            ||
            <div className={styles.address} onClick={onClick}>
              {account && sortAddress(account) || 'Connect'}
            </div>
          }
        </div>
      </div>
    )
  );
};
export default AcyConnectWallet;
