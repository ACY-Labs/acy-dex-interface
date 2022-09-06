import { StylesContext } from '@material-ui/styles';
import { Layout, Menu, Row, Col, Button } from 'antd';
import React from 'react';
import Icon from '@ant-design/icons'
import { AcyPerpetualButton } from '@/components/Acy';

import {  LivePairsTable, TopVolumeTable, TrendingTable } from './OverviewTable';

import styles from './styles.less'

const { Header, Footer, Sider, Content } = Layout;

const Overview = props => {
    const test_livepairs = [
        // {
        //     name: 'Market',
        //     logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
        //     listed_since: '32s',
        //     pool_remaining: '-',
        // },
        {
            name: 'Trade',
            logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
            listed_since: '2m 40s',
            pool_remaining: '1.6236 ETH',
        },
        {
            name: 'Future',
            logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
            listed_since: '10m 30s',
            pool_remaining: '1.72683 ETH',
        },
        {
            name: 'Options',
            logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
            listed_since: '32s',
            pool_remaining: '-',
        },
        {
            name: 'Powers',
            logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
            listed_since: '2m 40s',
            pool_remaining: '1.6236 ETH',
        },
        {
            name: 'StableCoin',
            logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
            listed_since: '10m 30s',
            pool_remaining: '1.72683 ETH',
        },
        {
            name: 'Launchpad',
            logoURI: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
            listed_since: '10m 30s',
            pool_remaining: '1.72683 ETH',
        },
    ]

    return (
        <div className={styles.main}>
            <div className={styles.rowFlexContainer}>
                <Layout style={{ height: "100vh", backgroundColor: "black" }}>
                    {/* <Sider>
                        <div className="logo" />
                        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                            <Menu.Item key="1">
                                <span>Market</span>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <span>Trade</span>
                            </Menu.Item>
                            <Menu.Item key="3">
                                <span>Future</span>
                            </Menu.Item>
                            <Menu.Item key="4">
                                <span>Options</span>
                            </Menu.Item>
                            <Menu.Item key="5">
                                <span>Powers</span>
                            </Menu.Item>
                            <Menu.Item key="6">
                                <span>StableCoin</span>
                            </Menu.Item>
                        </Menu>
                    </Sider> */}
                    <Layout style={{ backgroundColor: "black" }}>
                        <Col style={{ padding: "10px", border: "0.75px solid #444444" }}>
                            <Row className={styles.overviewHeader}>
                                <Col span={4}>Account</Col>
                                <Col offset={19} >
                                    <Button className={styles.button}>Deposit</Button>
                                    <Button className={styles.button}>Withdraw</Button>
                                    <Button className={styles.button}>Transfer</Button>
                                    <div style={{fontSize:"0.7rem", padding:"5px"}}>Transaction History</div>
                                </Col>
                            </Row>
                            <Row className={styles.totalBalance}>
                                <div >
                                    <div>Estimate Balance</div>
                                    <div style={{ fontSize: "2rem" }}>0.00000</div>
                                </div>
                            </Row>
                            <Row className={styles.statsContainer}>
                                <div className={styles.statstitle}>
                                    <span className={styles.seeMore} onClick={() => { setMode('NewPairs') }}>

                                    </span>
                                </div>
                                {/* <div className={styles.statsdivider} /> */}

                                <LivePairsTable dataSource={test_livepairs} />

                            </Row>
                        </Col>
                    </Layout>
                </Layout>


            </div>
        </div>

    )
}

export default Overview