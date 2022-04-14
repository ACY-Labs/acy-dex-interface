import { getUserTokenBalance, supportedTokens} from '@/acy-dex-usda/utils';

import { useConstantLoader } from '@/constants';
import { useConnectWallet } from '@/components/ConnectWallet';

import styles from './accountBox.less';
import { useEffect, useState } from 'react';
import { processString } from "@/components/AcyCoinItem";

// async function getBalance(token,account,library){
//   const balance = await getUsetTokenBalance(token,account,library)
// }

// async function getBalance(token,chainId,account,library){
//   balance = await getUsetTokenBalance(token,chainId,account,library)
//   return balance
// }
async function getBalance(token, chainId, account, library) {
  const balance = await getUserTokenBalance(token, chainId, account, library)
  console.log('####balance', balance)
  return balance
}
export const AccountBox = props => {
  //read props
  const { account, library, chainId,} = useConstantLoader(props);

  const usda = supportedTokens[2]

  const [balance, setBalance] = useState('-.-')
  useEffect(async () => {
    const newBalance = await getUserTokenBalance(usda, chainId, account, library).catch(err => {
      console.log("Failed to load balance, error param: ", usda.address, usda.symbol, usda.decimals, err);
  })
  if(newBalance){
    const balString = processString(newBalance);
    setBalance(balString)
}else{
  setBalance('-.-')
}
  }, [chainId, account, library])

  return (
    <div className={styles.bannerBox}>
      <div className={styles.APYCard}>
        <div className={styles.const}>-.-</div>
        <div className={styles.state}>
          <ins>365-day trailing APY</ins>
        </div>
      </div>
      <div className={styles.accountCard}>
        <div className={styles.accountDetail}>
          <div className={styles.detailStyle}>{balance}</div>
          <div className={styles.state}>
            <ins>balance</ins>
          </div>
        </div>
        <div className={styles.accountDetail}>
          <div className={styles.detailStyle}>-.-</div>
          <div className={styles.state}>
            <ins>Pending yield</ins>
          </div>
        </div>
        <div className={styles.accountDetail}>
          <div className={styles.detailStyle}>-.-</div>
          <div className={styles.state}>
            <ins>Lifetime earnings</ins>
          </div>
        </div>
      </div>
    </div>
  );
};
