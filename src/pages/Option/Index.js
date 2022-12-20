import React, { useState, useEffect } from 'react';
import { Row, Col, Drawer } from 'antd';
import AcyCard from '@/components/AcyCard';
import OptionComponent from '@/components/OptionComponent'
import ComponentTabs from '@/components/ComponentTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';
import * as Api from '@/acy-dex-futures/Api';
import { fetcher, bigNumberify } from '@/acy-dex-futures/utils';
import { useConstantLoader } from '@/constants';
import { ethers } from 'ethers'
import useSWR from 'swr'
import Pool from '@/acy-dex-futures/abis/Pool.json'
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/future_option_power.js';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import styled from "styled-components";
import styles from './styles.less';
import AcyOptionDrawer from '@/components/AcyOptionDrawer';
import Reader from '@/abis/future-option-power/Reader.json'


const StyledDrawer = styled(Drawer)`
  .ant-drawer{
    border-radius: 0px;
    border: 0.75px solid #232323;
  }
  .ant-drawer-header{
    background-color: black;
    // border-bottom: 0.75px solid #232323;
  }
  .ant-drawer-content{
    background-color: black;
    border: 0.75px solid #232323;
    
  }
  ant-drawer-content-wrapper{
    transform: translateY(0%);
  }
  .ant-drawer-close{
    color: #b5b5b6;
  }
`

