import { useWeb3React } from '@web3-react/core';
import { supportedTokens } from '@/acy-dex-usda/utils/address';
// import { useConstantLoader } from '@/constants';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './styles.less';
import { connect } from 'umi';
import Media from 'react-media';
import { Banner } from './components/banner';
import { ExchangeTable } from './components/exchangeTable';
import { AcyCard } from '@/components/Acy';
import SwapComponent from './components/stableCoinComponent';
import { APYtable } from './components/apytable';
import { AccountBox } from './components/accountBox';
import { useState, useEffect, useMemo, useCallback } from 'react';
import PerpetualTabs from '@/components/PerpetualComponent/components/PerpetualTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import { ethers } from 'ethers'
import Reader from '@/acy-dex-futures/abis/ReaderV2.json'
import { useConstantLoader, constantInstance } from '@/constants';
import { ARBITRUM_DEFAULT_COLLATERAL_SYMBOL } from '@/acy-dex-futures/utils';
import { fetcher, getInfoTokens, expandDecimals, useLocalStorageByChainId } from '@/acy-dex-futures/utils';
import useSWR from 'swr';


const StableCoin = props => {
  const { account, library, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader(props);
  // const { account, library, chainId, tokenList: supportedTokens, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();
  const { AddressZero } = ethers.constants


  // TODO: TESTING
  const chainId = 137;
  const { dispatch } = props
  const tokenlist = supportedTokens[chainId]
  const [activeToken0, setActiveToken0] = useState(tokenlist[0]);
  const [activeToken1, setActiveToken1] = useState(tokenlist[2]);;
  const [tokenData, setTokenData] = useState("BTC")


  const onGetReceipt = async (receipt, library, account) => {
    // updateTransactionList(receipt);
  };

  useEffect(() => {
    if (!tokenlist) return

    console.log("resetting page states")
    // reset on chainId change => supportedTokens change
    setActiveToken1(tokenlist[0]);
    setActiveToken0(tokenlist[2]);
  }, [chainId])

  useEffect(() => {
    dispatch({
      type: "swap/updateTokens",
      payload: {
        token0: activeToken0,
        token1: activeToken1
      }
    })
  }, [activeToken0, activeToken1]);

  const [graphType, setGraphType] = useState("StableCoin")
  const graphTypes = ["StableCoin", "Candlestick"]
  const showGraph = item => {
    setGraphType(item)
  }

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

  const passTokenData = (token) => {
    setTokenData(token);
  };

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
  console.log("hereim swap infotokens", infoTokens)

  const setToTokenAddress = useCallback((selectedSwapOption, address) => {
    const newTokenSelection = JSON.parse(JSON.stringify(tokenSelection))
    newTokenSelection[selectedSwapOption].to = address
    setTokenSelection(newTokenSelection)
  }, [tokenSelection, setTokenSelection])

  function getTokenBySymbol(tokenlist, symbol) {
    for (let i = 0; i < tokenlist.length; i++) {
      if (tokenlist[i].symbol === symbol) {
        return tokenlist[i]
      }
    }
    return undefined
  }
  const [kChartTab, setKChartTab] = useState("USDA/USDT")
  const kChartTabs = ["USDA/USDT", "USDA/USDC"]
  const selectChart = item => {
    setKChartTab(item)
    onClickSetActiveToken(item)
  }
  const onClickSetActiveToken = (e) => {
    console.log("hereim see click token", e)
    setActiveToken1((supportedTokens.filter(ele => ele.symbol == e))[0]);
  }

  return (
    <PageHeaderWrapper>
      {/* <Banner /> */}

      <div className={styles.main}>
        <div className={styles.rowFlexContainer}>
          <div className={`${styles.colItem} ${styles.priceChart}`}>
            <div>

              <div className={styles.chartTokenSelectorTab}>
                <PerpetualTabs
                  option={kChartTab}
                  options={kChartTabs}
                  onChange={selectChart}
                />
              </div>
              <div style={{ backgroundColor: 'black', height: "450px", display: "flex", flexDirection: "column", marginBottom: "30px" }}>
                {/* <div style={{ borderTop: '0.75px solid #333333' }}> */}
                <ExchangeTVChart
                  chartTokenSymbol="USDC"
                  passTokenData={passTokenData}
                />
              </div>
            </div>
            <div className={styles.bottomWrapper}>
              <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', width: '100%', borderTop: '0.75px solid #333333', borderRadius: '0' }}>
                <AccountBox />
                <ExchangeTable />
              </AcyCard>
            </div>
          </div>

          <div className={`${styles.colItem} ${styles.swapComponent}`}>
            <AcyCard style={{ backgroundColor: 'transparent', padding: '10px', border: 'none' }}>
              <div className={styles.trade}>
                <SwapComponent
                  onSelectToken0={token => {
                    setActiveToken0(token);
                  }}
                  onSelectToken1={token => {
                    setActiveToken1(token);
                  }}
                  onGetReceipt={onGetReceipt} />
              </div>
            </AcyCard>
          </div>
        </div>

      </div>

    </PageHeaderWrapper>
  );
};

export default connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetchBasic'],
}))(StableCoin);
