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


import { Button, Icon, Tooltip } from 'antd';
const AcyConnectWallet = props => {

  const { onClick, isMobile, chainId: walletChainId, pendingLength, ...rest } = props;
  const { account, chainId: fallbackChainId, library } = useConstantLoader();
  const { tokenList: INITIAL_TOKEN_LIST } = useConstantLoader();

  const [userBalance, setUserBalance] = useState('0');
  const [tokenBalanceDict, setTokenBalanceDict] = useState({});
  const [tokenPriceDict, setTokenPriceDict] = useState({});
  const [balanceTitleShow, setBalanceTitleShow] = useState('inline-block');
  const [balanceShow, setBalanceShow] = useState('none');


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
    if (account) {
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
      }).then(res => {
        setTokenBalanceDict(newTokenBalanceDict);
      })
    }
  }

  const getAllPrice = async() => {
    const tokenPriceList = await getAllSuportedTokensPrice().then(res => {
      setTokenPriceDict(res);
    });
  }
  useEffect(() => {
    getAllPrice(library, account, fallbackChainId);
    if (INITIAL_TOKEN_LIST) {
      initTokenBalanceDict(INITIAL_TOKEN_LIST);
    }
  }, [account, fallbackChainId])

  useEffect(() => {
    var balance = 0;
    Object.keys(tokenBalanceDict).forEach(ele => {
      balance = balance + (Number(tokenBalanceDict[ele]) * tokenPriceDict[ele]);
    })
    setUserBalance(balance.toFixed(2))
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

  const balanceHandle = async()=>{
    if (balanceShow == 'none'){
      setBalanceShow('inline-block');
      setBalanceTitleShow('none');
    }
    else {
      setBalanceShow('none');
      setBalanceTitleShow('inline-block');
    }
    //return false;
  }


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
          <Tooltip placement='bottomLeft' color={'#b5b5b6'} title="Click to show your balance" mouseEnterDelay={0.5}>
            
          <div className={styles.balanceBtn} onClick={balanceHandle}>
            <p style={{display:balanceTitleShow}}>Balance</p>
          <div className={styles.showBalance} style={{display:balanceShow}}>$ {userBalance}</div>
          </div>  
          </Tooltip>
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
