import React, { Component } from 'react';
import { connect } from 'umi';
import classnames from 'classnames';
import { Card, Badge, Table, Divider, Button, Tabs, Row, Col, Icon } from 'antd';
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
import Media from 'react-media';
import AcyPieChart from '@/components/AcyPieChartAlpha';
import SwapComponent from '@/components/SwapComponent';
import StakeHistoryTable from './components/StakeHistoryTable';
import AddComponent from '@/components/AddComponent';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './styles.less';
const { Description } = DescriptionList;
const { AcyTabPane } = AcyTabs;

// const progressColumns = [
//   {
//     title: '时间',
//     dataIndex: 'time',
//     key: 'time',
//   },
//   {
//     title: '当前进度',
//     dataIndex: 'rate',
//     key: 'rate',
//   },
//   {
//     title: '状态',
//     dataIndex: 'status',
//     key: 'status',
//     render: text =>
//       text === 'success' ? (
//         <Badge status="success" text="成功" />
//       ) : (
//         <Badge status="processing" text="进行中" />
//       ),
//   },
//   {
//     title: '操作员ID',
//     dataIndex: 'operator',
//     key: 'operator',
//   },
//   {
//     title: '耗时',
//     dataIndex: 'cost',
//     key: 'cost',
//   },
// ];
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
  componentDidMount() { }

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
  maximize = () => {
    this.setState({
      maxLine: !this.state.maxLine,
    });
  };
  render() {
    const { visible, visibleConfirmOrder, visibleLoading, tabIndex, maxLine } = this.state;
    const { isMobile } = this.props;
    return (
      <PageHeaderWrapper>
        <div className={styles.main}>
          {
            isMobile && <div>
              <AcyCard style={{backgroundColor:"#1b1b1c", padding:"10px"}}>
                <div className={styles.trade}>

                  <SwapComponent />
                </div>
              </AcyCard>
            </div>
          }
          <div>
            {(tabIndex == 1 && (
              <AcyCard style={{ background: 'transparent' }} title={this.lineTitleRender()}>
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <div style={{
                    height: '576px',
                  }}>
                    <AcyLineChart backData={[]} showGradient={false} showXAxis={false} lineColor='#e29227' />

                  </div>
                  <AcyPeriodTime
                    onhandPeriodTimeChoose={this.onhandPeriodTimeChoose}
                    className={styles.pt}
                    times={['1D', '7D', '1M', '1Y', 'All']}
                  />
                </div>
              </AcyCard>
            )) || (
                <AcyCard>
                  <Table dataSource={dataSource} columns={columns} pagination={false} />
                </AcyCard>
              )}
          </div>
          {
            !isMobile && <div>
               <AcyCard style={{backgroundColor:"#1b1b1c", padding:"10px"}}>
                <div className={styles.trade}>
                  <SwapComponent />
                </div>
              </AcyCard>
            </div>
          }
          



        </div>

        <div className={styles.option}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <AcyCard title="Routing">
              <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <div className={styles.routing}>
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', color: '#EB5C20', borderRight: '1px solid #2c2f36' }}>
                    <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                  </div>
                  {/* <div className={styles.routing_left}>
            <p className={styles.r_title}>93.246ETH</p>
            <p className={styles.r_desc}>325,340$</p>
            <div style={{ marginTop: '30px' }}>
              <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />

            </div>
          </div> */}
                  <div className={styles.routing_middle}>
                    <div className={styles.nodes}>
                      <div className={styles.nodes_item}>
                        <span>
                          30%
                        </span>
                        <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                        <div className={styles.node}>
                          <div>
                            <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                          </div>
                          <div>
                            <p className={styles.r_title}>93.246ETH</p>
                            <p className={styles.r_desc}>325,340$</p>
                          </div>
                        </div>
                        <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                      </div>
                      <div className={styles.nodes_item}>
                        <span>
                          30%
                        </span>
                        <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                        <div className={styles.node}>
                          <div>
                            <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                          </div>
                          <div>
                            <p className={styles.r_title}>93.246ETH</p>
                            <p className={styles.r_desc}>325,340$</p>
                          </div>
                        </div>
                        <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                      </div>
                      <div className={styles.nodes_item}>
                        <span>
                          30%
                        </span>
                        <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                        <div className={styles.node}>
                          <div>
                            <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                          </div>
                          <div>
                            <p className={styles.r_title}>93.246ETH</p>
                            <p className={styles.r_desc}>325,340$</p>
                          </div>
                        </div>
                        <Icon style={{ margin: '0 10px' }} type="arrow-right" />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', color: '#EB5C20' }}>See More...</div>
                  </div>
                  {/* <div className={styles.routing_left}>
            <p className={styles.r_title}>93.246ETH</p>
            <p className={styles.r_desc}>325,340$</p>
            <div style={{ marginTop: '30px' }}>
              <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />

            </div>
          </div> */}
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', color: '#EB5C20', borderLeft: '1px solid #2c2f36' }}>
                    <AcyIcon.MyIcon width={isMobile&&30||50} type="BTC" />
                  </div>
                </div>

              </div>
            </AcyCard>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <AcyCard style={{ height: '428px' }} title="Alpha">
              <AcyPieChart />

            </AcyCard>




          </Col>
        </Row>
        </div>
        <div className={styles.option}>
        <div style={{ marginTop: '-10px', marginBottom: '30px' }}>
          <StakeHistoryTable />

        </div>

        </div>
                {/* Routing */}
             

        {/* Alpha */}
        {/* <div className={styles.routing}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', color: '#EB5C20' }}>
            <span>
              Alpha
            </span>
          </div>
          <div style={{width:'300px',height:'300px'}}>
          <AcyPieChart />

          </div>
          <div className={styles.routing_middle}>
            
            <div className={styles.nodes}>
              <div className={styles.node}>
                <div>
                  <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                </div>
                <div>
                  <p className={styles.r_title}>93.246ETH</p>
                  <p className={styles.r_desc}>325,340$</p>
                </div>
              </div>
              <div className={styles.node} style={{ opacity: '0' }}></div>
              <div className={styles.node}>
              <div>
                  <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />
                </div>
                <div>
                  <p className={styles.r_title}>93.246ETH</p>
                  <p className={styles.r_desc}>325,340$</p>
                </div>
              </div>
            </div>
            
          </div>
          <div className={styles.routing_left}>
            <p className={styles.r_title}>93.246ETH</p>
            <p className={styles.r_desc}>325,340$</p>
            <div style={{ marginTop: '30px' }}>
              <AcyIcon.MyIcon width={isMobile&&30||50} type="Eth" />

            </div>
          </div>
        </div> */}
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

export default props => (
  <Media query="(max-width: 599px)">
    {isMobile => <BasicProfile {...props} isMobile={isMobile} />}
  </Media>
);
