import { useMemo } from "react";
import styles from './index.less';
import { sortAddress } from '@/utils/utils';
import { useWeb3React } from '@web3-react/core';
import { useConstantLoader } from "@/constants";

import { Button,Icon } from 'antd';
const AcyConnectWallet = props => {
  const { onClick, isMobile, chainId: walletChainId, pendingLength, ...rest } = props;
  const {account, chainId: fallbackChainId} = useConstantLoader();
  console.log("web3 and constant chainId", walletChainId, fallbackChainId)
  
  const displayedChainId = useMemo(() => {
    // if chainId from useWeb3React and useConstantLoader are different, that means user's wallet is on an unsupported chainId. 
    return walletChainId == fallbackChainId ? walletChainId : undefined
  }, [walletChainId, fallbackChainId])
  
  const chainName = useMemo(() => {
    let chainName;
    switch (displayedChainId) {
      case 137:
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
                {pendingLength} Pending <Icon type="redo" spin/>
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
          {chainName} ( {displayedChainId || 'disconnected'} )
          {/* pending */}
          {pendingLength
            &&
              <div className={styles.pending}>
                {pendingLength} Pending <Icon type="redo" spin/>
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
