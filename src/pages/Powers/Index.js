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
import IPool from '@/abis/future-option-power/IPool.json'
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/powers.js';

import styles from './styles.less'
import styled from "styled-components";

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

const Powers = props => {
  const { account, library } = useConstantLoader();
  const { chainId } = useChainId();
  const tokens = getTokens(chainId);

  const [mode, setMode] = useState('Buy')
  const [symbol, setSymbol] = useState('BTCUSD')

  const [activeToken, setActiveToken] = useState((tokens.filter(ele => ele.symbol == "BTC"))[0]);

  const [visibleBTC, setVisibleBTC] = useState(false);
  const [visibleETH, setVisibleETH] = useState(false);
  const [visibleMATIC, setVisibleMATIC] = useState(false);
  const [visibleBNB, setVisibleBNB] = useState(false);

  useEffect(()=>{
    setActiveToken((tokens.filter(ele => ele.symbol == "BTC"))[0])
  }, [tokens])

  const onClickDropdownBTC = e => {
    setActiveToken(tokens.filter(token => token.symbol == "BTC")[0]);
  };
  const onClickDropdownETH = e => {
    setActiveToken(tokens.filter(token => token.symbol == "ETH")[0]);
  };
  const onClickDropdownMATIC = e => {
    setActiveToken(tokens.filter(token => token.symbol == "MATIC")[0]);
  };
  const onClickDropdownBNB = e => {
    setActiveToken(tokens.filter(token => token.symbol == "BNB")[0]);
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
    { name: "MATIC-10000", tokenSymbol: "MATIC", optionSymbol: "10", type: "C" },
    { name: "MATIC-10000", tokenSymbol: "MATIC", optionSymbol: "10", type: "P" },
    { name: "MATIC-5000", tokenSymbol: "MATIC", optionSymbol: "1", type: "C" },
    { name: "MATIC-5000", tokenSymbol: "MATIC", optionSymbol: "1", type: "P" },
    { name: "MATIC-1000", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "C" },
    { name: "MATIC-1000", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "P" },
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
    setActiveToken((tokens.filter(ele => ele.symbol == item)[0]))
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
    const poolAddress = getContract(chainId, "pool")
    const contract = new ethers.Contract(poolAddress, IPool.abi, library.getSigner())
    let method = "trade"
    let params = [
      account,
      symbol,
      amount,
      priceLimit,
      [], //oracleSignature
    ]

    let value = bigNumberify(0)
    const successMsg = `Order Submitted!`
    Api.callContract(chainId, contract, method, params, {
      value,
      sentMsg: `Submitted.`,
      failMsg: `Failed.`,
      successMsg,
    })
      .then(() => { })
      .catch(e => { console.log(e) })
  }

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
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
                          // onClose={onClose("BTC")}
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
                        // onClose={onClose("ETH")}
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
                chartTokenSymbol="BTC"
                pageName="Powers"
                fromToken={activeToken.symbol}
                toToken="USDT"
              />
            </div>
          </div>
        }


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
      </div>
    </div>
  );
}

export default Powers
