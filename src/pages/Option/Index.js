import React, { useState, useEffect } from 'react';
import { Row, Col, Drawer } from 'antd';
import AcyCard from '@/components/AcyCard';
import OptionComponent from '@/components/OptionComponent'
import PerpetualTabs from '@/components/PerpetualComponent/components/PerpetualTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';
import * as Api from '@/acy-dex-futures/Api';
import { bigNumberify } from '@/acy-dex-futures/utils';
import { useConstantLoader } from '@/constants';
import { ethers } from 'ethers'
import Pool from '@/acy-dex-futures/abis/Pool.json'
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/option.js';

import styled from "styled-components";
import styles from './styles.less'
import { PositionTable } from '@/components/OptionComponent/TableComponent';

import { fetcher,getProvider } from '@/acy-dex-futures/utils';
import Reader from '@/abis/future-option-power/Reader.json'
import useSWR from 'swr'
import { useWeb3React } from '@web3-react/core';

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
   
function safeDiv(a, b) {
    return b==0 ? 0 : a.div(b).toNumber();
}

export function getPosition(rawPositionData,symbolData) {
  if (!rawPositionData || !symbolData) {
    return
  }
  let positionQuery = []
  for(let i = 0; i < rawPositionData.positions.length; i++){
    const temp = rawPositionData.positions[i]
    const markPrice = symbolData.find(obj => {
      return obj.address === temp[0]
    }).markPrice
    const initialMarginRatio = symbolData.find(obj => {
      return obj.address === temp[0]
    }).initialMarginRatio
    const indexPrice = symbolData.find(obj => {
      return obj.address === temp[0]
    }).indexPrice
    const marginUsage = Math.abs(temp[2].toNumber() * indexPrice) * initialMarginRatio
    const unrealizedPnl = temp[2].toNumber() * indexPrice - temp.cost
    const position = {
      symbol: temp[1],
      address: temp[0],
      position: temp[2].toNumber(),
      entryPrice: safeDiv(temp.cost,temp[2]),
      markPrice: symbolData.find(obj => {
        return obj.address === temp[0]
      }).markPrice,
      marginUsage: symbolData.find(obj => {
        return obj.address === temp[0]
      }).initialMarginRatio,
      unrealizedPnl: symbolData.find(obj => {
        return obj.address === temp[0]
      }).indexPrice,
      accountFunding: temp.cumulativeFundingPerVolume.toNumber() * temp[2].toNumber(),
      type:temp[2].toNumber()>=0?"Long":"Short",
    };
    positionQuery.push(position)
  }
  return positionQuery;
}

export function getSymbol(rawSymbolData){
  if (!rawSymbolData) {
    return
  }
  let symbolQuery = []
  for(let i = 0; i < rawSymbolData.length; i++){
    const temp = rawSymbolData[i]
    const symbol = {
      symbol: temp[1],
      address: temp[2],
      markPrice: temp.markPrice.div(bigNumberify('1000000000000000000')).toNumber(),
      indexPrice: temp.indexPrice.div(bigNumberify('1000000000000000000')).toNumber(),
      initialMarginRatio: temp.initialMarginRatio.div(bigNumberify('1000000000000000000')).toNumber(),
    };
    symbolQuery.push(symbol)
  }
  return symbolQuery;
}

