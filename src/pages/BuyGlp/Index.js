/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions */
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { useWeb3React } from '@web3-react/core'
import { AcyIcon,} from '@/components/Acy'
import PageHeaderWrapper from '@/components/PageHeaderWrapper'
import GlpSwap from './components/GlpSwap'
import styles from './styles.less';

const POLYGON = 137;

const BuyGlp = () => {

  const { chainId } = useWeb3React();
  const history = useHistory()
  const [isBuying, setIsBuying] = useState(true)

  useEffect(() => {
    const hash = history.location.hash.replace('#', '')
    const buying = !(hash === 'redeem') 
    setIsBuying(buying)
  }, [history.location.hash])

  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
        <div className={styles.titleblock}>
          <h3>
            <AcyIcon.MyIcon width={30} type="arrow" />
            <span className={styles.span}>Buy / Sell GLP</span>
          </h3>
          <div className={styles.subtitle}>
            Purchase GLP tokens to earn {chainId === POLYGON ? 'MATIC' : 'BNB'} fees from swaps and leverages trading.<br />Note that there is a minimum holding time of 15 minutes after a purchase.<br />
          </div>
        </div>
        <GlpSwap isBuying={isBuying} setIsBuying={setIsBuying} />
      </div>
      
    </PageHeaderWrapper>

  );
}

export default BuyGlp;