import { useWeb3React } from '@web3-react/core';
import { StylesContext } from '@material-ui/styles';
import { Layout, Menu,AutoComplete, Row, Col, Button, Modal, Input, Select, Divider, Table } from 'antd';
import React from 'react';
import { useEffect, useState } from 'react';

import { useConstantLoader } from '@/constants';
import { useChainId } from '@/utils/helpers';

import Icon from '@ant-design/icons'
import { AcyModal, AcyCardList, AcyIcon } from '@/components/Acy';
import {
    DownOutlined,
    DisconnectOutlined,
    CheckCircleTwoTone,
    SwapOutlined,
    FileOutlined
} from '@ant-design/icons';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import styles from './styles.less'
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { getMenuIcon } from '@/components/SiderMenu/BaseMenu.js';
// import * as trade from '@/constants/trade.js';
import * as future from '@/constants/future.js';
import * as powers from '@/constants/powers.js';
import * as option from '@/constants/option.js';
import * as launchpad from '@/constants/launchpad.js';
// import * as stablecoin from '@/constants/stablecoin.js';

const { Option } = Select;

const Overview = props => {

    //functionalles and data
    const { account, library, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();
    let { chainId } = useChainId();
    const { active, activate } = useWeb3React();

    chainId = 80001;


    // const tradeTokenList = trade.getTokens(chainId);
    const futureTokenList = future.getTokens(chainId);
    const optionsTokenList = option.getTokens(chainId);
    const powersTokenList = powers.getTokens(chainId);
    const launchPadTokenList = launchpad.getTokens(chainId);
    // const StableCoinTokenList = stablecoin.getTokens(chainId);
    // const LaunchPadTokenList = launchpad.getTokens(chainId);
    const [activeTokenList, setActiveTokenList] = useState(futureTokenList);

    const tokenList = {
        //trade: tradeTokenList,
        "Trade": futureTokenList,
        "Future": futureTokenList,
        "Options": optionsTokenList,
        "Powers": powersTokenList,
        "StableCoin": powersTokenList, //TODO
        "Launchpad": launchPadTokenList,
        //StableCoin: StableCoinTokenList,
        //LaunchPad: LaunchPadTokenList,
    }
    const copy = value => {
        navigator.clipboard.writeText(value)
    }
    useEffect(() => {
        if (active) {
            library.on('block', () => {
                // setActiveNetwork(networkName(chainId));
                // updateLastPurchaseTime(undefined, true)
            })
            return () => {
                library.removeAllListeners('block')
            }
        }
    }, [active, library, chainId])

    //UI
    // const [selectedToken, setSelectedToken] = useState("ETH")
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState("Deposit");
    const [activeFromPage, setActiveFromPage] = useState("Trade");
    const [activeToPage, setActiveToPage] = useState("");
    const [activeToken, setActiveToken] = useState("new");
    const [state, setState] = useState
        ({
            value: '',
            copied: false,
        });

    const showModal = (type, token, pageName) => {
        setActiveFromPage(pageName)
        setActiveToken(token)
        setCurrentTransaction(type);
        setIsModalOpen(true);
        setActiveTokenList(tokenList[pageName])
        // console.log("hj check tokenlist ", pageName, tokenList.Powers, typeof tokenList)
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    // frompage is the default page in deposit,withdraw,send; and is frompage in transfer
    const selectFromPage = page => {
        setActiveFromPage(page);
    }
    //only transfer has this
    const selectToPage = page => {
        setActiveToPage(page);
    }
    const selectToken = token => {
        console.log("select token ", token)
        setActiveToken(token);
    }
    const selectNetwork = network => {
        console.log("select network ", network)
        // setActiveToken(token);
    }
    //TODO
    const currentAddress = "0x0000000000000000000000000000000000000000"

    const networkName = {
        '80001': "Mumbai",
        '137': "Polygon",
        '97': "Binance Smart Chain Testnet",
        '56': "Binance Smart Chain Mainnet",
    }
    const getNetworkName = () => {
        return networkName[chainId];
    }
    const pages = ["Trade", "Future", "Options", "Powers", "StableCoin", "Launchpad"];
    const networks = ["Binance Smart Chain Testnet", "Mumbai", "Ethereum"]
    const tokenImgURL = {
        'MATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
        'WMATIC': 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
        'BTC': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579',
        'ETH': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
        'USDC': 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png?1547042389',
        'USDT': 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png?1598003707',
        'BNB': 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850',
        'ACY': 'https://storageapi.fleek.co/5bec74db-774b-4b8a-b735-f08a5ec1c1e6-bucket/icon_acy.svg',
    }
    const getTokenImg = token => {
        return tokenImgURL[token.name]
    }


    const getPrimaryText = () => {
        if (account == undefined) {
            return "Connect Wallet"
        } else {
            return currentTransaction;
        }
    }

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
    // const tokenNameList = (
    //     <div className={styles.networkListBlock}>
    //         <AcyCardList >
    //             {tokens.map((item) => {
    //                 return (
    //                     <AcyCardList.Thin className={styles.networkListLayout}  >
    //                         {<span>{item}</span>}
    //                     </AcyCardList.Thin>
    //                 );
    //             })}
    //         </AcyCardList>
    //     </div>
    // );
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
                            {/* <Col span={6} style={{ height: "20px", marginTop: "10px" }}>{getMenuIcon(text, true)}</Col> */}
                            {/* <Col span={18}>
                                <Row style={{ fontSize: "0.8rem" }}> {text} </Row>
                                <Row style={{ fontSize: "1.2rem" }}> 0.000 USD </Row>
                            </Col> */}
                            <Col span={12} style={{ fontSize: "1.2rem" }}>{text} </Col>
                            <Col offset={2} span={10} style={{ fontSize: "1rem" }}>0.000 USD</Col>
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
                    <Button className={styles.button} onClick={() => { showModal("Deposit", "", entry.name) }}>
                        Deposit
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Withdraw", "", entry.name) }}>
                        Withdraw
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Transfer", "", entry.name) }}>
                        Transfer
                    </Button>
                    <Button className={styles.button} onClick={() => { showModal("Send", "", entry.name) }}>
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
                    price: "$ " + "400",
                    balance: "$ " + "2"
                },
                {
                    name: "ETH",
                    price: "$ " + "2000",
                    balance: "$ " + "2.222"
                },
            ]
        },
        {
            key: 2,
            name: "Future",
            description: [
                {
                    name: "BTC",
                    price: "$ " + "20000",
                    balance: "$ " + "1.111"
                },
                {
                    name: "ETH",
                    price: "$ " + "2000",
                    balance: "$ " + "2.222"
                },
                {
                    name: "MATIC",
                    price: "$ " + "1",
                    balance: "$ " + "50"
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
                    price: "$ " + "20000",
                    balance: "$ " + "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "$ " + "2000",
                    balance: "$ " + "2.222"
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
                    price: "$ " + "20000",
                    balance: "$ " + "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "$ " + "2000",
                    balance: "$ " + "2.222"
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
                    price: "$ " + "20000",
                    balance: "$ " + "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "$ " + "2000",
                    balance: "$ " + "2.222"
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
                    price: "$ " + "20000",
                    balance: "$ " + "1.111"
                },
                {
                    key: '2',
                    name: "ETH",
                    price: "$ " + "2000",
                    balance: "$ " + "2.222"
                },
            ]
        },
    ];
    const dataSource = [account];

    const getChildColumns = (pageName) => {
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
                    <div className={styles.tableDataFirstColumn} style={{ marginLeft: "2rem" }}> Token </div>
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
                    <div className={styles.tableHeaderFirst} style={{ marginLeft: "6.5rem" }}> Price </div>
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
                render: (text, entry, record) => {
                    return <div className={styles.tableData} style={{ float: "right" }}>
                        {/* <Button className={styles.button} onClick={() => { showModal("Deposit", entry.name) }}> */}
                        <Button className={styles.button} onClick={() => { showModal("Deposit", entry.name, pageName) }}>
                            Deposit
                        </Button>
                        <Button className={styles.button} onClick={() => { showModal("Withdraw", entry.name, pageName) }}>
                            Withdraw
                        </Button>
                        <Button className={styles.button} onClick={() => { showModal("Transfer", entry.name, pageName) }}>
                            Transfer
                        </Button>
                        <Button className={styles.button} onClick={() => { showModal("Send", entry.name, pageName) }}>
                            Send
                        </Button>
                    </div>
                },
            },
        ];
        return childColumns
    }


    return (
        <div className={styles.main}>
            <div className={styles.myModal} style={{ borderRadius: "5px" }}>
                <AcyModal
                    onCancel={handleCancel}
                    visible={isModalOpen}
                    className={styles.myModal}
                    style={{ backgroundColor: "black", minHeight: "35rem", borderRadius: "5px" }}
                >
                    <div className={styles.modalTitle} style={{ fontSize: "1.8rem", fontWeight: "bold" }}> {currentTransaction} </div>
                    <Divider style={{ height: "0.75px", margin: "10px 0px 6px", background: "#444444" }} />
                    <div style={{ marginBottom: "3rem" }}> </div>
                    <Col>
                        {currentTransaction == "Transfer" ?
                            <div>
                                <Row style={{ marginTop: "25px" }}>
                                    <Col span={5} style={{ fontSize: "1rem" }}>Transfer from</Col>
                                    <Col offset={9} span={4} style={{ fontSize: "1rem" }}>Transfer to</Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <div className={styles.pageSelector}>
                                            <Select
                                                defaultValue="Trade"
                                                // value={fromPage}
                                                onChange={selectFromPage}
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
                                                defaultValue="Select Page"
                                                // value={fromPage}
                                                onChange={selectToPage}
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
                                        {account == undefined ?
                                            <div className={styles.networkFixed}>
                                                {getNetworkName()}
                                            </div>
                                            :
                                            <Select
                                                defaultValue="Binance Smart Chain Testnet"
                                                // value={fromPage}
                                                onChange={selectNetwork}
                                                dropdownClassName={styles.dropDownMenu}
                                            >
                                                {networks.map(network => (
                                                    <Option className={styles.optionItem} value={network}>
                                                        {network}
                                                    </Option>
                                                ))}
                                            </Select>
                                        }
                                    </div>
                                </Row>
                                {/* <Row style={{ fontSize: "1rem", marginTop: "1rem" }}>Page Selection</Row> */}
                                {currentTransaction == "Deposit" ?
                                    <div> <Row style={{ marginTop: "1rem", marginBottom: "10px" }}> Deposit to </Row> </div>
                                    : currentTransaction == "Withdraw" ?
                                        <div> <Row style={{ marginTop: "1rem", marginBottom: "10px" }}> Withdraw from </Row> </div>
                                        :
                                        <div> <Row style={{ marginTop: "1rem", marginBottom: "10px" }}> Send from </Row> </div>
                                }
                                {

                                }
                                <div className={styles.networkSelector}>

                                    <Select
                                        // defaultValue="Trade"
                                        value={activeFromPage}
                                        onChange={selectFromPage}
                                        dropdownClassName={styles.pageDropDown}
                                    >
                                        {pages.map(page => (
                                            <Option className={styles.pageItem} value={page}>
                                                <Col span={1}>{getMenuIcon(page, true)}</Col>
                                                <Col offset={1} span={22}>{page}</Col>
                                            </Option>
                                        ))}
                                    </Select>
                                </div>

                            </div>
                        }
                        {
                            currentTransaction == "Withdraw" &&
                            <div>
                                <Row style={{ marginTop: "1rem", marginBottom: "10px" }}>Withdraw to  address </Row>
                                <Row>
                                    <div className={styles.coin} >
                                        <Input />
                                    </div>
                                </Row>
                            </div>
                        }
                        {
                            currentTransaction == "Send" &&
                            <div>
                                <Row style={{ marginTop: "1rem", marginBottom: "10px" }}>Send to  address </Row>
                                <Row>
                                    <div className={styles.coin} >
                                        <Input />
                                    </div>
                                </Row>
                            </div>
                        }
                        <Row style={{ fontSize: "1rem", marginTop: "1rem", backgroundColor: "black" }}>Coin</Row>
                        <Row>
                            <div className={styles.coin} >
                                <Select
                                    // defaultValue="Trade"
                                    value={activeToken}
                                    onChange={selectToken}
                                    dropdownClassName={styles.dropDownMenu}
                                >
                                    {activeTokenList.map(token => (
                                        <Option className={styles.optionItem} value={token.symbol}>
                                            <Col span={10}> <img src={tokenImgURL[token.symbol]} style={{ width: '20px', height: '20px' }} /></Col>
                                            <Col offset={1} span={13}> <div> {token.symbol}</div> </Col>
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </Row>
                        <Row style={{ fontSize: "1rem", marginTop: "1rem", backgroundColor: "black" }}>Amount</Row>
                        <Row>
                            <div className={styles.tokenAmount} >
                                {/* <Select
                                    // defaultValue="Select Token"
                                    value={activeToken}
                                    onChange={selectToken}
                                    dropdownClassName={styles.dropDownMenu}
                                >
                                    {activeTokenList.map(token => (
                                        <Option className={styles.optionItem} value={token.symbol}>
                                            <Col span={10}> <img src={tokenImgURL[token.symbol]} style={{ width: '20px', height: '20px' }} /></Col>
                                            <Col offset={1} span={13}> <div> {token.symbol}</div> </Col>
                                        </Option>
                                    ))}
                                </Select> */}
                                <Input
                                    value={0}
                                    onChange={e => {

                                    }}
                                    // suffix={
                                    //     <div className={styles.tokenSelector}>
                                    //         <Select
                                    //             // defaultValue="Select Token"
                                    //             value={activeToken}
                                    //             onChange={selectToken}
                                    //             dropdownClassName={styles.dropDownMenu}
                                    //         >
                                    //             {activeTokenList.map(token => (
                                    //                 <Option className={styles.optionItem} value={token.symbol}>
                                    //                     <Col span={10}> <img src={tokenImgURL[token.symbol]} style={{ width: '20px', height: '20px' }} /></Col>
                                    //                     <Col offset={1} span={13}> <div> {token.symbol}</div> </Col>
                                    //                 </Option>
                                    //             ))}
                                    //         </Select>
                                    //     </div>
                                    // }
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
                                {getPrimaryText()}
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
                                    {/* <CopyToClipboard text={currentAddress}
                                        onCopy={() => setState({ copied: true })}>
                                        <span style={{ fontSize: "0.9rem" }}>
                                            {currentAddress.substring(0, 4)}....{currentAddress.substring(37, 41)}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" ><path d="M9 43.95q-1.2 0-2.1-.9-.9-.9-.9-2.1V10.8h3v30.15h23.7v3Zm6-6q-1.2 0-2.1-.9-.9-.9-.9-2.1v-28q0-1.2.9-2.1.9-.9 2.1-.9h22q1.2 0 2.1.9.9.9.9 2.1v28q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h22v-28H15v28Zm0 0v-28 28Z" /></svg>
                                    </CopyToClipboard> */}
                                    <div className={styles.copyAddress}>
                                        <span style={{ marginRight: '5px', fontSize: "0.9rem" }}>  {currentAddress.slice(0, 6)}...{currentAddress.slice(currentAddress.length - 4, currentAddress.length)}</span>
                                        <svg height={15} style={{ marginTop: "12px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" onClick={() => { copy(currentAddress) }}><path d="M9 43.95q-1.2 0-2.1-.9-.9-.9-.9-2.1V10.8h3v30.15h23.7v3Zm6-6q-1.2 0-2.1-.9-.9-.9-.9-2.1v-28q0-1.2.9-2.1.9-.9 2.1-.9h22q1.2 0 2.1.9.9.9.9 2.1v28q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h22v-28H15v28Zm0 0v-28 28Z" /></svg>
                                    </div>
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
                                            columns={getChildColumns(record.name)}
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