const Option = props => {
  const { account, library } = useConstantLoader();
  let { chainId } = useChainId();
  let tokens = getTokens(chainId);
  chainId = 80001

  const readerAddress = getContract(chainId, "reader")
  const poolAddress = getContract(chainId, "pool")

  const [symbol, setSymbol] = useState('BTCUSD-60000-C')

  const { data: symbolInfo, mutate: updateSymbolInfo } = useSWR([chainId, readerAddress, "getSymbolsInfo", poolAddress, []], {
    fetcher: fetcher(library, Reader)
  });
  console.log("option symbol symbolInfo:", symbolInfo)

  const option_tokens = symbolInfo.filter(ele=>ele[0] == "option")
  console.log("option symbol option_tokens:", option_tokens)

  const [mode, setMode] = useState('Buy')
  const [tableContent, setTableContent] = useState("Positions");

  const [activeToken, setActiveToken] = useState((tokens.filter(ele => ele.symbol == "BTC"))[0]);

  const [visibleBTC, setVisibleBTC] = useState(false);
  const [visibleETH, setVisibleETH] = useState(false);
  const [visibleMATIC, setVisibleMATIC] = useState(false);
  const [visibleBNB, setVisibleBNB] = useState(false);
  const [visibleToken, setVisibleToken] = useState({
    "BTC": false,
    "ETH": false,
    "MATIC": false,
    "BNB": false,
  })

  const onClickDropdownBTC = e => {
    setActiveToken((tokens.filter(ele => ele.symbol == "BTC"))[0]);
  };
  const onClickDropdownETH = e => {
    setActiveToken((tokens.filter(ele => ele.symbol == "ETH"))[0]);
  };
  const onClickDropdownMATIC = e => {
    setActiveToken((tokens.filter(ele => ele.symbol == "MATIC"))[0]);
  };
  const onClickDropdownBNB = e => {
    setActiveToken((tokens.filter(ele => ele.symbol == "BNB"))[0]);
  };

  const optionSymbols = {
    "BTC": [
      { name: "BTC-100000", tokenSymbol: "BTC", optionSymbol: "100000", type: "C", date: "20221231" },
      { name: "BTC-100000", tokenSymbol: "BTC", optionSymbol: "100000", type: "P", date: "20221231" },
      { name: "BTC-50000", tokenSymbol: "BTC", optionSymbol: "50000", type: "C", date: "20221231" },
      { name: "BTC-50000", tokenSymbol: "BTC", optionSymbol: "50000", type: "P", date: "20221231" },
      { name: "BTC 10000", tokenSymbol: "BTC", optionSymbol: "10000", type: "C", date: "20221231" },
      { name: "BTC 10000", tokenSymbol: "BTC", optionSymbol: "10000", type: "P", date: "20221231" },
      { name: "BTC 5000", tokenSymbol: "BTC", optionSymbol: "5000", type: "C", date: "20221231" },
      { name: "BTC 5000", tokenSymbol: "BTC", optionSymbol: "5000", type: "P", date: "20221231" },
    ],
    "ETH": [
      { name: "ETH-5000", tokenSymbol: "ETH", optionSymbol: "5000", type: "C" },
      { name: "ETH-5000", tokenSymbol: "ETH", optionSymbol: "5000", type: "P" },
      { name: "ETH-1000", tokenSymbol: "ETH", optionSymbol: "1000", type: "C" },
      { name: "ETH-1000", tokenSymbol: "ETH", optionSymbol: "1000", type: "P" },
      { name: "ETH-500", tokenSymbol: "ETH", optionSymbol: "500", type: "C" },
      { name: "ETH-500", tokenSymbol: "ETH", optionSymbol: "500", type: "P" },
    ],
    "MATIC": [
      { name: "MATIC-10", tokenSymbol: "MATIC", optionSymbol: "10", type: "C" },
      { name: "MATIC-10", tokenSymbol: "MATIC", optionSymbol: "10", type: "P" },
      { name: "MATIC-1", tokenSymbol: "MATIC", optionSymbol: "1", type: "C" },
      { name: "MATIC-1", tokenSymbol: "MATIC", optionSymbol: "1", type: "P" },
      { name: "MATIC-0.01", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "C" },
      { name: "MATIC-0.01", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "P" },
    ],
    "BNB": [
      { name: "BNB-500", tokenSymbol: "BNB", optionSymbol: "1000", type: "C" },
      { name: "BNB-500", tokenSymbol: "BNB", optionSymbol: "1000", type: "P" },
      { name: "BNB-300", tokenSymbol: "BNB", optionSymbol: "300", type: "C" },
      { name: "BNB-300", tokenSymbol: "BNB", optionSymbol: "300", type: "P" },
      { name: "BNB-100", tokenSymbol: "BNB", optionSymbol: "100", type: "C" },
      { name: "BNB-100", tokenSymbol: "BNB", optionSymbol: "100", type: "P" },
    ]
  };

  // let optionsBTC = [
  //   { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "C" },
  //   { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "P" },
  //   { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "C" },
  //   { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "P" },
  //   // { name: "BTC-300000", tokenSymbol: "BTC", optionSymbol: "300000", type: "C" },
  //   // { name: "BTC-300000", tokenSymbol: "BTC", optionSymbol: "300000", type: "P" },
  //   { name: "BTC 60000", tokenSymbol: "BTC", optionSymbol: "60000", type: "C" },
  //   { name: "BTC 60000", tokenSymbol: "BTC", optionSymbol: "60000", type: "P" },
  //   { name: "BTC 10000", tokenSymbol: "BTC", optionSymbol: "10000", type: "C" },
  //   { name: "BTC 10000", tokenSymbol: "BTC", optionSymbol: "10000", type: "P" },
  // ];
  // let optionsETH = [
  //   { name: "ETH-10000", tokenSymbol: "ETH", optionSymbol: "10000", type: "C" },
  //   { name: "ETH-10000", tokenSymbol: "ETH", optionSymbol: "10000", type: "P" },
  //   { name: "ETH-5000", tokenSymbol: "ETH", optionSymbol: "5000", type: "C" },
  //   { name: "ETH-5000", tokenSymbol: "ETH", optionSymbol: "5000", type: "P" },
  //   { name: "ETH-1000", tokenSymbol: "ETH", optionSymbol: "1000", type: "C" },
  //   { name: "ETH-1000", tokenSymbol: "ETH", optionSymbol: "1000", type: "P" },
  // ];
  // let optionsMATIC = [
  //   { name: "MATIC-10", tokenSymbol: "MATIC", optionSymbol: "10", type: "C" },
  //   { name: "MATIC-10", tokenSymbol: "MATIC", optionSymbol: "10", type: "P" },
  //   { name: "MATIC-1", tokenSymbol: "MATIC", optionSymbol: "1", type: "C" },
  //   { name: "MATIC-1", tokenSymbol: "MATIC", optionSymbol: "1", type: "P" },
  //   { name: "MATIC-0.01", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "C" },
  //   { name: "MATIC-0.01", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "P" },
  // ];
  // let optionsBNB = [
  //   { name: "BNB-1000", tokenSymbol: "BNB", optionSymbol: "1000", type: "C" },
  //   { name: "BNB-1000", tokenSymbol: "BNB", optionSymbol: "1000", type: "P" },
  //   { name: "BNB-300", tokenSymbol: "BNB", optionSymbol: "300", type: "C" },
  //   { name: "BNB-300", tokenSymbol: "BNB", optionSymbol: "300", type: "P" },
  //   { name: "BNB-100", tokenSymbol: "BNB", optionSymbol: "100", type: "C" },
  //   { name: "BNB-100", tokenSymbol: "BNB", optionSymbol: "100", type: "P" },
  // ];

  const KChartTokenListMATIC = ["BTC", "ETH", "MATIC"]
  const KChartTokenListETH = ["BTC", "ETH"]
  const KChartTokenListBNB = ["BTC", "ETH", "BNB"]
  const KChartTokenList = chainId === 56 || chainId === 97 ? KChartTokenListBNB
    : chainId === 137 || chainId === 80001 ? KChartTokenListMATIC
      : KChartTokenListETH
  const selectChartToken = item => {
    // onClickSetActiveToken(item)
  }
  const selectTab = item => {
    console.log("option refactor here")
    setActiveToken((tokens.filter(ele => ele.symbol == item))[0])
    let newDict = visibleToken
    Object.entries(visibleToken).forEach((token) => {
      token[0] === item
        ? newDict[token[0]] = true
        : newDict[token[0]] = false
    })
    setVisibleToken(newDict)
  }
  const onClose = () => {
    // Object.entries(visibleToken).forEach((token) => {
    //   let tokenKey = token[0]
    let newDict = visibleToken
    newDict[activeToken.symbol] = false
    setVisibleToken(newDict)
    console.log("option refactor onclose after", visibleToken, activeToken.symbol, visibleToken[activeToken.symbol])
    // })
}

  // const onCloseDrawer = () => {
  //   Object.entries(visibleToken).forEach((token) => {
  //     let tokenKey = token[0]
  //     console.log("option refactor onclose", visibleToken)

  //     setVisibleToken({tokenKey: false})
  //       // ? newDict[token[0]] = true
  //       // : newDict[token[0]] = false
  //   })
  // }

  // switch (item) {
  //   case "BTC":
  //     setVisibleBTC(true);
  //     setVisibleETH(false);
  //     setVisibleMATIC(false);
  //     setVisibleBNB(false);
  //     break;
  //   case "ETH":
  //     setVisibleBTC(false);
  //     setVisibleETH(true);
  //     setVisibleMATIC(false);
  //     setVisibleBNB(false);
  //     break;
  //   case "MATIC":
  //     setVisibleBTC(false);
  //     setVisibleETH(false);
  //     setVisibleMATIC(true);
  //     setVisibleBNB(false);
  //     break;
  //   case "BNB":
  //     setVisibleBTC(false);
  //     setVisibleETH(false);
  //     setVisibleMATIC(false);
  //     setVisibleBNB(true);
  //     break;
  //   default:
  //     break;
  // }


  // const onCloseBTC = () => {
  //   setVisibleBTC(false);
  // };
  // const onCloseETH = () => {
  //   setVisibleETH(false);
  // };
  // const onCloseBNB = () => {
  //   setVisibleBNB(false);
  // };
  // const onCloseMATIC = () => {
  //   setVisibleMATIC(false);
  // };

  useEffect(() => {
    setActiveToken((tokens.filter(ele => ele.symbol == "BTC"))[0])
  }, [tokens])

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        {/* LEFT CHARTS */}
        <>
          {mode == 'Pool' ?
            <AcyPool />
            : <div className={`${styles.colItem} ${styles.priceChart}`}>
              <div>
                <div className={styles.chartTokenSelectorTab}>
                  <Row>
                    <ComponentTabs
                      option={activeToken.symbol}
                      options={KChartTokenList}
                      onChange={selectTab}
                    />
                  </Row>
                  {visibleToken[activeToken.symbol]
                    ?
                    <Row>
                      <Col>
                          <AcyOptionDrawer
                            visibleToken={visibleToken}
                            setVisibleToken={setVisibleToken}
                            onClose={onClose}
                            activeToken={activeToken}
                            setActiveToken={setActiveToken}
                            optionSymbols={optionSymbols}
                          />
                      </Col>
                    </Row>
                    : null}
                  {/* {visibleToken["BTC"] ?
                    // <div>hi</div>
                    <AcyOptionDrawer
                      visibleToken={visibleToken}
                      setVisibleToken={setVisibleToken}
                      activeToken={activeToken}
                      optionSymbols={optionSymbols}
                    />
                    // <Row>
                    //   <Col>
                    //     <div className={styles.tokenSelector} >
                    //       <StyledDrawer
                    //         className={styles.drawerContent}
                    //         placement="bottom"
                    //         onClose={onCloseBTC}
                    //         visible={visibleBTC}
                    //         getContainer={false}
                    //         closeIcon={false}
                    //         height={"517px"}
                    //         style={{ width: "20rem" }}
                    //       >
                    //         <div className={styles.optionslist}>
                    //           {optionsBTC.map((option) => (
                    //             <div
                    //               className={styles.item}
                    //               onClick={() => {
                    //                 onClickDropdownBTC(option)
                    //                 setSymbol(option.tokenSymbol + 'USD-' + option.optionSymbol + '-' + option.type)
                    //                 onCloseBTC()
                    //               }}
                    //             >
                    //               {option.tokenSymbol}-{option.optionSymbol}-{option.type}
                    //               {option.type == "C" ?
                    //                 <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                    //                 :
                    //                 <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                    //               }
                    //             </div>
                    //           ))}
                    //         </div>
                    //       </StyledDrawer>
                    //     </div>
                    //   </Col>
                    // </Row>
                    : null} */}

                  {/* {visibleETH ?
                    <Row>
                      <Col>
                        <StyledDrawer
                          className={styles.drawerContent}
                          placement="bottom"
                          onClose={onCloseETH}
                          visible={visibleETH}
                          getContainer={false}
                          closeIcon={false}
                          height={"517px"}
                          style={{ width: "20rem" }}
                        >
                          <div className={styles.optionslist}>
                            {optionsETH.map((option) => (
                              <div
                                className={styles.item}
                                onClick={() => {
                                  onClickDropdownETH(option)
                                  setSymbol(option.tokenSymbol + 'USD-' + option.optionSymbol + '-' + option.type)
                                  onCloseETH()
                                }}
                              >
                                {option.tokenSymbol}-{option.optionSymbol}-{option.type}
                                {option.type == "C" ?
                                  <Col span={6} offset={2} style={{ fontSize: "0.8rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                                  :
                                  <Col span={6} offset={2} style={{ fontSize: "0.8rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                                }
                              </div>
                            ))}
                          </div>
                        </StyledDrawer>
                      </Col>
                    </Row> : null}

                  {visibleMATIC ?
                    <Row>
                      <Col>
                        <StyledDrawer
                          className={styles.drawerContent}
                          placement="bottom"
                          onClose={onCloseMATIC}
                          visible={visibleMATIC}
                          getContainer={false}
                          closeIcon={false}
                          height={"517px"}
                          style={{ width: "20rem", left: "10rem" }}
                        >
                          <div className={styles.optionslist}>
                            {optionsMATIC.map((option) => (
                              <div
                                className={styles.item}
                                onClick={() => {
                                  onClickDropdownMATIC(option)
                                  setSymbol(option.tokenSymbol + 'USD-' + option.optionSymbol + '-' + option.type)
                                  onCloseMATIC()
                                }}
                              >
                                {option.tokenSymbol}-{option.optionSymbol}-{option.type}
                                {option.type == "C" ?
                                  <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                                  :
                                  <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                                }
                              </div>
                            ))}
                          </div>
                        </StyledDrawer>
                      </Col>
                    </Row> : null}

                  {visibleBNB ?
                    <Row>
                      <Col>
                        <StyledDrawer
                          className={styles.drawerContent}
                          placement="bottom"
                          onClose={onCloseBNB}
                          visible={visibleBNB}
                          getContainer={false}
                          closeIcon={false}
                          height={"517px"}
                          style={{ width: "20rem", left: "10rem" }}
                        >
                          <div className={styles.optionslist}>
                            {optionsBNB.map((option) => (
                              <div
                                className={styles.item}
                                onClick={() => {
                                  onClickDropdownBNB(option)
                                  setSymbol(option.tokenSymbol + 'USD-' + option.optionSymbol + '-' + option.type)
                                  onCloseBNB()
                                }}
                              >
                                {option.tokenSymbol}-{option.optionSymbol}-{option.type}
                                {option.type == "C" ?
                                  <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                                  :
                                  <Col span={6} style={{ fontSize: "0.75rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                                }
                              </div>
                            ))}
                          </div>
                        </StyledDrawer>
                      </Col>
                    </Row> : null} */}
                </div>

              </div>
              <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
                <ExchangeTVChart
                  chartTokenSymbol={symbol}
                  pageName="Option"
                  fromToken={activeToken.symbol}
                  toToken="USDT"
                  chainId={chainId}
                />
              </div>

              <div className={styles.bottomWrapper}>
                <div className={styles.bottomTab}>
                  <ComponentTabs
                    option={tableContent}
                    options={["Positions", "Orders"]}
                    onChange={item => { setTableContent(item) }}
                  />
                </div>
              </div>
              <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', width: '100%', borderTop: '0.75px solid #333333', borderRadius: '0' }}>
                <div className={`${styles.colItem} ${styles.priceChart}`}>
                  <div className={styles.positionsTable}>
                    {tableContent == "Positions" && (
                      <div>POSITIONS</div>
                    )}
                    {tableContent == "Orders" && (
                      <div>ORDERS</div>
                    )}
                  </div>
                </div>
              </AcyCard>
            </div >
          }
        </>

        {/* RIGHT INTERACTIVE COMPONENT */}
        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <OptionComponent
              mode={mode}
              setMode={setMode}
              chainId={chainId}
              tokens={tokens}
              selectedToken={activeToken}
              symbol={symbol}
            />
          </AcyCard>
        </div>
      </div >
    </div >
  );
}

export default Option