const Option = props => {
  const { account, library } = useConstantLoader(props);
  const { active } = useWeb3React()
  let { chainId } = useChainId();
  let tokens = getTokens(chainId);

  const [mode, setMode] = useState('Buy')
  const [symbol, setSymbol] = useState('BTCUSD-60000-C')
  const [tableContent, setTableContent] = useState("Positions");

  const [activeToken, setActiveToken] = useState((tokens.filter(ele => ele.symbol == "BTC"))[0]);

  const [visibleBTC, setVisibleBTC] = useState(false);
  const [visibleETH, setVisibleETH] = useState(false);
  const [visibleMATIC, setVisibleMATIC] = useState(false);
  const [visibleBNB, setVisibleBNB] = useState(false);

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

  let optionsBTC = [
    { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "C" },
    { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "P" },
    { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "C" },
    { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "P" },
    // { name: "BTC-300000", tokenSymbol: "BTC", optionSymbol: "300000", type: "C" },
    // { name: "BTC-300000", tokenSymbol: "BTC", optionSymbol: "300000", type: "P" },
    { name: "BTC 60000", tokenSymbol: "BTC", optionSymbol: "60000", type: "C" },
    { name: "BTC 60000", tokenSymbol: "BTC", optionSymbol: "60000", type: "P" },
    { name: "BTC 10000", tokenSymbol: "BTC", optionSymbol: "10000", type: "C" },
    { name: "BTC 10000", tokenSymbol: "BTC", optionSymbol: "10000", type: "P" },
  ];
  let optionsETH = [
    { name: "ETH-10000", tokenSymbol: "ETH", optionSymbol: "10000", type: "C" },
    { name: "ETH-10000", tokenSymbol: "ETH", optionSymbol: "10000", type: "P" },
    { name: "ETH-5000", tokenSymbol: "ETH", optionSymbol: "5000", type: "C" },
    { name: "ETH-5000", tokenSymbol: "ETH", optionSymbol: "5000", type: "P" },
    { name: "ETH-1000", tokenSymbol: "ETH", optionSymbol: "1000", type: "C" },
    { name: "ETH-1000", tokenSymbol: "ETH", optionSymbol: "1000", type: "P" },
  ];
  let optionsMATIC = [
    { name: "MATIC-10", tokenSymbol: "MATIC", optionSymbol: "10", type: "C" },
    { name: "MATIC-10", tokenSymbol: "MATIC", optionSymbol: "10", type: "P" },
    { name: "MATIC-1", tokenSymbol: "MATIC", optionSymbol: "1", type: "C" },
    { name: "MATIC-1", tokenSymbol: "MATIC", optionSymbol: "1", type: "P" },
    { name: "MATIC-0.01", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "C" },
    { name: "MATIC-0.01", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "P" },
  ];
  let optionsBNB = [
    { name: "BNB-1000", tokenSymbol: "BNB", optionSymbol: "1000", type: "C" },
    { name: "BNB-1000", tokenSymbol: "BNB", optionSymbol: "1000", type: "P" },
    { name: "BNB-300", tokenSymbol: "BNB", optionSymbol: "300", type: "C" },
    { name: "BNB-300", tokenSymbol: "BNB", optionSymbol: "300", type: "P" },
    { name: "BNB-100", tokenSymbol: "BNB", optionSymbol: "100", type: "C" },
    { name: "BNB-100", tokenSymbol: "BNB", optionSymbol: "100", type: "P" },
  ];

  const KChartTokenListMATIC = ["BTC", "ETH", "MATIC"]
  const KChartTokenListETH = ["BTC", "ETH"]
  const KChartTokenListBNB = ["BTC", "ETH", "BNB"]
  const KChartTokenList = chainId === 56 || chainId === 97 ? KChartTokenListBNB
    : chainId === 137 || chainId === 80001 ? KChartTokenListMATIC
      : KChartTokenListETH
  const selectTab = item => {
    setActiveToken((tokens.filter(ele => ele.symbol == item))[0])
    switch (item) {
      case "BTC":
        setVisibleBTC(true);
        setVisibleETH(false);
        setVisibleMATIC(false);
        setVisibleBNB(false);
        break;
      case "ETH":
        setVisibleBTC(false);
        setVisibleETH(true);
        setVisibleMATIC(false);
        setVisibleBNB(false);
        break;
      case "MATIC":
        setVisibleBTC(false);
        setVisibleETH(false);
        setVisibleMATIC(true);
        setVisibleBNB(false);
        break;
      case "BNB":
        setVisibleBTC(false);
        setVisibleETH(false);
        setVisibleMATIC(false);
        setVisibleBNB(true);
        break;
      default:
        break;
    }
  }

  const onCloseBTC = () => {
    setVisibleBTC(false);
  };
  const onCloseETH = () => {
    setVisibleETH(false);
  };
  const onCloseBNB = () => {
    setVisibleBNB(false);
  };
  const onCloseMATIC = () => {
    setVisibleMATIC(false);
  };

  const onTrade = async (symbol, amount, priceLimit) => {

  }

  
  ///// read reader contract, getTdInfo and getSymbolsInfo
  const poolAddress = getContract(chainId,"Pool")
  const readerAddress = getContract(chainId,"Reader")

  const { data:rawPositionData,mutate:updatePosition} = useSWR([chainId, readerAddress, 'getTdInfo',poolAddress,account], {
      fetcher: fetcher(library, Reader)
  })
  const { data:rawSymbolData,mutate:updateSymbol} = useSWR([chainId, readerAddress, 'getSymbolsInfo',poolAddress,[]], {
    fetcher: fetcher(library, Reader)
  })
  console.log("POSITION",rawPositionData)
  console.log("SYMBOL",rawSymbolData)

  const symbolData = getSymbol(rawSymbolData)
  const positionData = getPosition(rawPositionData,symbolData)

  console.log("POSITIONDATA",positionData)
  console.log("SYMBOLDATA",symbolData)

  useEffect(() => {
    if (active) {
      function onBlock() {
        updatePosition()
        updateSymbol()
      }
      library.on('block', onBlock)
      return () => {
        library.removeListener('block', onBlock)
      }
    }
  }, [account,active, library, chainId,
    updatePosition,updateSymbol]
  )

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
                    <PerpetualTabs
                      option={activeToken.symbol}
                      options={KChartTokenList}
                      onChange={selectTab}
                    />
                  </Row>

                  {visibleBTC ?
                    <Row>
                      <Col>
                        <div className={styles.tokenSelector} >
                          <StyledDrawer
                            className={styles.drawerContent}
                            placement="bottom"
                            onClose={onCloseBTC}
                            visible={visibleBTC}
                            getContainer={false}
                            closeIcon={false}
                            height={"517px"}
                            style={{ width: "20rem" }}
                          >
                            <div className={styles.optionslist}>
                              {optionsBTC.map((option) => (
                                <div
                                  className={styles.item}
                                  onClick={() => {
                                    onClickDropdownBTC(option)
                                    setSymbol(option.tokenSymbol + 'USD-' + option.optionSymbol + '-' + option.type)
                                    onCloseBTC()
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
                        </div>
                      </Col>
                    </Row> : null}

                  {visibleETH ?
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
                    </Row> : null}
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
                  <PerpetualTabs
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
                      <PositionTable dataSource={positionData} chainId={chainId}/>
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
              selectedToken={activeToken}
              symbol={symbol}
              onTrade={onTrade}
            />
          </AcyCard>
        </div>
      </div >
    </div >
  );
}

export default Option
