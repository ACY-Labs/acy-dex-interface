import React, { useState, useEffect } from 'react';
import { connect } from 'umi';
import { Button, Row, Col, Icon, Skeleton } from 'antd';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import Data, {
  fetchGeneralPoolInfoDay,
  fetchGeneralTokenInfo,
  fetchGlobalTransaction,
  fetchMarketData,
  marketClient,
} from '../Market/Data/index.js';
import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyLiquidityPositions,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyConfirm,
  AcyApprove,
} from '@/components/Acy';
import OperationHistoryTable from './components/OperationHistoryTable';
import AddComponent from '@/components/AddComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {getTransactionsByAccount} from '@/utils/txData';
import INITIAL_TOKEN_LIST from '@/constants/TokenList';
import styles from './styles.less';

const { AcyTabPane } = AcyTabs;

const BasicProfile = (props) => {

  const [visible, setVisible] = useState(false);
  const [visibleConfirmOrder, setVisibleConfirmOrder] = useState(false);
  const [visibleLoading, setVisibleLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(1);
  const [loggedIn, setLoggedIn] = useState(false);
  const [transactionList, setTransactionList] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [transactionNum, setTransactionNum] = useState(0);
  const { account, chainId, library, activate } = useWeb3React();

  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });

  useEffect(() => {
    activate(injected);
  }, []);

  // useEffect(() => {
  //   if(transactionNum > 0) setTableLoading(false);
  // }, [transactionNum]);
 
 useEffect(() => {
    getTransactionsByAccount(account,library,'LIQUIDITY').then(data =>{
      setTransactionList(data);
      if(account) setTableLoading(false);
    })
  }, [account]);

  const lineTitleRender = () => [
    <div>
      <div className={styles.maintitle}>
        <span className={styles.lighttitle}>ETH</span>/BTC
      </div>
      <div className={styles.secondarytitle}>
        <span className={styles.lighttitle}>212.123</span>{' '}
        <span className={styles.percentage}>+12.45%</span> 2021.07.11
      </div>
    </div>,
    <AcyPeriodTime
      onhandPeriodTimeChoose={this.onhandPeriodTimeChoose}
      className={styles.pt}
      times={['1D', '7D', '1M', '1Y', 'All']}
    />,
  ];

  // 时间段选择
  const onhandPeriodTimeChoose = pt => {
    console.log(pt);
  };

  // 选择Coin
  const onClickCoin = () => {
    setVisible(true)
  };

  const onCancel = () => {
      setVisible(false);
  };

  const onHandModalConfirmOrder = falg => {
      setVisibleConfirmOrder(!!falg);
  };

  const onChangeTabs = e => {
      setTabIndex(e);
  };

  const onLoggedIn = () => {
      setLoggedIn(true);
  };


  let token = null;
  if (props.location.state) {
    token = props.location.state;
    console.log(token)
  }
  // const {activate} = this.state.web3ReactContext;
  // console.log("web3react", activate);

  return (
    <PageHeaderWrapper>
      <div className={loggedIn ? styles.main : styles.main_notLoggedIn}>
        <div>{loggedIn && <AcyLiquidityPositions />}</div>
        <div>
          <AddComponent onLoggedIn={onLoggedIn} />
        </div>
      </div>
      
      {/* <AcyModal onCancel={this.onCancel} width={600} visible={visible}>
          <div className={styles.title}>
            <AcyIcon name="back" /> Select a token
          </div>
          <div className={styles.search}>
            <AcyInput
              placeholder="Enter the token symbol or address"
              suffix={<AcyIcon name="search" />}
            />
          </div>
          <div className={styles.coinList}>
            <AcyTabs>
              <AcyTabPane tab="All" key="1">
                <AcyCoinItem />
                <AcyCoinItem />
                <AcyCoinItem />
                <AcyCoinItem />
              </AcyTabPane>
              <AcyTabPane tab="Favorite" key="2" />
              <AcyTabPane tab="Index" key="3" />
              <AcyTabPane tab="Synth" key="4" />
            </AcyTabs>
          </div>
        </AcyModal> */}

      {/* <AcyConfirm
          onCancel={this.onHandModalConfirmOrder}
          title="Comfirm Order"
          visible={visibleConfirmOrder}
        >
          <div className={styles.confirm}>
            <p>ETH： 566.228</p>
            <p>BTC：2.669</p>
            <p>Price：212.123</p>
            <p>Price Impact：2.232%</p>
            <p>Liquidity Provide Fee: 0.321%</p>
            <p>Alpha: 0.371%</p>
            <p>Maximum sold: 566.221</p>
            <Button size="large" type="primary">
              Confirm
            </Button>
          </div>
        </AcyConfirm> */}

      {/* <AcyApprove
          onCancel={() => this.setState({ visibleLoading: false })}
          visible={visibleLoading}
        /> */}
      <div className={styles.operationBottomWrapper}>
        <div className={styles.operationItem}>
          <h3>
            <AcyIcon.MyIcon width={30} type="arrow" />
            <span className={styles.span}>OPERATION HISTORY</span>
          </h3>
          { account&&tableLoading ? (
          <h2 style={{ textAlign: "center", color: "white" }}>Loading <Icon type="loading" /></h2>
          ) : (
          <OperationHistoryTable
            isMobile={props.isMobile}
            dataSource={transactionList}
          />
          )}
        </div> 
      </div>
    </PageHeaderWrapper>
  );
}

export default connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))(BasicProfile);