import React, { useState, useEffect } from 'react';
import AcyCard from '@/components/AcyCard';
import DerivativeComponent from '@/components/DerivativeComponent'
import ComponentTabs from '@/components/ComponentTabs';
import ExchangeTVChart from '@/components/ExchangeTVChart/ExchangeTVChart';
import AcyPool from '@/components/AcyPool';
import { useChainId } from '@/utils/helpers';
import { getTokens, getContract } from '@/constants/powers.js';
import AcySymbolNav from '@/components/AcySymbolNav';
import AcySymbol from '@/components/AcySymbol';
import { getGlobalTokenList } from '@/constants';
import styles from './styles.less'

const Future = props => {
  const { chainId } = useChainId();
  const tokens = getTokens(chainId);

  const [mode, setMode] = useState('Buy')
  const [symbol, setSymbol] = useState('BTCUSD')

  const [activeToken, setActiveToken] = useState((tokens.filter(ele => ele.symbol == "BTC"))[0]);

  let coinList = getGlobalTokenList()
  coinList = coinList.filter(token => token.symbol == "USDT" || token.symbol == 'USDC' || token.symbol == 'BTC' || token.symbol == 'ETH')

  const KChartTokenListMATIC = ["BTC", "ETH", "MATIC"]
  const KChartTokenListETH = ["BTC", "ETH"]
  const KChartTokenListBNB = ["BTC", "ETH", "BNB"]
  const KChartTokenList = chainId === 56 || chainId === 97 ? KChartTokenListBNB
    : chainId === 137 || chainId === 80001 ? KChartTokenListMATIC
    : KChartTokenListETH

  const selectTab = item => {
    setActiveToken((tokens.filter(ele => ele.symbol == item)[0]))
  }

  useEffect(()=>{
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
              pairName={activeToken.symbol}
              // showDrawer={onClickCoin}
              // latestPriceColor={priceChangePercentDelta * 1 >= 0 && '#0ecc83' || '#fa3c58'}
              // latestPrice={latestPrice}
              // latestPricePercentage={priceChangePercentDelt
              coinList={coinList}
              latestPriceColor={priceChangePercentDelta*1>= 0 && '#0ecc83' ||'#fa3c58'}
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
            <DerivativeComponent
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

export default Future
