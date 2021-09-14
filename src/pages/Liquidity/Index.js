import React, { Component } from 'react';
import { connect } from 'umi';
import { Button } from 'antd';
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
import AddComponent from '@/components/AddComponent';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './styles.less';

const { AcyTabPane } = AcyTabs;

@connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))
class BasicProfile extends Component {
  state = {
    visible: false,
    visibleConfirmOrder: false,
    visibleLoading: false,
    tabIndex: 1,
    loggedIn: false,
  };

  componentDidMount() {}

  lineTitleRender = () => [
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
  onhandPeriodTimeChoose = pt => {
    console.log(pt);
  };

  // 选择Coin
  onClickCoin = () => {
    this.setState({
      visible: true,
    });
  };

  onCancel = () => {
    this.setState({
      visible: false,
    });
  };

  onHandModalConfirmOrder = falg => {
    this.setState({
      visibleConfirmOrder: !!falg,
    });
  };

  onChangeTabs = e => {
    this.setState({
      tabIndex: e,
    });
  };

  onLoggedIn = () => {
    this.setState({
      loggedIn: true,
    });
  };

  render() {
    const { visible, visibleConfirmOrder, visibleLoading, tabIndex, loggedIn } = this.state;
    return (
      <PageHeaderWrapper>
        <div className={loggedIn ? styles.main : styles.main_notLoggedIn}>
          <div>{loggedIn && <AcyLiquidityPositions />}</div>
          <div>
            <AcyCard style={{ backgroundColor: '#0e0304', padding: '10px' }}>
              <div className={styles.addLiquidity}>
                <AddComponent onLoggedIn={this.onLoggedIn} />
              </div>
            </AcyCard>
          </div>
        </div>

        <AcyModal onCancel={this.onCancel} width={600} visible={visible}>
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
        </AcyModal>

        <AcyConfirm
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
        </AcyConfirm>

        <AcyApprove
          onCancel={() => this.setState({ visibleLoading: false })}
          visible={visibleLoading}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BasicProfile;
