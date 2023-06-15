import { useMemo, useState, useEffect, useCallback } from "react";
import styles from './index.less';
import { sortAddress } from '@/utils/utils';
import { useWeb3React } from '@web3-react/core';
import { useConstantLoader } from "@/constants";
import { useHistory } from 'react-router-dom';

// 钱包余额显示
import { asyncForEach } from "@/utils/asynctools";
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { processString } from "@/components/AcyCoinItem";
import { getAllSupportedTokensPrice } from '@/acy-dex-swap/utils';


import { Button, Icon, Tooltip } from 'antd';
import { useChainId } from "@/utils/helpers";
import { useConnectWallet } from "../ConnectWallet";
const AcyConnectWallet = props => {

  const { onClick, isMobile, pendingLength, ...rest } = props;
  const { account, library } = useWeb3React()
  const { chainId, isFallbackChainId } = useChainId();

  const [userBalance, setUserBalance] = useState('0');
  const [tokenBalanceDict, setTokenBalanceDict] = useState({});
  const [tokenPriceDict, setTokenPriceDict] = useState({});
  const [balanceTitleShow, setBalanceTitleShow] = useState('inline-block');
  const [balanceShow, setBalanceShow] = useState('none');

  const history = useHistory()

  const connectWallet = useConnectWallet()

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
          <div>
            {/*  <div className={styles.address} onClick={onClick}> */}
            {account &&
              <div className={styles.address} onClick={onClick} >
                {sortAddress(account)}
              </div>
            }
            {!account &&
              <div className={styles.address} onClick={() => connectWallet} >
                Connect Wallet
              </div>
            }
          </div>
          // <div className={styles.address} onClick={() => history.push("/login")} >
          //   {account && sortAddress(account) || 'Connect Wallet'}
          // </div>
        }
      </div>
    )) || (
      <div {...rest} className={styles.connect}>
        <div className={styles.wrap}>
          {/* {chainName} ( {displayedChainId || 'disconnected'} ) */}
          {/* <Tooltip placement='bottomLeft' color={'#b5b5b6'} title="Click to show your balance" mouseEnterDelay={0.5}>

            <div className={styles.balanceBtn} onClick={balanceHandle}>
              <p style={{ display: balanceTitleShow }}>Balance</p>
              <div className={styles.showBalance} style={{ display: balanceShow }}>$ {userBalance}</div>
            </div>
          </Tooltip> */}
          {/* pending */}
          {pendingLength
            &&
            <div className={styles.pending}>
              {pendingLength} Pending <Icon type="redo" spin />
            </div>
            ||
            <div>
              {/*  <div className={styles.address} onClick={onClick}> */}
              {account &&
                <div className={styles.address} onClick={onClick} >
                  {sortAddress(account)}
                </div>
              }
              {!account &&
                <div className={styles.address} onClick={connectWallet} >
                  Connect Wallet
                </div>
              }
            </div>
            // <div className={styles.address} onClick={onClick}>
            // <div className={styles.address} onClick={() => history.push("/login")} >

            //   {account && sortAddress(account) || 'Connect Wallet'}
            // </div>
          }
        </div>
      </div>
    )
  );
};
export default AcyConnectWallet;
