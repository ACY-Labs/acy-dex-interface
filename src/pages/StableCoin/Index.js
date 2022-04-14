import { useWeb3React } from '@web3-react/core';
import { supportedTokens} from '@/acy-dex-usda/utils';
import { useConstantLoader } from '@/constants';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './styles.less';
import { connect } from 'umi';
import Media from 'react-media';
import { Banner } from './components/banner';
import { ExchangeTable } from './components/exchangeTable';
import { AcyCard } from '@/components/Acy';
import SwapComponent from './components/stableCoinComponent';
import { APYtable } from './components/apytable';
import { AccountBox } from './components/accountBox';
import { useState,useEffect } from 'react';

const icon = require('./aperture.svg');

const StableCoin = props => {
  const {account, library, chainId, farmSetting: { API_URL: apiUrlPrefix}} = useConstantLoader(props);
  const{dispatch}=props
  const [activeToken0,setActiveToken0] = useState(supportedTokens[2]);
  const [activeToken1,setActiveToken1] = useState(supportedTokens[0]);;
  
  const onGetReceipt = async (receipt, library, account) => {
    // updateTransactionList(receipt);
  };

  useEffect(() => {
    if (!supportedTokens) return

    console.log("resetting page states")
    // reset on chainId change => supportedTokens change
    setActiveToken1(supportedTokens[0]);
    setActiveToken0(supportedTokens[2]);
    // setActiveRate('Not available');
    // setRange('1D');
    // setChartData([]);
    // setAlphaTable('Line');
    // setVisibleLoading(false);
    // setVisible(false);
    // setVisibleConfirmOrder(false);
    // setTransactionList([]);
    // setTableLoading(true);
    // setTransactionNum(0);
  }, [chainId])

  useEffect(() => {
    dispatch({
      type: "swap/updateTokens",
      payload: {
        token0: activeToken0,
        token1: activeToken1
      }
    })
  }, [activeToken0, activeToken1]);

  return (
    <PageHeaderWrapper>
      <Banner />
      
      <div className={styles.dataBlock}>
        <AccountBox />
        <ExchangeTable />
      </div>

      <div className={styles.swapCard}>
        <div className={`${styles.colItem} ${styles.swapComponent}`}>
          <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
            <div className={styles.trade}>
              <SwapComponent 
              
              onSelectToken0={token => {
                setActiveToken0(token);
              }}
              onSelectToken1={token => {
                setActiveToken1(token);
              }}
              onGetReceipt={onGetReceipt}/>
            </div>
          </AcyCard>
        </div>
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))(StableCoin);
