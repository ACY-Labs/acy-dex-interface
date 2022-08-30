import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Space, Row, Col, Button, Select, Drawer } from 'antd';
import AcyCard from '@/components/AcyCard';
import OptionComponent from '@/components/OptionComponent'
import PerpetualTabs from '@/components/PerpetualComponent/components/PerpetualTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';

import { fetcher, getInfoTokens, expandDecimals, useLocalStorageByChainId } from '@/acy-dex-futures/utils';
// import { API_URL, useConstantLoader, getGlobalTokenList, constantInstance } from '@/constants';
import { useConstantLoader, constantInstance } from '@/constants';
import { ethers } from 'ethers'
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'

import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/option.js';


import styled from "styled-components";
import styles from './styles.less'
// import { symbol } from 'prop-types';


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
  const { account, library, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();
  let { chainId: chainId2 } = useChainId();
  let chainId = chainId2;
  console.log("hjhjhj multchain option usechainId undefined", chainId)
  if (chainId == undefined || chainId == 56) {
    chainId = 80001;
    console.log("hjhjhj multchain option usechainId undefined", chainId)
  }
  console.log("hjhjhj multchain option chainId", chainId)
  const tokensOption = getTokens(chainId);
  let tokens = getTokens(chainId);
  console.log("hjhjhj multchain option tokens", tokens)


  const { AddressZero } = ethers.constants

  const [mode, setMode] = useState('Buy')
  const [volume, setVolume] = useState(0)
  const [percentage, setPercentage] = useState('')
  const [tableContent, setTableContent] = useState("Positions");

  const chainTokenList = getSupportedInfoTokens(tokens)
  const [activeToken1, setActiveToken1] = useState((tokens.filter(ele => ele.symbol == "BTC"))[0]);
  // const [activeToken1, setActiveToken1] = useState(chainTokenList[2]);

  // (chainTokenList.filter(ele => ele.symbol == newActiveKey))[0]
  const [activeToken0, setActiveToken0] = useState(chainTokenList[1]);

  console.log("hjhjhj multchain option activeToken0", tokens, chainTokenList, activeToken0)
  const [fromTokenAddress, setFromTokenAddress] = useState(activeToken0.address);
  const [toTokenAddress, setToTokenAddress] = useState("");
  const [tokenData, setTokenData] = useState("BTC")

  const [visibleBTC, setVisibleBTC] = useState(false);
  const [visibleETH, setVisibleETH] = useState(false);
  const [visibleMATIC, setVisibleMATIC] = useState(false);
  const [visibleBNB, setVisibleBNB] = useState(false);

  const { perpetuals } = useConstantLoader()
  const readerAddress = getContract(chainId, "Reader")
  const vaultAddress = getContract(chainId, "Vault")
  const nativeTokenAddress = getContract(chainId, "NATIVE_TOKEN")

  const whitelistedTokens = tokens.filter(token => token.symbol !== "USDG");
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address);

  const tokenAddresses = tokens.map(token => token.address)

  const { data: tokenBalances, mutate: updateTokenBalances } = useSWR([chainId, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  })
  const { data: vaultTokenInfo, mutate: updateVaultTokenInfo } = useSWR([chainId, readerAddress, "getFullVaultTokenInfo"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, expandDecimals(1, 18), whitelistedTokenAddresses]),
  })
  const { data: fundingRateInfo, mutate: updateFundingRateInfo } = useSWR(account && [chainId, readerAddress, "getFundingRates"], {
    fetcher: fetcher(library, Reader, [vaultAddress, nativeTokenAddress, whitelistedTokenAddresses]),
  })

  const infoTokens = getInfoTokens(tokens, tokenBalances, whitelistedTokens, vaultTokenInfo, fundingRateInfo);

  const passTokenData = (token) => {
    setTokenData(token);
  };

  function getSupportedInfoTokens(tokenlist) {
    let supportedList = []
    for (let i = 0; i < tokenlist.length; i++) {
      tokenlist[i].address = tokenlist[i].address.toLowerCase()
      if (tokenlist[i].symbol == 'BTC' || tokenlist[i].symbol == "ETH" || tokenlist[i].symbol == "USDT" || tokenlist[i].symbol == "MATIC" || tokenlist[i].symbol == "BNB") {
        supportedList.push(tokenlist[i])
      }
    }
    return supportedList
  }


  function getTokenBySymbol(tokenlist, symbol) {
    for (let i = 0; i < tokenlist.length; i++) {
      tokenlist[i].address = tokenlist[i].address.toLowerCase()
      if (tokenlist[i].symbol === symbol) {
        return tokenlist[i]
      }
    }
    return undefined
  }
  const chartPanes = [
    { title: 'BTC', content: 'BTC', key: 'BTC', closable: false },
    { title: 'ETH', content: 'ETH', key: 'ETH' },
    // { title: 'Tab 3', content: 'Content of Tab 3', key: '3'},
  ];
  const [activeKey, setActiveKey] = useState(chartPanes[0].key);
  const [panes, setPanes] = useState(chartPanes);
  const newTabIndex = useRef(0);

  const onChange = (newActiveKey) => {
    // setActiveKey(newActiveKey);
    console.log("hjhjhj multchain option newActiveKey", newActiveKey)
    setActiveToken1((chainTokenList.filter(ele => ele.symbol == newActiveKey))[0])
  };

  const getActiveTokenAddr = (symbol) => {
    let tmp = getTokenBySymbol(chainTokenList, symbol);
    return tmp.address
  }
  const onClickDropdownBTC = e => {
    let tmp = optionsBTC[e.name]
    // setActiveToken1(chainTokenList[2]);
    setActiveToken1((chainTokenList.filter(ele => ele.symbol == "BTC"))[0]);
    // (chainTokenList.filter(ele => ele.symbol == newActiveKey))[0]
  };
  const onClickDropdownETH = e => {
    let tmp = optionsETH[e.name]
    // setActiveToken1(chainTokenList[3]);
    setActiveToken1((chainTokenList.filter(ele => ele.symbol == "ETH"))[0]);
  };
  const onClickDropdownMATIC = e => {
    let tmp = optionsMATIC[e.name]
    setActiveToken1((chainTokenList.filter(ele => ele.symbol == "MATIC"))[0]);
    // setActiveToken1(chainTokenList[0]);
  };
  const onClickDropdownBNB = e => {
    let tmp = optionsBNB[e.name]
    setActiveToken1(chainTokenList[3]);
  };

  useEffect(() => {
    setToTokenAddress(getActiveTokenAddr(activeToken1.symbol))
  }, [activeToken1])

  let optionsBTC = [
    { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "C" },
    { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "P" },
    { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "C" },
    { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "P" },
    // { name: "BTC-300000", tokenSymbol: "BTC", optionSymbol: "300000", type: "C" },
    // { name: "BTC-300000", tokenSymbol: "BTC", optionSymbol: "300000", type: "P" },
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
    setActiveToken1((chainTokenList.filter(ele => ele.symbol == item))[0])
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
  const selectChartToken = item => {
    // console.log("hjhjhj select char token", item)
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


  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        {mode == 'Pool'
          ?
          <AcyPool />
          :
          <div className={`${styles.colItem} ${styles.priceChart}`}>
            <div>
              <div className={styles.chartTokenSelectorTab}>
                <Row>
                  <PerpetualTabs
                    option={activeToken1.symbol}
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
                                onClick={() => onClickDropdownBTC(option)}
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
                              onClick={() => onClickDropdownETH(option)}
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
                              onClick={() => onClickDropdownMATIC(option)}
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
                              onClick={() => onClickDropdownBNB(option)}
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

              {/* </div> */}
            </div>
            <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
              {/* <div style={{ borderTop: '0.75px solid #333333' }}> */}
              <ExchangeTVChart
                chartTokenSymbol="BTC"
                pageName="Option"
                fromToken={activeToken1.symbol}
                toToken="USDT"
                passTokenData={passTokenData}
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

        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <OptionComponent
              mode={mode}
              setMode={setMode}
              volume={volume}
              setVolume={setVolume}
              percentage={percentage}
              setPercentage={setPercentage}
            />
          </AcyCard>
        </div>
      </div >
    </div >
  );
}

export default Option
