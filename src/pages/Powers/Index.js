import React, { useState, useEffect } from 'react';
import { Row, Col, Drawer } from 'antd';
import AcyCard from '@/components/AcyCard';
import OptionComponent from '@/components/OptionComponent'
import ComponentTabs from '@/components/ComponentTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';
import * as Api from '@/acy-dex-futures/Api';
import { bigNumberify } from '@/acy-dex-futures/utils';
import { useConstantLoader } from '@/constants';
import { ethers } from 'ethers'
import IPool from '@/abis/future-option-power/IPool.json'
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/powers.js';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import TokenSelectorDrawer from '@/components/TokenSelectorDrawer';
import { getGlobalTokenList } from '@/constants';
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

  let coinList = getGlobalTokenList()
  coinList = coinList.filter(token => token.symbol == "USDT" || token.symbol == 'USDC' || token.symbol == 'BTC' || token.symbol == 'ETH')

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

  useEffect(() => {
    setActiveToken((tokens.filter(ele => ele.symbol == "BTC"))[0])
  }, [tokens])

  const [latestPrice, setLatestPrice] = useState(0);
  const [priceChangePercentDelta, setPpriceChangePercentDelta] = useState(0);
  const onChangePrice = (curPrice, change) => {
    setLatestPrice(curPrice);
    setPpriceChangePercentDelta(change);
  }

  return (
    <div className={styles.main}>
      <div className={styles.rowFlexContainer}>
        {mode == 'Pool' ?
          <AcyPool />
          : <div className={`${styles.colItem} ${styles.priceChart}`}>

            <AcySymbolNav data={KChartTokenList} onChange={selectTab} />
            <AcySymbol
              activeSymbol="BTC-XXX"
              pairName={activeToken.symbol}
              // showDrawer={onClickCoin}
              // latestPriceColor={priceChangePercentDelta * 1 >= 0 && '#0ecc83' || '#fa3c58'}
              // latestPrice={latestPrice}
              // latestPricePercentage={priceChangePercentDelt
              coinList={coinList}
              latestPriceColor={priceChangePercentDelta * 1 >= 0 && '#0ecc83' || '#fa3c58'}
              latestPrice={latestPrice}
              latestPricePercentage={priceChangePercentDelta}
            />
            {/* <TokenSelectorDrawer onCancel={onCancel} width={400} visible={visible} onCoinClick={onClickCoin} coinList={coinList} /> */}
            <div style={{ backgroundColor: 'black', display: "flex", flexDirection: "column", marginBottom: "30px" }}>
              <ExchangeTVChart
                chartTokenSymbol="BTC"
                pageName="Powers"
                fromToken={activeToken.symbol}
                toToken="USDT"
                onChangePrice={onChangePrice}
              />
            </div>
          </div>
        }


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
      </div>
    </div>
  );
}

export default Powers
