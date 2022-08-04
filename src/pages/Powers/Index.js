import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { DownOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Space, Row, Col, Button, Select } from 'antd';
import AcyCard from '@/components/AcyCard';
import OptionComponent from '@/components/OptionComponent'
import PerpetualTabs from '@/components/PerpetualComponent/components/PerpetualTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import { fetcher, getInfoTokens, expandDecimals, useLocalStorageByChainId } from '@/acy-dex-futures/utils';
// import { API_URL, useConstantLoader, getGlobalTokenList, constantInstance } from '@/constants';
import { useConstantLoader, constantInstance } from '@/constants';
import { ARBITRUM_DEFAULT_COLLATERAL_SYMBOL } from '@/acy-dex-futures/utils';
import { ethers } from 'ethers'
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'

// import styled from "styled-components";
import styles from './styles.less'

const Powers = props => {
  const { account, library, chainId, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();

  const { AddressZero } = ethers.constants

  const [mode, setMode] = useState('Buy')
  const [volume, setVolume] = useState(0)
  const [percentage, setPercentage] = useState('')

  const chainTokenList = getSupportedInfoTokens(supportedTokens)

  const [activeToken1, setActiveToken1] = useState(chainTokenList[1]);
  const [activeToken0, setActiveToken0] = useState(chainTokenList[0]);

  const [fromTokenAddress, setFromTokenAddress] = useState(activeToken0.address);
  const [toTokenAddress, setToTokenAddress] = useState("");

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
      if (tokenlist[i].symbol == 'BTC' || tokenlist[i].symbol == "ETH" || tokenlist[i].symbol == "USDT") {
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

  const getActiveTokenAddr = (symbol) => {
    let tmp = getTokenBySymbol(chainTokenList, symbol);
    return tmp.address
  }
  const onClickDropdownBTC = e => {
    let tmp = optionsBTC[e.key]
    setActiveToken1(chainTokenList[1]);
  };
  const onClickDropdownETH = e => {
    let tmp = optionsETH[e.key]
    setActiveToken1(chainTokenList[2]);
  };
  const onClickDropdownMATIC = e => {
    let tmp = optionsMATIC[e.key]
    setActiveToken1(chainTokenList[3]);
  };
  const handleArrowBTC = () => {
    setExpandBTC(!expandBTC)
  }
  const handleArrowETH = () => {
    setExpandETH(!expandETH)
  }
  const handleArrowMATIC = () => {
    setExpandMATIC(!expandMATIC)
  }
  useEffect(() => {
    setToTokenAddress(getActiveTokenAddr(activeToken1.symbol))
  }, [activeToken1])

  let optionsBTC = [
    { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "C" },
    { name: "BTC-1000000", tokenSymbol: "BTC", optionSymbol: "1000000", type: "P" },
    { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "C" },
    { name: "BTC-500000", tokenSymbol: "BTC", optionSymbol: "500000", type: "P" },
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
  const selectChartToken = item => {
    console.log("hjhjhj select char token", item)
  }
  console.log("hjhjhj option token chainid", chainId)

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        <div className={`${styles.colItem} ${styles.priceChart}`}>
          <div>
            <div className={styles.chartTokenSelectorTab}>
              <Row>
                <Col span={8}  >
                  <div className={styles.tokenSelector} >

                    <Select
                      value={"BTC"}
                      onChange={onClickDropdownBTC}
                      dropdownClassName={styles.dropDownMenu}
                      dropdownMenuStyle={{ width: "20rem" }}
                      dropdownMatchSelectWidth={false}
                    >
                      {
                        optionsBTC.map((option) => (
                          <Option className={styles.optionItem} value={option.name} style={{ width: "20rem" }}>
                            <Col span={12}>{option.tokenSymbol}-{option.optionSymbol}-{option.type}</Col>
                            {option.type == "C" ?
                              <Col span={6} offset={5} style={{ fontSize: "0.9rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                              // <div style={{ fontSize: "0.9rem", float: "right", color: "#FA3C58" }}> $200 -3.4%</div>
                              :
                              <Col span={6} offset={5} style={{ fontSize: "0.9rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                              // <div style={{ fontSize: "0.9rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</div>
                            }
                          </Option>
                        ))
                      }
                    </Select>
                  </div>
                </Col>

                <Col span={8}>
                  <div className={styles.tokenSelector} >

                    <Select
                      value={"ETH"}
                      onChange={onClickDropdownETH}
                      dropdownClassName={styles.dropDownMenu}
                      dropdownMenuStyle={{ width: "20rem" }}
                      dropdownMatchSelectWidth={false}
                      dropdownAlign={{ offset: [-160, 4] }}
                    >
                      {
                        optionsETH.map((option, index) => (
                          <Option className={styles.optionItem} value={option.name} style={{ width: "20rem" }}>
                            <Col span={12}>{option.tokenSymbol}-{option.optionSymbol}-{option.type}</Col>
                            {option.type == "C" ?
                              <Col span={6} offset={5} style={{ fontSize: "0.9rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                              :
                              <Col span={6} offset={5} style={{ fontSize: "0.9rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                            }
                          </Option>
                        ))
                      }
                    </Select>
                  </div>
                </Col>
                <Col span={8}>
                  <div className={styles.tokenSelector} >
                    {chainId === 137 || chainId === 80001 ?
                      <Select
                        value={"MATIC"}
                        onChange={onClickDropdownETH}
                        dropdownClassName={styles.dropDownMenu}
                        dropdownMenuStyle={{ width: "20rem" }}
                        dropdownMatchSelectWidth={false}
                        dropdownAlign={{ offset: [-160, 4] }}
                      >
                        {
                          optionsMATIC.map((option, index) => (
                            <Option className={styles.optionItem} value={option.name} style={{ width: "20rem" }}>
                              <Col span={12}>{option.tokenSymbol}-{option.optionSymbol}-{option.type}</Col>
                              {option.type == "C" ?
                                <Col span={6} offset={5} style={{ fontSize: "0.9rem", float: "right", color: "#FA3C58" }}>$200 -3.4%</Col>
                                :
                                <Col span={6} offset={5} style={{ fontSize: "0.9rem", float: "right", color: "#46E3AE" }}>$200 +3.4%</Col>
                              }
                            </Option>
                          ))
                        }
                      </Select>
                      :
                      chainId === 56 || chainId === 97
                        ?
                        <Select
                          value={"BSC"}
                          onChange={onClickDropdownETH}
                          dropdownClassName={styles.dropDownMenu}
                          dropdownMenuStyle={{ width: "20rem" }}
                          dropdownMatchSelectWidth={false}
                          dropdownAlign={{ offset: [-160, 4] }}
                        >
                          {
                            optionsETH.map((option, index) => (
                              <Option className={styles.optionItem} value={option.name} >
                                {option.name}
                              </Option>
                            ))
                          }
                        </Select>
                        :
                        <div></div>
                    }
                  </div>
                </Col>

              </Row>

              {/* <PerpetualTabs
                option={kChartTab}
                options={kChartTabs}
                onChange={selectChart}
              /> */}
            </div>
            <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
              {/* <div style={{ borderTop: '0.75px solid #333333' }}> */}
              <ExchangeTVChart
                chartTokenSymbol="BTC"
                passTokenData={passTokenData}
              />
            </div>
          </div>        
        </div>

        <div className={`${styles.colItem} ${styles.optionComponent}`}>
          <AcyCard style={{ backgroundColor: 'transparent', border: 'none' }}>
            <OptionComponent
              mode={mode}
              setMode={setMode}
              volume={volume}
              setVolume={setVolume}
              percentage={percentage}
              setPercentage={setPercentage}
              powers={true}
            />
          </AcyCard>
        </div>
      </div>
    </div>
  );
}

export default Powers
