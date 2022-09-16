import { StylesContext } from '@material-ui/styles';
import { Layout, Menu, Row, Col, Button, Modal, Input, Select, Divider, Table } from 'antd';
import React from 'react';
import { useEffect, useState } from 'react';
import Icon from '@ant-design/icons'
import { AcyPerpetualButton, AcyModal, AcyCardList, AcyIcon } from '@/components/Acy';
import {
    DownOutlined,
    DisconnectOutlined,
    CheckCircleTwoTone,
    SwapOutlined,
    FileOutlined
} from '@ant-design/icons';

import { LivePairsTable, TopVolumeTable, TrendingTable } from './OverviewTable';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import styles from './styles.less'
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { getMenuIcon } from '@/components/SiderMenu/BaseMenu.js';
import { getToken } from '@/constants/future';
// import {btcIcon} from '/btc.svg';
// import { maticIcon } from "https://cryptologos.cc/logos/polygon-matic-logo.svg?v=017";

const { Header, Footer, Sider, Content } = Layout;
const { Option } = Select;


const Overview = props => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState("Deposit");
    const [activeFromPage, setActiveFromPage] = useState("Deposit");
    const [activeToPage, setActiveToPage] = useState("Withdraw");
    const [activeToken, setActiveToken] = useState("BTC");

    const [state, setState] = useState
        ({
            value: '',
            copied: false,
        });

    const showModal = (type) => {
        setCurrentTransaction(type)
        console.log("hjhjhj showmodal pressed", type, currentTransaction)
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const handleOnClick = (type) => {
        console.log("hjhjhjhj overview onclick", type);
        setIsModalOpen(true)
    }

    const selectPage = page => {
        console.log("hjhjhj activefrompage selected",)
        setActiveFromPage(page);
    }
    const selectToken = token => {
        console.log("hjhjhj activetoken selected",)
        setActiveToken(token);
    }
    const currentAddress = "0x0000000000000000000000000000000000000000"

    const tokenImgURL = {
        'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
        'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
        'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
        'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
        'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
        'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850',
    }
    const getTokenImg = token => {
        console.log("tokenImgURL.token", token.name, tokenImgURL[token.name])
        return tokenImgURL[token.name]
    }

    const tokens = [
        "BTC", "ETH", "ACY"
    ]
    const pages = ["Trade", "Future", "Options", "Powers", "StableCoin", "Launchpad"];
    const networks = ["Binance Smart Chain Testnet", "Mumbai", "Ethereum"]

    const pageNameList = (
        <div className={styles.networkListBlock}>
            <AcyCardList>
                {pages.map((page) => {
                    return (
                        <AcyCardList.Thin className={styles.networkListLayout}>
                            {<span>{page}</span>}
                        </AcyCardList.Thin>
                    );
                })}
            </AcyCardList>
        </div>
    );
    const tokenNameList = (
        <div className={styles.networkListBlock}>
            <AcyCardList >
                {tokens.map((item) => {
                    return (
                        <AcyCardList.Thin className={styles.networkListLayout}  >
                            {<span>{item}</span>}
                        </AcyCardList.Thin>
                    );
                })}
            </AcyCardList>
        </div>
    );
    const columns = [
        {
            title: (
                <div className={styles.tableDataFirstColumn}> # </div>
            ),
            key: "index",
            dataIndex: "index",
        },
        {
            title: (
                <div className={styles.tableHeaderFirst}> Page Name </div>
            ),
            key: "name",
            dataIndex: "name",
            render: (text, entry) => {
                return (
                    <div className={styles.tableData}>
                        <Row>
                            <Col span={6} style={{ height: "20px", marginTop: "10px" }}>{getMenuIcon(text, true)}</Col>
                            <Col span={18}>
                                <Row style={{ fontSize: "0.8rem" }}> {text} </Row>
                                <Row style={{ fontSize: "1.2rem" }}> 0.000 USD </Row>
                            </Col>
                        </Row>
                    </div>
                );
            },
        },
        {
            title: (
                <div className={styles.tableHeaderFirst}> Price </div>
            ),
            dataIndex: "Price",
            key: "Price",
            render: (text, entry) => {
                return <div className={styles.tableData}></div>;
            },
        },
        {
            title: (
                <div className={styles.tableHeaderFirst}> Balance </div>
            ),
            dataIndex: "Balance",
            key: "Balance",
            render: (text, entry) => {
                return <div className={styles.tableData}></div>;
            },
        },
        {
            title: (
                <div className={styles.tableHeaderFirst}> </div>
            ),
            dataIndex: 'Button',
            key: 'Button',
            render: (text, entry) => {
                return <div className={styles.tableData} style={{ float: "right" }}>
                    {/* <Button className={styles.button} onClick={() => { showModal("Deposit", entry.name) }}> */}
                    <Button className={styles.button} onClick={() => { showModal("Deposit") }}>
                        Deposit
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Withdraw") }}>
                        Withdraw
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Transfer") }}>
                        Transfer
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Send") }}>
                        Send
                    </Button>
                </div>
            },
        },

    ];
    const pageData = [
        {
            key: 1,
            name: "Trade",
            token: "BTC",
            price: "20000.00",
            description: [
                {
                    name: "BNB",
                    price: "400",
                    balance: "2"
                },
                {
                    name: "ETH",
                    price: "2000",
                    balance: "2.222"
                },
            ]
        },
        {
            key: 2,
            name: "Future",
            description: [
                {
                    name: "BTC",
                    price: "20000",
                    balance: "1.111"
                },
                {
                    name: "ETH",
                    price: "2000",
                    balance: "2.222"
                },
                {
                    name: "MATIC",
                    price: "1",
                    balance: "50"
                },
            ]
        },
        {
            key: 3,
            name: "Options",
            description: [
                {
                    key: '1',
                    name: "BTC",
                    price: "20000",
                    balance: "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "2000",
                    balance: "2.222"
                },
            ]
        },
        {
            key: 4,
            name: "Powers",
            description: [
                {
                    key: '1',
                    name: "BTC",
                    price: "20000",
                    balance: "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "2000",
                    balance: "2.222"
                },
            ]
        },
        {
            key: 5,
            name: "StableCoin",
            description: [
                {
                    key: '1',
                    name: "BTC",
                    price: "20000",
                    balance: "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "2000",
                    balance: "2.222"
                },
            ]
        },
        {
            key: 6,
            name: "Launchpad",
            description: [
                {
                    key: '1',
                    name: "BTC",
                    price: "20000",
                    balance: "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "2000",
                    balance: "2.222"
                },
            ]
        },
    ];

    const childColumns = [
        {
            title: (
                <div className={styles.tableDataFirstColumn}>  </div>
            ),
            key: "key",
            dataIndex: "key",
        },
        {
            title: (
                <div className={styles.tableDataFirstColumn}>  </div>
            ),
            key: "logoURI",
            dataIndex: "logoURI",
            render: (text, entry) => {
                return <div >{text}</div>;
            },
        },
        {
            title: (
                <div className={styles.tableDataFirstColumn} style={{marginLeft:"2rem"}}> Token </div>
            ),
            key: "name",
            dataIndex: "name",
            render: (text, record) => {
                return (
                    <Row style={{ padding: "1rem" }}>
                        <Col span={8} style={{ marginTop: "1px" }}> <img height={20} src={getTokenImg(record)} /> </Col>
                        <Col span={14} style={{ fontSize: "1.1rem" }}> {record.name} </Col>
                    </Row>
                );
            },
        },
        {
            title: (
                <div className={styles.tableHeaderFirst}  style={{marginLeft:"6.5rem"}}> Price </div>
            ),
            dataIndex: "price",
            key: "price",
            render: (text, entry) => {
                return <div className={styles.tableData} style={{ marginLeft: "100px" }}>{text}</div>;
            },
        },
        {
            title: (
                <div className={styles.tableHeaderFirst}> Balance </div>
            ),
            dataIndex: "balance",
            key: "balance",
            render: (text, entry) => {
                return <div className={styles.tableData}>{text}</div>;
            },
        },
        {
            title: (
                <div className={styles.tableHeaderFirst}> </div>
            ),
            dataIndex: 'button',
            key: 'button',
            render: (text, entry) => {
                return <div className={styles.tableData} style={{ float: "right" }}>
                    {/* <Button className={styles.button} onClick={() => { showModal("Deposit", entry.name) }}> */}
                    <Button className={styles.button} onClick={() => { showModal("Deposit") }}>
                        Deposit
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Withdraw") }}>
                        Withdraw
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Transfer") }}>
                        Transfer
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Send") }}>
                        Send
                    </Button>
                </div>
            },
        },
    ];

    return (
        <div className={styles.main}>
            <div className={styles.myModal} style={{ borderRadius: "5px" }}>
                <AcyModal
                    onCancel={handleCancel}
                    visible={isModalOpen}
                    className={styles.myModal}
                    style={{ backgroundColor: "black", height: "35rem", borderRadius: "5px" }}
                >
                    <div className={styles.modalTitle} style={{ fontSize: "1.8rem", fontWeight: "bold" }}> {currentTransaction} </div>
                    <Divider style={{ height: "0.75px", margin: "10px 0px 6px", background: "#444444" }} />
                    <div style={{ marginBottom: "3rem" }}>Some random explanations here</div>
                    <Col>
                        {currentTransaction == "Transfer" ?
                            <div>
                                <Row style={{ marginTop: "25px" }}>
                                    <Col span={4} style={{ fontSize: "1rem" }}>From</Col>
                                    <Col offset={10} span={4} style={{ fontSize: "1rem" }}>To</Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <div className={styles.pageSelector}>
                                            <Select
                                                defaultValue="Trade"
                                                // value={fromPage}
                                                onChange={selectPage}
                                                dropdownClassName={styles.dropDownMenu}
                                            >
                                                {pages.map(page => (
                                                    <Option className={styles.optionItem} value={page}>
                                                        {page}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>

                                    </Col>
                                    <Col offset={2} span={1}> <SwapOutlined /> </Col>
                                    <Col offset={1} span={10}>
                                        <div className={styles.pageSelector} style={{ width: "" }}>
                                            <Select
                                                defaultValue="Future"
                                                // value={fromPage}
                                                onChange={selectPage}
                                                dropdownClassName={styles.dropDownMenu}
                                            >
                                                {pages.map(page => (
                                                    <Option className={styles.optionItem} value={page}>
                                                        {page}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </Col>
                                </Row>
                            </div> :
                            //other than transfer page is here
                            <div>
                                <Row style={{ marginTop: "10px", marginBottom: "10px" }}> Network </Row>
                                <Row>
                                    <div className={styles.networkSelector}>
                                        <Select
                                            defaultValue="Binance Smart Chain Testnet"
                                            // value={fromPage}
                                            onChange={selectToken}
                                            dropdownClassName={styles.dropDownMenu}
                                        >
                                            {networks.map(network => (
                                                <Option className={styles.optionItem} value={network}>
                                                    {network}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </Row>
                                {/* <Row style={{ fontSize: "1rem", marginTop: "1rem" }}>Page Selection</Row> */}
                                <Row style={{ marginTop: "10px", marginBottom: "10px" }}> Page Selection </Row>
                                <div className={styles.networkSelector}>
                                    <Select
                                        defaultValue="Trade"
                                        // value={fromPage}
                                        onChange={selectPage}
                                        dropdownClassName={styles.dropDownMenu}
                                    >
                                        {pages.map(page => (
                                            <Option className={styles.optionItem} value={page}>
                                                {page}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                            </div>
                        }

                        <Row style={{ fontSize: "1rem", marginTop: "1rem", backgroundColor: "black" }}>Amount</Row>
                        <Row>
                            <div className={styles.tokenAmount} >
                                <Input
                                    value={0}
                                    onChange={e => {

                                    }}
                                    suffix={
                                        <div className={styles.tokenSelector}>
                                            <Select
                                                defaultValue="BTC"
                                                // value={fromPage}
                                                onChange={selectToken}
                                                dropdownClassName={styles.dropDownMenu}
                                            >
                                                {tokens.map(token => (
                                                    <Option className={styles.optionItem} value={token}>
                                                        {token}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    }
                                    style={{ height: "2rem" }}
                                />
                            </div>
                        </Row>
                        <Row span={24} style={{ fontSize: "1rem", marginTop: "1rem" }}>Available: 0.0000BTC</Row>
                        {currentTransaction == "Send" ?
                            <div>
                                <Row style={{ fontSize: "1rem", marginTop: "1rem", backgroundColor: "black" }}>Recipient Address</Row>
                                <Row >
                                    <div className={styles.tokenAmount} >
                                        <Input
                                            value={"0x"}
                                            onChange={e => {

                                            }}
                                            // suffix={   }
                                            style={{ height: "3rem", backgroundColor: "black", border: "0.75px solid #444444" }}
                                        />
                                    </div>
                                </Row>

                            </div> : null

                        }

                        <Row span={24} style={{ width: "10rem" }}>
                            <Button className={styles.confirmButton}>
                                Confirm
                            </Button>
                        </Row>
                    </Col>
                </AcyModal>
            </div>
            <div className={styles.rowFlexContainer}>
                <Layout style={{ height: "100vh", backgroundColor: "black" }}>
                    {/*  might add later
                        <Sider>
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
                                <Col span={3} style={{ fontSize: "2.6rem", marginLeft: "10px" }}>Account</Col>
                                <Col span={8} style={{ marginTop: "1rem", marginLeft: "10px" }}>
                                    <CopyToClipboard text={currentAddress}
                                        onCopy={() => setState({ copied: true })}>
                                        <span style={{ fontSize: "0.9rem"}}><FileOutlined />{currentAddress.substring(0,4)}....{currentAddress.substring(37,41)}</span>
                                    </CopyToClipboard>
                                </Col>
                                <Col offset={6} span={5}>
                                    <Button className={styles.button} onClick={() => { showModal("Deposit") }}>Deposit</Button>
                                    <Button className={styles.button} onClick={() => { showModal("Withdraw") }}>Withdraw</Button>
                                    <Button className={styles.button} onClick={() => { showModal("Transfer") }}>Transfer</Button>
                                    <Button className={styles.button} onClick={() => { showModal("Send") }}>Send</Button>
                                    <div style={{ fontSize: "0.7rem", padding: "5px" }}>Transaction History</div>
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
                                <Table
                                    columns={columns}
                                    showHeader={false}
                                    className={styles.mainTable}
                                    expandedRowRender={record => {
                                        // <div style={{ background: '#1b1d23' }}>
                                        return <Table
                                            className={styles.childTable}
                                            columns={childColumns}
                                            // showHeader={false}
                                            pagination={false}
                                            dataSource={record.description}
                                        />
                                    }}
                                    dataSource={pageData}
                                    expandIconColumnIndex={0}
                                    expandIconAsCell={false}
                                />
                            </Row>
                        </Col>
                    </Layout>
                </Layout>

            </div>
        </div>


    )
}

export default Overview