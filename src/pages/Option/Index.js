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
import { ARBITRUM_DEFAULT_COLLATERAL_SYMBOL } from '@/acy-dex-futures/utils';
import { ethers } from 'ethers'
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'

import styled from "styled-components";
import styles from './styles.less'
import { symbol } from 'prop-types';


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
`

const Option = props => {
  const { account, library, chainId, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();

  const { AddressZero } = ethers.constants

  const [mode, setMode] = useState('Buy')
  const [volume, setVolume] = useState(0)
  const [percentage, setPercentage] = useState('')
  const [tableContent, setTableContent] = useState("Positions");

  const chainTokenList = getSupportedInfoTokens(supportedTokens)
  const [activeToken1, setActiveToken1] = useState(chainTokenList[2]);
  const [activeToken0, setActiveToken0] = useState(chainTokenList[1]);

  const [fromTokenAddress, setFromTokenAddress] = useState(activeToken0.address);
  const [toTokenAddress, setToTokenAddress] = useState("");
  const [tokenData, setTokenData] = useState("BTC")

  const [visibleBTC, setVisibleBTC] = useState(false);
  const [visibleETH, setVisibleETH] = useState(false);
  const [visibleMATIC, setVisibleMATIC] = useState(false);
  const [visibleBNB, setVisibleBNB] = useState(false);

  const { perpetuals } = useConstantLoader()
  const readerAddress = perpetuals.getContract("Reader")
  const vaultAddress = perpetuals.getContract("Vault")
  const nativeTokenAddress = perpetuals.getContract("NATIVE_TOKEN")

  const tokens = constantInstance.perpetuals.tokenList;
  const whitelistedTokens = tokens.filter(token => token.symbol !== "USDG");
  const whitelistedTokenAddresses = whitelistedTokens.map(token => token.address);

  // const defaultTokenSelection = useMemo(() => ({
  //   ["Pool"]: {
  //     from: AddressZero,
  //     to: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
  //   },
  //   ["Long"]: {
  //     from: AddressZero,
  //     to: AddressZero,
  //   },
  //   ["Short"]: {
  //     from: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
  //     to: AddressZero,
  //   }
  // }), [chainId, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL])


  const tokenAddresses = tokens.map(token => token.address)
  // const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(chainId, "Exchange-token-selection-v2", defaultTokenSelection)


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
      if (tokenlist[i].symbol == 'BTC' || tokenlist[i].symbol == "ETH" || tokenlist[i].symbol == "USDT" || tokenlist[i].symbol == "MATIC") {
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
    setActiveToken1((chainTokenList.filter(ele => ele.symbol == newActiveKey))[0])
  };

  const getActiveTokenAddr = (symbol) => {
    let tmp = getTokenBySymbol(chainTokenList, symbol);
    return tmp.address
  }
  const onClickDropdownBTC = e => {
    let tmp = optionsBTC[e.name]
    setActiveToken1(chainTokenList[2]);
  };
  const onClickDropdownETH = e => {
    let tmp = optionsETH[e.name]
    setActiveToken1(chainTokenList[3]);
  };
  const onClickDropdownMATIC = e => {
    let tmp = optionsMATIC[e.name]
    setActiveToken1(chainTokenList[0]);
  };
  // const onClickDropdownBSC = e => {
  //   let tmp = optionsBSC[e.name]
  //   setActiveToken1(chainTokenList[3]);
  // };

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
    { name: "MATIC-10000", tokenSymbol: "MATIC", optionSymbol: "10", type: "C" },
    { name: "MATIC-10000", tokenSymbol: "MATIC", optionSymbol: "10", type: "P" },
    { name: "MATIC-5000", tokenSymbol: "MATIC", optionSymbol: "1", type: "C" },
    { name: "MATIC-5000", tokenSymbol: "MATIC", optionSymbol: "1", type: "P" },
    { name: "MATIC-1000", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "C" },
    { name: "MATIC-1000", tokenSymbol: "MATIC", optionSymbol: "0.01", type: "P" },
  ];

  const KChartTokenListMATIC = ["BTC", "ETH", "MATIC"]
  const KChartTokenListETH = ["BTC", "ETH"]
  const KChartTokenListBSC = ["BTC", "ETH", "BNB"]
  const KChartTokenList = chainId === 56 || chainId === 97 ? KChartTokenListBSC
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
      default:
        break;
    }
  }
  const selectChartToken = item => {
    console.log("hjhjhj select char token", item)
  }

  const onCloseBTC = () => {
    console.log("hjhjhj close btc")
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
                          closable={false}
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
              </div>

              {/* </div> */}
            </div>
            <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
              {/* <div style={{ borderTop: '0.75px solid #333333' }}> */}
              <ExchangeTVChart
                chartTokenSymbol="BTC"
                fromToken={activeToken0.symbol}
                toToken={activeToken1.symbol}
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
