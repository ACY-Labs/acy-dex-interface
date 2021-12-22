import { useState, useEffect } from "react";
import { AcyModal, AcyTabs, AcyCoinItem } from "@/components/Acy";
const { AcyTabPane } = AcyTabs;
import TokenListManager from "./TokenListManager";
import { Input, Icon } from "antd";
import { useWeb3React } from '@web3-react/core';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { asyncForEach } from "@/utils/asynctools";
import { processString } from "@/components/AcyCoinItem";

import INITIAL_TOKEN_LIST from '@/constants/TokenList';
import styles from "./styles.less";


const TokenSelectorModal = ({ onCancel, visible, onCoinClick }) => {
    const [currentPanel, setCurrentPanel] = useState("selectToken");

    const [initTokenList, setInitTokenList] = useState(INITIAL_TOKEN_LIST);
    const [customTokenList, setCustomTokenList] = useState([]);
    const [renderTokenList, setRenderTokenList] = useState([]); // actual token list rendered 
    const [tokenSearchInput, setTokenSearchInput] = useState('');
    const [favTokenList, setFavTokenList] = useState([]);
    const { account, chainId, library, activate } = useWeb3React();
    const [tokenBalanceDict, setTokenBalanceDict] = useState({});

    useEffect(() => {
        //read customTokenList from storage
        const localTokenList = JSON.parse(localStorage.getItem('customTokenList')) || [];
        setCustomTokenList(localTokenList);
        //combine initTokenList and customTokenList
        const totalTokenList = [...localTokenList, ...initTokenList];
        setRenderTokenList(totalTokenList);
        //read the fav tokens code in storage
        var favTokenSymbol = JSON.parse(localStorage.getItem('tokens_symbol'));
        //set to fav token
        if (favTokenSymbol != null) {
            setFavTokenList(
                renderTokenList.filter(token => favTokenSymbol.includes(token.symbol))
            );
        }
    }, []);

    useEffect(() => {
        // reset back to selectToken after closing modal
        if (visible === false)
            setCurrentPanel("selectToken");
    }, [visible]);

    useEffect(() => {
        // focus search input every time token modal is opened.
        // setTimeout is used as a workaround as document.getElementById always return null without  some delay.
        const focusSearchInput = () =>
            document.getElementById('liquidity-token-search-input').focus();
        if (visible === true) setTimeout(focusSearchInput, 100);
    }, [visible, currentPanel])

    // method to update the value of token search input field,
    // and filter the token list based on the comparison of the value of search input field and token symbol.
    const onTokenSearchChange = e => {
        setTokenSearchInput(e.target.value);
        setInitTokenList([]);
        setInitTokenList(
            renderTokenList.filter(token => token.symbol.includes(e.target.value.toUpperCase()))
        );
    };

    const initTokenBalanceDict = (tokenList) => {
        console.log('Init Token Balance!!!!');        
        const newTokenBalanceDict = {};
        asyncForEach(tokenList, async(element, index) => {
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
        if (!library || !account || !chainId) return;
        if(renderTokenList) {
            initTokenBalanceDict(renderTokenList);
        }
    }, [library, account, chainId, renderTokenList])

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
        <AcyModal onCancel={onCancel} width={400} visible={visible}>
            {currentPanel == "selectToken" ? (
                <>
                    <div className={styles.title}>Select a token</div>
                    <div className={styles.search}>
                        <Input
                            size="large"
                            style={{
                                backgroundColor: '#373739',
                                borderRadius: '40px',
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
                                {customTokenList.length ? customTokenList.map((token, index) => {
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
                                            constBal={ token.symbol in tokenBalanceDict ? tokenBalanceDict[token.symbol] : null }
                                        />
                                    );
                                }) : null}

                                {initTokenList.length ? initTokenList.map((token, index) => {
                                    return (
                                        <AcyCoinItem
                                            data={token}
                                            key={index}
                                            customIcon={false}
                                            clickCallback={() => setTokenAsFav(token)}
                                            // setAsFav={() => console.log('token:',token)}
                                            selectToken={() => {
                                                onCoinClick(token);
                                            }}
                                            isFav={favTokenList.includes(token)}
                                            constBal={ token.symbol in tokenBalanceDict ? tokenBalanceDict[token.symbol] : null }
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

                    {/* <div className={styles.manageCoinList} onClick={() => { setCurrentPanel("manageTokenList") }}>
                        <Icon type="form" style={{ marginRight: "1rem" }} /> Manage Token Lists
                    </div> */}
                </>
            )
                : <TokenListManager
                    customTokenList={customTokenList}
                    setCustomTokenList={setCustomTokenList}
                    onBack={() => setCurrentPanel("selectToken")}
                />}
        </AcyModal>
    )
}

export default TokenSelectorModal;