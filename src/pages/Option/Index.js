import { useWeb3React } from '@web3-react/core';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { DownOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Space, Row, Col } from 'antd';
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

const Option = props => {
  const { account, library, chainId, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();

  const { AddressZero } = ethers.constants

  const [mode, setMode] = useState('Buy')
  const [volume, setVolume] = useState(0)
  const [percentage, setPercentage] = useState('')
  const [tableContent, setTableContent] = useState("Positions");

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

  const defaultTokenSelection = useMemo(() => ({
    ["Pool"]: {
      from: AddressZero,
      to: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
    },
    ["Long"]: {
      from: AddressZero,
      to: AddressZero,
    },
    ["Short"]: {
      from: getTokenBySymbol(tokens, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL).address,
      to: AddressZero,
    }
  }), [chainId, ARBITRUM_DEFAULT_COLLATERAL_SYMBOL])


  const tokenAddresses = tokens.map(token => token.address)
  const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(chainId, "Exchange-token-selection-v2", defaultTokenSelection)


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
  useEffect(() => {
    setToTokenAddress(getActiveTokenAddr(activeToken1.symbol))
  }, [activeToken1])

  let optionsBTC = [
    { name: "BTC 1000000", tokenSymbol: "BTC", optionSymbol: "1000000" },
    { name: "BTC 500000", tokenSymbol: "BTC", optionSymbol: "500000" },
    { name: "BTC 10000", tokenSymbol: "BTC", optionSymbol: "10000" },
  ];
  let optionsETH = [
    { name: "ETH 10000", tokenSymbol: "ETH", optionSymbol: "10000" },
    { name: "ETH 5000", tokenSymbol: "ETH", optionSymbol: "5000" },
    { name: "ETH 1000", tokenSymbol: "ETH", optionSymbol: "1000" },
  ];

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        <div className={`${styles.colItem} ${styles.priceChart}`}>
          <div>
            <div className={styles.chartTokenSelectorTab}>
              <Row>
                <Col span={12} >
                  <Dropdown overlay={
                    <Menu onClick={onClickDropdownBTC} style={{ backgroundColor: 'black' }}>
                      {
                        optionsBTC.map((option, index) => (
                          <Menu.Item key={index} >
                            <span >{option.name} </span>
                          </Menu.Item>
                        ))
                      }
                    </Menu>
                  } trigger={['click']}>
                    <a >
                      <div>
                        BTC <DownOutlined />
                      </div>
                    </a>
                  </Dropdown>
                </Col>

                <Col span={12}>
                  <Dropdown overlay={
                    <Menu onClick={onClickDropdownETH} style={{ backgroundColor: 'black' }}>
                      {
                        optionsETH.map((option, index) => (
                          <Menu.Item key={index}>
                            <span>{option.name} </span>
                          </Menu.Item>
                        ))
                      }
                    </Menu>
                  } trigger={['click']}>
                    <a >
                      <div>
                        ETH <DownOutlined />
                      </div>
                    </a>
                  </Dropdown>
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
              />
            </div>
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
            />
          </AcyCard>
        </div>
      </div>

    </div>
  );
}

export default Option
