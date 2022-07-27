/////////////////
// Commit 75ecfd9f689adec712c4d36cfabf7b33601d5506 support adding customize token to the selector
// but the implementation fails multi chain switching.
// Reason: (line 94) when chainId changes, useConstantLoader will update account, library, chainId and tokenList
// but the renderTokenList is updated after the tokenList is updated, via useEffect in (line 26, supposedly this useEffect should
// depend on tokenList because renderTokenList relies on the updated tokenList). The two events will trigger line 94 for 2 times,
// 1st time with a correct chainId but a not-yet-updated renderTokenList, which will result in "balanceOf(address)" error.

import { useState, useEffect } from "react";
import { AcyTabs, AcyCoinItem } from "@/components/Acy";
const { AcyTabPane } = AcyTabs;
import { Input, Icon, Drawer } from "antd";
import { useWeb3React } from '@web3-react/core';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { asyncForEach } from "@/utils/asynctools";
import { processString } from "@/components/AcyCoinItem";
import styles from "./styles.less";
import { useConstantLoader, getGlobalTokenList } from '@/constants';

const TokenSelectorDrawer = ({ onCancel, visible, onCoinClick, simple, coinList }) => {
  const { account, library, chainId } = useConstantLoader();

  // const INITIAL_TOKEN_LIST = tokenlist ? tokenlist : TOKEN_LIST
  const tokenlist = coinList ? coinList : getGlobalTokenList()
  useEffect(() => {
    setInitTokenList(tokenlist)
  }, [tokenlist])

  const [initTokenList, setInitTokenList] = useState(tokenlist);
  const [customTokenList, setCustomTokenList] = useState([]);
  const [tokenSearchInput, setTokenSearchInput] = useState('');
  const [favTokenList, setFavTokenList] = useState([]);
  const { activate } = useWeb3React();
  const [tokenBalanceDict, setTokenBalanceDict] = useState({});

  useEffect(() => {
    if (!tokenlist) return

    console.log("resetting page states in TokenSelectorModal", tokenlist)
    setInitTokenList(tokenlist);
    setCustomTokenList([]);
    setTokenSearchInput('');
    setFavTokenList([]);
    setTokenBalanceDict({});
    //// normal things happen after this line

    //read customTokenList from storage
    const localTokenList = JSON.parse(localStorage.getItem('customTokenList')) || [];
    setCustomTokenList(localTokenList);
    //combine initTokenList and customTokenList
    const totalTokenList = [...localTokenList, ...tokenlist];
    console.log("resetting tokenSelectorModal new renderTokenList", totalTokenList)
    //read the fav tokens code in storage
    var favTokenSymbol = JSON.parse(localStorage.getItem('tokens_symbol'));
    //set to fav token
    if (favTokenSymbol != null) {
      setFavTokenList(
        initTokenList.filter(token => favTokenSymbol.includes(token.symbol))
      );
    }
  }, [chainId]);

  const onTokenSearchChange = e => {
    setTokenSearchInput(e.target.value);
    setInitTokenList(
      tokenlist.filter(token => token.symbol.toUpperCase().includes(e.target.value.toUpperCase()) || token.name.toUpperCase().includes(e.target.value.toUpperCase()))
    );
  };

  const initTokenBalanceDict = (tokenList) => {
    console.log('Init Token Balance!!!! with chainId, TokenList', chainId, tokenList);
    const newTokenBalanceDict = {};
    asyncForEach(tokenList, async (element, index) => {
      console.log("dispatched async", element)
      const token = element;
      var { address, symbol, decimals } = token;
      const bal = await getUserTokenBalance(
        { address, symbol, decimals },
        chainId,
        account,
        library
      ).catch(err => {
        newTokenBalanceDict[token.symbol] = 0;
        console.log("Failed to load balance, error param: ", address, symbol, decimals, err);
      })

      const balString = processString(bal);
      newTokenBalanceDict[token.symbol] = balString;
      return balString;
    })
    setTokenBalanceDict(newTokenBalanceDict);
  }

  useEffect(() => {
    console.log("tokenselectormodal refreshed because now on ", library, account, chainId,)
    if (!library || !account || !chainId) return;
    if (tokenlist) {
      initTokenBalanceDict(tokenlist);
    }
  }, [account, chainId])

  useEffect(() => {
    console.log('tokenbalancedict', tokenBalanceDict);
  }, [tokenBalanceDict])


  const setTokenAsFav = token => {
    setFavTokenList(prevState => {
      const prevFavTokenList = [...prevState];
      if (prevFavTokenList.includes(token)) {
        var tokens = prevFavTokenList.filter(value => value != token);
        localStorage.setItem('token', JSON.stringify(tokens.map(e => e.addressOnEth)));
        localStorage.setItem('tokens_symbol', JSON.stringify(tokens.map(e => e.symbol)));
        return tokens
      }
      prevFavTokenList.push(token);
      localStorage.setItem('token', JSON.stringify(prevFavTokenList.map(e => e.addressOnEth)));
      localStorage.setItem('tokens_symbol', JSON.stringify(prevFavTokenList.map(e => e.symbol)));

      return prevFavTokenList;
    });
  };

  return (
    <Drawer
      title="Select a Token"
      placement="right"
      className={styles.drawer}
      getContainer={false}
      onClose={onCancel}
      visible={visible}
      width={550}
    >

      {simple ?
        <div className={styles.tokenselector}>
          <div className={styles.coinList}>
            {initTokenList.length ? initTokenList.map((token, index) => {
              return (
                <AcyCoinItem
                  data={token}
                  key={index}
                  customIcon={false}
                  clickCallback={() => setTokenAsFav(token)}
                  selectToken={() => {
                    onCoinClick(token);
                  }}
                  isFav={favTokenList.includes(token)}
                  constBal={token.symbol in tokenBalanceDict ? tokenBalanceDict[token.symbol] : null}
                />
              );
            })
              : <div className={styles.textCenter} >No matching result</div>}
          </div>
        </div>
        :
        <div className={styles.tokenselector}>
          <div className={styles.search}>
            <Input
              size="large"
              style={{
                backgroundColor: 'black',
                borderRadius: '40px',
                border: '1px solid #333333',
              }}
              placeholder="Enter the token symbol or address"
              value={tokenSearchInput}
              onChange={onTokenSearchChange}
              id="liquidity-token-search-input"
              autoComplete="off"
            />
          </div>

          <div className={styles.coinList}>
            <AcyTabs>
              <AcyTabPane tab="All" key="1">
                {initTokenList.length ? initTokenList.map((token, index) => {
                  return (
                    <AcyCoinItem
                      data={token}
                      key={index}
                      customIcon={false}
                      clickCallback={() => setTokenAsFav(token)}
                      selectToken={() => {
                        onCoinClick(token);
                      }}
                      isFav={favTokenList.includes(token)}
                      constBal={token.symbol in tokenBalanceDict ? tokenBalanceDict[token.symbol] : null}
                    />
                  );
                })
                  : <div className={styles.textCenter} >No matching result</div>}
              </AcyTabPane>

              <AcyTabPane tab="Favorite" key="2">
                {favTokenList.length ? favTokenList.map((supToken, index) => (
                  <AcyCoinItem
                    data={supToken}
                    key={index}
                    selectToken={() => {
                      onCoinClick(supToken);
                    }}
                    customIcon={false}
                    index={index}
                    clickCallback={() => setTokenAsFav(supToken)}
                    isFav={favTokenList.includes(supToken)}
                  />
                ))
                  : <div className={styles.textCenter} >No matching result</div>}
              </AcyTabPane>
            </AcyTabs>
          </div>
        </div>
      }
    </Drawer>
  )
}

export default TokenSelectorDrawer;