import { useWeb3React } from '@web3-react/core';
import { StylesContext } from '@material-ui/styles';
import { Layout, Menu, AutoComplete, Row, Col, Button, Modal, Input, Select, Divider, Table } from 'antd';
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
import DepositWithdrawModal from '@/components/AccountInfoGauge/DepositWithdrawModal';
import TransferModal from '@/components/AccountInfoGauge/TransferModal';
// import * as stablecoin from '@/constants/stablecoin.js';
import { getContract } from '@/constants/future_option_power.js';
import { fetcher, formatAmount } from '@/acy-dex-futures/utils';
import useSWR from 'swr';
import Reader from '@/abis/future-option-power/Reader.json'

const { Option } = Select;

const Overview = props => {

  //functionalles and data
  let { chainId } = useChainId(421613);
  const { account, library, active, activate } = useWeb3React();

  if (!account)
    return <>No wallet account connected.</>

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
    "Futures": futureTokenList,
    "Options": optionsTokenList,
    "Powers": powersTokenList,
    // "StableCoin": powersTokenList, //TODO
    // "Launchpad": launchPadTokenList,
    //StableCoin: StableCoinTokenList,
    //LaunchPad: LaunchPadTokenList,
  }
  const copy = value => {
    navigator.clipboard.writeText(value)
  }
  useEffect(() => {
    if (active) {
      library.on('block', () => {
        updateSymbolsInfo()
        updateTdInfo()
      })
      return () => {
        library.removeAllListeners('block')
      }
    }
  }, [active, library, chainId])

  //UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFromPage, setActiveFromPage] = useState("Futures");
  const [activeToPage, setActiveToPage] = useState("");
  const [activeToken, setActiveToken] = useState("new");
  const [state, setState] = useState
    ({
      value: '',
      copied: false,
    });
  const [mode, setMode] = useState('')
  const [selectedSymbol, setSelectedSymbol] = useState('')

  const showModal = (type, token, pageName) => {
    setActiveFromPage(pageName)
    setActiveToken(token)
    setIsModalOpen(true);
    setActiveTokenList(tokenList[pageName])
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

  const networkName = {
    '80001': "Mumbai",
    '137': "Polygon",
    '97': "Binance Smart Chain Testnet",
    '56': "Binance Smart Chain Mainnet",
  }
  const getNetworkName = () => {
    return networkName[chainId];
  }
  const pages = ["Trade", "Futures", "Options", "Powers", "StableCoin", "Launchpad"];
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
    // {
    //   title: (
    //     <div className={styles.tableHeaderFirst}> </div>
    //   ),
    //   dataIndex: 'Button',
    //   key: 'Button',
    //   render: (text, entry) => {
    //     return <div className={styles.tableData} style={{ float: "right" }}>
    //       <Button className={styles.button} onClick={() => { setMode("Deposit") }}>
    //         Deposit
    //       </Button>
    //       <Button className={styles.button} onClick={() => { setMode("Withdraw") }}>
    //         Withdraw
    //       </Button>
    //       <Button className={styles.button} onClick={() => { setMode("Transfer") }}>
    //         Transfer
    //       </Button>
    //       <Button className={styles.button} onClick={() => { showModal("Send", "", entry.name) }}>
    //         Send
    //       </Button>
    //     </div>
    //   },
    // },

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
      name: "Futures",
    },
    {
      key: 3,
      name: "Options",
    },
    {
      key: 4,
      name: "Powers",
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

  const getChildColumns = (pageName) => {
    const childColumns = [
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
          pageName == 'Futures' || pageName == 'Options' || pageName == 'Powers' ?
            <div className={styles.tableDataFirstColumn} style={{ marginLeft: "2rem" }}> Symbol </div>
            : <div className={styles.tableDataFirstColumn} style={{ marginLeft: "2rem" }}> Token </div>
        ),
        key: "name",
        dataIndex: "name",
        render: (text, record) => {
          return (
            pageName == 'Futures' || pageName == 'Options' || pageName == 'Powers' ?
              <Row style={{ padding: "1rem" }}>
                <Col span={14} style={{ fontSize: "1.1rem" }}> {record.symbol} </Col>
              </Row>
              :
              <Row style={{ padding: "1rem" }}>
                {getTokenImg(record) && <Col span={8} style={{ marginTop: "1px" }}> <img height={20} src={getTokenImg(record)} /> </Col>}
                <Col span={14} style={{ fontSize: "1.1rem" }}> {record.name} </Col>
              </Row>
          );
        },
      },
      {
        title: (
          pageName == 'Futures' || pageName == 'Options' || pageName == 'Powers' ?
            <div className={styles.tableHeaderFirst}> Margin </div>
            : <div className={styles.tableHeaderFirst}> Balance </div>
        ),
        dataIndex: "balance",
        key: "balance",
        render: (text, entry) => {
          return pageName == 'Futures' || pageName == 'Options' || pageName == 'Powers' ?
            <div className={styles.tableData}>{formatAmount(tdInfo?.positions?.filter(ele => ele[1] == entry.symbol)[0].margin, 18, 2, true, 0)}</div>
            : <div className={styles.tableData}>{text}</div>;
        },
      },
      {
        title: (
          <div className={styles.tableHeaderFirst}> </div>
        ),
        dataIndex: 'button',
        key: 'button',
        render: (text, entry, record) => {
          setSelectedSymbol(entry.symbol)
          return <div className={styles.tableData} style={{ float: "right" }}>
            <Button className={styles.button} onClick={() => { setMode("Deposit") }}>
              Deposit
            </Button>
            <Button className={styles.button} onClick={() => { setMode("Withdraw") }}>
              Withdraw
            </Button>
            <Button className={styles.button} onClick={() => { setMode("Transfer") }}>
              Transfer
            </Button>
            {/* <Button className={styles.button} onClick={() => { showModal("Send", entry.name, pageName) }}>
              Send
            </Button> */}
          </div>
        },
      },
    ];
    return childColumns
  }

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")
  const { data: symbolsInfo, mutate: updateSymbolsInfo } = useSWR([chainId, readerAddress, "getSymbolsInfo", poolAddress, []], {
    fetcher: fetcher(library, Reader)
  });
  const { data: tdInfo, mutate: updateTdInfo } = useSWR([chainId, readerAddress, 'getTdInfo', poolAddress, account], {
    fetcher: fetcher(library, Reader)
  })

  return (
    <div className={styles.main}>
      <div className={styles.myModal} style={{ borderRadius: "5px" }}>
        
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
                                <span>Futures/span>
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
                <Col span={12} style={{ marginTop: "1rem", marginLeft: "10px" }}>
                  <div className={styles.copyAddress}>
                    <span style={{ marginRight: '5px', fontSize: "0.9rem" }}>  {account.slice(0, 6)}...{account.slice(account.length - 4, account.length)}</span>
                    <svg height={15} style={{ marginTop: "12px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" onClick={() => { copy(account) }}><path d="M9 43.95q-1.2 0-2.1-.9-.9-.9-.9-2.1V10.8h3v30.15h23.7v3Zm6-6q-1.2 0-2.1-.9-.9-.9-.9-2.1v-28q0-1.2.9-2.1.9-.9 2.1-.9h22q1.2 0 2.1.9.9.9.9 2.1v28q0 1.2-.9 2.1-.9.9-2.1.9Zm0-3h22v-28H15v28Zm0 0v-28 28Z" /></svg>
                  </div>
                </Col>
                <Col offset={6} span={5}>
                  <Button className={styles.button} onClick={() => { setMode("Deposit") }}>Deposit</Button>
                  <Button className={styles.button} onClick={() => { setMode("Withdraw") }}>Withdraw</Button>
                  <Button className={styles.button} onClick={() => { setMode("Transfer") }}>Transfer</Button>
                  {/* <Button className={styles.button} onClick={() => { showModal("Send") }}>Send</Button> */}
                  {/* <div style={{ fontSize: "0.7rem", padding: "5px" }}>Transaction History</div> */}
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
                  className={styles.nobgTable}
                  expandedRowRender={record => {
                    // <div style={{ background: '#1b1d23' }}>
                    return <Table
                      className={styles.nobgTable}
                      columns={getChildColumns(record.name)}
                      // showHeader={false}
                      pagination={false}
                      dataSource={
                        record.name == 'Futures' || record.name == 'Options' || record.name == 'Powers'
                          ? symbolsInfo?.filter(ele => record.name.toLowerCase().includes(ele[0]))
                          : record.description
                      }
                    />
                  }}
                  dataSource={pageData}
                  expandIconColumnIndex={0}
                  expandIconAsCell={false}
                  defaultExpandedRowKeys="1"
                />
              </Row>
            </Col>
          </Layout>
        </Layout>

      </div>
      {(mode == "Deposit" || mode == "Withdraw") &&
        <DepositWithdrawModal
          chainId={chainId}
          library={library}
          account={account}
          active={active}
          tokens={activeTokenList}
          setIsConfirming={() => { setMode('') }}
          mode={mode}
          symbol={selectedSymbol}
        />
      }
      {mode == 'Transfer' &&
        <TransferModal
          chainId={chainId}
          library={library}
          account={account}
          tokens={activeTokenList}
          handleCancel={() => { setMode('') }}
          selectedSymbol={selectedSymbol}
        />
      }
    </div>


  )
}

export default Overview