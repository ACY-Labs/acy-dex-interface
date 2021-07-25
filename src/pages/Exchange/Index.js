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
} from '@/components/Acy';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './styles.less';

const { Description } = DescriptionList;
const { AcyTabPane } = AcyTabs;
const progressColumns = [
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '当前进度',
    dataIndex: 'rate',
    key: 'rate',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: text =>
      text === 'success' ? (
        <Badge status="success" text="成功" />
      ) : (
        <Badge status="processing" text="进行中" />
      ),
  },
  {
    title: '操作员ID',
    dataIndex: 'operator',
    key: 'operator',
  },
  {
    title: '耗时',
    dataIndex: 'cost',
    key: 'cost',
  },
];

@connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))
class BasicProfile extends Component {
  state = {
    visible: false
  }
  componentDidMount() {

  }


  lineTitleRender = () => {
    return [<div>
      <div className={styles.maintitle}><span className={styles.lighttitle}>ETH</span>/BTC</div>
      <div className={styles.secondarytitle}><span className={styles.lighttitle}>212.123</span> <span className={styles.percentage}>+12.45%</span> 2021.07.11</div>
    </div>,
    <AcyPeriodTime onhandPeriodTimeChoose={this.onhandPeriodTimeChoose} className={styles.pt} times={["24H", "1W", "1M", "1Y", "All"]} />];
  }

  // 时间段选择
  onhandPeriodTimeChoose = (pt) => {
    console.log(pt);
  }

  // 选择Coin
  onClickCoin = () => {
    this.setState({
      visible: true
    });
  }
  onCancel=()=>{
    this.setState({
      visible: false
    });
  }
  render() {
    const { visible } = this.state;
    return (
      <PageHeaderWrapper>
        <AcyCard
          title={this.lineTitleRender()}
          extra={<AcyIcon name="maximize" />}
        >
          <div style={{ width: '100%', height: '576px', background: '#000', borderRadius: '20px' }}>
              <AcyLineChart  backData={[]}/>
          </div>
        </AcyCard>
        <AcyCard
          extra={<div><AcyIcon name="time" /><AcyIcon name="setting" /></div>}
        >
          <AcyTabs>
            <AcyTabPane tab="Trade" key="1">
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
                <AcyConnectWalletBig>
                  Connect Wallet
                </AcyConnectWalletBig>
              </div>

            </AcyTabPane>
            <AcyTabPane tab="Liquidity" key="2">

            </AcyTabPane>
          </AcyTabs>
        </AcyCard>
        <AcyModal onCancel={this.onCancel} width={600} visible={visible}>
          <div className={styles.title}>
            <AcyIcon name="back" /> Select a token
          </div>
          <div className={styles.search}>
            <AcyInput placeholder="Enter the token symbol or address" suffix={<AcyIcon name="search" />} />
          </div>
          <div className={styles.coinList}>
            <AcyTabs>
              <AcyTabPane tab="All" key="1">
                <AcyCoinItem />
                <AcyCoinItem />
                <AcyCoinItem />
                <AcyCoinItem />
              </AcyTabPane>
              <AcyTabPane tab="Favorite" key="2">

              </AcyTabPane>
              <AcyTabPane tab="Index" key="3">

              </AcyTabPane>
              <AcyTabPane tab="Synth" key="4">

              </AcyTabPane>
            </AcyTabs>
          </div>
          
        </AcyModal>
      </PageHeaderWrapper>
    );
  }
}

export default BasicProfile;
