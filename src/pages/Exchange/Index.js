import React, { Component } from 'react';
import { connect } from 'umi';
import classnames from 'classnames';
import { Card, Badge, Table, Divider, Button, Tabs } from 'antd';
import {
  AcyCard,
  AcyIcon,
  AcyPeriodTime,
  AcyTabs,
  AcyCuarrencyCard,
  AcyConnectWalletBig,
  AcyModal,
  AcyInput,
  AcyCoinItem,
  AcyLineChart,
  AcyConfirm,
  AcyApprove,
} from '@/components/Acy';
import SwapComponent from '@/components/SwapComponent';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './styles.less';
const { Description } = DescriptionList;
const { AcyTabPane } = AcyTabs;

const dataSource = [
  {
    key: '1',
    name: '胡彦斌',
    age: 32,
    address: '西湖区湖底公园1号',
  },
  {
    key: '2',
    name: '胡彦祖',
    age: 42,
    address: '西湖区湖底公园1号',
  },
];

const columns = [
  {
    title: 'Pool',
    dataIndex: 'name',
    key: 'name',
    width: 250,
    render: () => (
      <div className={styles.pool}>
        <div>
          <p className={styles.bigtitle}>WETH-WBTC</p>
          <p className={styles.value}>0xE34780…25f7</p>
        </div>
        {/* <div style={{ width: '100px' }}>
          <AcyIcon name="eth" width={18} />
          <AcyIcon name="eth" width={18} />
          <AcyIcon name="eth" width={18} />
          <AcyIcon name="eth" width={18} />
        </div> */}
      </div>
    ),
  },
  {
    title: 'Fee Rate',
    dataIndex: 'age',
    key: 'age',
    render: () => '0.008%',
  },
  {
    title: 'Liquidity',
    dataIndex: 'address',
    key: 'address',
    render: () => (
      <div>
        <p>5662.88 WETH</p>
        <p>26.69 WBTC</p>
      </div>
    ),
  },
  {
    title: 'My Liquidity',
    dataIndex: 'address',
    key: 'address',
    render: () => (
      <div>
        <p>5662.88 WETH</p>
        <p>26.69 WBTC</p>
      </div>
    ),
  },
  {
    title: 'Pool Share',
    dataIndex: 'address',
    key: 'address',
    render: () => (
      <div>
        <p>10%</p>
        <p>8.8%</p>
      </div>
    ),
  },
  {
    title: 'Create Time',
    dataIndex: 'address',
    key: 'address',
    render: () => '2021.07.11',
  },
  {
    title: 'Volume (24h)',
    dataIndex: 'address',
    key: 'address',
    render: () => '$ 444.21',
  },
];
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
  };
  componentDidMount() {}

  lineTitleRender = () => {
    return [
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
  };

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
  render() {
    const { visible, visibleConfirmOrder, visibleLoading, tabIndex } = this.state;
    return (
      <PageHeaderWrapper>
        {(tabIndex == 1 && (
          <AcyCard title={this.lineTitleRender()} extra={<AcyIcon name="maximize" />}>
            <div
              style={{ width: '100%', height: '576px', background: '#000', borderRadius: '20px' }}
            >
              <AcyLineChart backData={[]} />
            </div>
          </AcyCard>
        )) || (
          <AcyCard>
            <Table dataSource={dataSource} columns={columns} pagination={false} />
          </AcyCard>
        )}

        <AcyCard
          extra={
            <div>
              <AcyIcon name="time" />
              <AcyIcon name="setting" />
            </div>
          }
        >
          <AcyTabs onChange={this.onChangeTabs}>
            <AcyTabPane tab="Trade" key="1">
              <div className={styles.trade}>
                <SwapComponent />
                {/* <AcyCuarrencyCard
                  icon="eth"
                  coin="ETH"
                  yuan="566.228"
                  dollar="679545.545"
                  onClick={this.onClickCoin}
                />
                <AcyIcon name="double-right" />
                <AcyCuarrencyCard
                  title="999.999"
                  icon="eth"
                  coin="BTC"
                  yuan="566.228"
                  dollar="679545.545"
                />
                <AcyConnectWalletBig>Connect Wallet</AcyConnectWalletBig> */}
              </div>
            </AcyTabPane>
            <AcyTabPane tab="Liquidity" key="2">
              <div className={styles.trade}>
                <AcyCuarrencyCard
                  icon="eth"
                  coin="ETH"
                  yuan="566.228"
                  dollar="679545.545"
                  onClick={this.onClickCoin}
                />
                <AcyIcon name="double-right" />
                <AcyCuarrencyCard
                  title="999.999"
                  icon="eth"
                  coin="BTC"
                  yuan="566.228"
                  dollar="679545.545"
                />
                <AcyConnectWalletBig>Connect Wallet</AcyConnectWalletBig>
              </div>
              <h1>这里设计稿没有，暂时展示页面功能使用</h1>
              <Button
                style={{ marginRight: '30px' }}
                type="primary"
                onClick={() => this.onHandModalConfirmOrder(true)}
              >
                Confirm Order
              </Button>
              <Button type="primary" onClick={() => this.setState({ visibleLoading: true })}>
                Loading
              </Button>
            </AcyTabPane>
          </AcyTabs>
        </AcyCard>
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
