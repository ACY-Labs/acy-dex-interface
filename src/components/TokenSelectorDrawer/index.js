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
import { Input, Icon, Drawer, Button } from "antd";
import { useWeb3React } from '@web3-react/core';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { asyncForEach } from "@/utils/asynctools";
import { processString } from "@/components/AcyCoinItem";
import styles from "./styles.less";
import { useConstantLoader, getGlobalTokenList } from '@/constants';
import mockTokenList from '@/components/SwapComponent/mockTokenList.json';
// import InfiniteScroll from 'react-infinite-scroll-component';

const TokenSelectorDrawer = ({
  placement = 'right',
  simple,
  onCancel,
  visible,
  setVisible,
  pageName,
  isRightSelect,
  isFromToken,
  onCoinClick,
  coinList,
  activeToken0,
  setActiveToken0,
  activeToken1,
  setActiveToken1,
  setActiveSymbol,
}) => {
  const { account, library, chainId } = useConstantLoader();

  // const INITIAL_TOKEN_LIST = tokenlist ? tokenlist : TOKEN_LIST
  // const tokenlist = coinList ? coinList : getGlobalTokenList()

  //coinList contains 7 tokens, mockTokenList has thousands
  // const tokenlist = coinList ? coinList : mockTokenList
  const tokenlist = pageName === "Trade" ? mockTokenList : coinList

  // const tokenlist = mockTokenList
  // let tokenlist = allTokenlist.slice(0,9)
  useEffect(() => {
    setInitTokenList(tokenlist)
  }, [tokenlist])

  const baseTokenAddr = {
    56: [
      { symbol: "USDC", address: "0x8965349fb649A33a30cbFDa057D8eC2C48AbE2A2" },
      { symbol: "USDT", address: "0xF82eEeC2C58199cb409788E5D5806727cf549F9f" },
    ],
    137: [
      { symbol: "USDC", address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174" },
      { symbol: "USDT", address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" }
    ],
    80001: [
      { symbol: "USDC", address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174" },
      { symbol: "USDT", address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f" }
    ]
  }

  const [hasMore, setHasMore] = useState(true);
  const [pageIdx, setPageIdx] = useState(1);
  const [initTokenList, setInitTokenList] = useState(tokenlist);
  const [customTokenList, setCustomTokenList] = useState([]);
  const [tokenSearchInput, setTokenSearchInput] = useState('');
  const [favTokenList, setFavTokenList] = useState([]);
  const { activate } = useWeb3React();
  const [tokenBalanceDict, setTokenBalanceDict] = useState({});
  const [renderTokenList, setRenderTokenList] = useState(initTokenList?.slice(0, 20));


  useEffect(() => {
    if (!tokenlist) return
    // return
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
    //read the fav tokens code in storage
    var favTokenSymbol = JSON.parse(localStorage.getItem('tokens_symbol'));
    //set to fav token
    if (favTokenSymbol != null) {
      setFavTokenList(
        initTokenList.filter(token => favTokenSymbol.includes(token.symbol))
      );
    }
  }, [chainId]);

  useEffect(() => {
    setRenderTokenList(initTokenList?.slice(0, 20))
  }, [initTokenList])

  const onTokenSearchChange = e => {
    setPageIdx(1)
    setTokenSearchInput(e.target.value);
    let filterTokenList = tokenlist.filter(token => token.symbol.toUpperCase().includes(e.target.value.toUpperCase()) || token.name.toUpperCase().includes(e.target.value.toUpperCase()))
    setInitTokenList(filterTokenList)
    if (filterTokenList.length < 20) {
      setHasMore(false)
    } else {
      setHasMore(true)
      filterTokenList = filterTokenList.slice(0, 20)
    }
    setRenderTokenList(
      filterTokenList
    );
  };

  const loadMore = () => {
    console.log("load more")
    if (pageIdx * 20 >= initTokenList.length) {
      setHasMore(false);
      return;
    }
    setPageIdx(pageIdx + 1);
    setRenderTokenList(initTokenList.slice(0, (pageIdx + 1) * 20));
  }


  const initTokenBalanceDict = (tokenList) => {
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
      // initTokenBalanceDict(tokenlist);
    }
  }, [account, chainId])

  // useEffect(() => {
  //   console.log('tokenbalancedict', tokenBalanceDict);
  // }, [tokenBalanceDict])

  const setTokenAsFav = token => {
    setFavTokenList(prevState => {
      const prevFavTokenList = [...prevState];
      if (prevFavTokenList.includes(token)) {
        var tokens = prevFavTokenList.filter(value => value != token);
        localStorage.setItem('tokens_addr', JSON.stringify(tokens.map(e => e.address)));
        // localStorage.setItem('token', JSON.stringify(tokens.map(e => e.addressOnEth)));
        localStorage.setItem('tokens_symbol', JSON.stringify(tokens.map(e => e.name)));
        return tokens
      }
      prevFavTokenList.push(token);
      localStorage.setItem('tokens_addr', JSON.stringify(prevFavTokenList.map(e => e.address)));
      localStorage.setItem('tokens_symbol', JSON.stringify(prevFavTokenList.map(e => e.name)));

      return prevFavTokenList;
    });
  };

  const fetchData = (page) => {
    console.log("page", page);
    const temp = allTokenlist.slice(0, 9)
    tokenlist = [...initTokenList, ...temp];
    // setInitTokenList(newTokenList);
  }

  return (
    <Drawer
      title={setActiveSymbol ? "Select a Symbol" : "Select a Token"}
      placement={placement}
      className={styles.drawer}
      // getContainer={false}
      onClose={onCancel}
      visible={visible}
      width={550}
    >

      {simple ?
        //simple is for options-pool
        <div className={styles.tokenselector}>
          <div className={styles.coinList}>
            {pageName == 'Options' &&
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 20, marginBottom: 10}}>
              <div style={{paddingLeft: 30}}>STRIKE</div>
              <div style={{paddingRight: 50}}>TYPE</div>
              <div style={{paddingRight: 60}}>PRICE</div>
            </div>
            }
            {initTokenList.length ? initTokenList.map((token, index) => {
              return (
                <AcyCoinItem
                  data={token}
                  key={index}
                  customIcon={false}
                  pageName={pageName}
                  selectToken={(item) => {
                    if(pageName == 'Options' || pageName == 'Powers') {
                      setActiveSymbol(item.symbol)
                      setVisible(false)
                    } else {
                      onCoinClick(token)
                    }
                  }}
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
                // borderRadius: '40px',
                border: '1px solid #333333',
              }}
              placeholder="Enter the token symbol or address"
              value={tokenSearchInput}
              onChange={onTokenSearchChange}
              id="liquidity-token-search-input"
              autoComplete="off"
              prefix={<Icon type="search" />}
            />
          </div>

          <div className={styles.coinList}>
            <AcyTabs>

              <AcyTabPane tab="All" key="1">
                {renderTokenList?.length && renderTokenList !== undefined ? renderTokenList.map((token, index) => {
                  return (
                    <AcyCoinItem
                      data={token}
                      key={index}
                      customIcon={false}
                      pageName={pageName}
                      clickCallback={() => setTokenAsFav(token)}
                      selectToken={(item) => {
                        if (pageName === "Trade") {
                          onCoinClick(token)
                          if (isRightSelect) {
                            if (isFromToken) {
                              if (item.address < activeToken1.address) {
                                setActiveToken0(item)
                              } else {
                                setActiveToken0(activeToken1)
                                setActiveToken1(item)
                              }
                            } else { // selected toToken
                              if (item.address < activeToken0.address) {
                                setActiveToken1(activeToken0)
                                setActiveToken0(item)
                              } else {
                                setActiveToken1(item)
                              }
                            }
                            if (activeToken0.address === item.address || activeToken1.address === item.address) {
                              if (item.symbol !== "USDT") {
                                setActiveToken0(item)
                                setActiveToken1(baseTokenAddr["137"].find(token => token.symbol === 'USDT'))
                              }
                              else {
                                setActiveToken0(baseTokenAddr["137"].find(token => token.symbol === 'USDT'))
                                setActiveToken1(baseTokenAddr["137"].find(token => token.symbol === 'USDC'))
                              }
                            }
                          }
                          else { //selected from left
                            setActiveToken0(item)
                            setActiveToken1(baseTokenAddr["137"].find(token => token.symbol === 'USDT'))
                          }
                        }
                        setActiveSymbol(item.symbol)
                        setVisible(false)
                      }}
                      isFav={favTokenList.includes(token)}
                      constBal={pageName == 'Futures' 
                      ? '$' + token.price 
                      : token.symbol in tokenBalanceDict ? tokenBalanceDict[token.symbol] : null}
                    />
                  );
                })
                  : null}

                <div className={styles.buttonContainer} style={{marginTop: 20}}>
                  {hasMore ?
                    <Button
                      type="primary"
                      className={styles.buttonCenter}
                      onClick={loadMore}>Load More</Button>
                    : <div className={styles.textCenter} >No more result</div>}
                </div>
              </AcyTabPane>

              <AcyTabPane
                tab={<span><Icon type="star" theme="filled" />Favorite</span>}
                key="2">
                {favTokenList.length ? favTokenList.map((supToken, index) => (
                  <AcyCoinItem
                    data={supToken}
                    key={index}
                    selectToken={(item) => {
                      if (pageName === "Trade") {
                        onCoinClick(supToken)
                        if (isRightSelect) {
                          if (isFromToken) {
                            if (item.address < activeToken1.address) {
                              setActiveToken0(item)
                            } else {
                              setActiveToken0(activeToken1)
                              setActiveToken1(item)
                            }
                          } else { // selected toToken
                            if (item.address < activeToken0.address) {
                              setActiveToken1(activeToken0)
                              setActiveToken0(item)
                            } else {
                              setActiveToken1(item)
                            }
                          }
                          if (activeToken0.address === item.address || activeToken1.address === item.address) {
                            if (item.symbol !== "USDT") {
                              setActiveToken0(item)
                              setActiveToken1(baseTokenAddr["137"].find(token => token.symbol === 'USDT'))
                            }
                            else {
                              setActiveToken0(baseTokenAddr["137"].find(token => token.symbol === 'USDT'))
                              setActiveToken1(baseTokenAddr["137"].find(token => token.symbol === 'USDC'))
                            }
                          }
                        }
                        else { //selected from left
                          setActiveToken0(item)
                          setActiveToken1(baseTokenAddr["137"].find(token => token.symbol === 'USDT'))
                        }
                      }
                      setVisible(false)
                      setActiveSymbol(item.symbol)
                    }}
                    customIcon={false}
                    index={index}
                    pageName={pageName}
                    clickCallback={() => setTokenAsFav(supToken)}
                    isFav={favTokenList.includes(supToken)}
                    constBal={pageName == 'Futures' ? '$' + supToken.price : null}
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