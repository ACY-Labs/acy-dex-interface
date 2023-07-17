/////////////////
// Commit 75ecfd9f689adec712c4d36cfabf7b33601d5506 support adding customize token to the selector
// but the implementation fails multi chain switching.
// Reason: (line 94) when chainId changes, useConstantLoader will update account, library, chainId and tokenList
// but the renderTokenList is updated after the tokenList is updated, via useEffect in (line 26, supposedly this useEffect should
// depend on tokenList because renderTokenList relies on the updated tokenList). The two events will trigger line 94 for 2 times,
// 1st time with a correct chainId but a not-yet-updated renderTokenList, which will result in "balanceOf(address)" error.

import { useState, useEffect, useMemo } from "react";
import { AcyModal, AcyTabs, AcyCoinItem } from "@/components/Acy";
const { AcyTabPane } = AcyTabs;
import TokenListManager from "./TokenListManager";
import { Input, Icon } from "antd";
import { useWeb3React } from '@web3-react/core';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { asyncForEach } from "@/utils/asynctools";
import { processString } from "@/components/AcyCoinItem";
import styles from "./styles.less";
import { useConstantLoader, getGlobalTokenList } from '@/constants';
import { useChainId } from "@/utils/helpers";
import useSWR from "swr";
import Reader from '@/abis/future-option-power/Reader.json'
import { getContract } from "@/constants/future_option_power";
import { PLACEHOLDER_ACCOUNT, fetcher } from '@/acy-dex-futures/utils';
import { formatUnits } from "@ethersproject/units";

const TokenSelectorModal = ({ onCancel, visible, onCoinClick, sideComponent }) => {
    const { account, library } = useWeb3React();
    const { chainId } = useChainId();

    // TODO: create a separate tokenSelectorModal for depositWithdrawModal, because this current component is used in many obsoleted pages.
    const readerAddress = getContract(chainId, "reader")
    const poolAddress = getContract(chainId, "pool")

    const { data: tokenInfo, mutate: updateTokenInfo } = useSWR([chainId, readerAddress, "getTokenInfo", poolAddress, account || PLACEHOLDER_ACCOUNT], {
        fetcher: fetcher(library, Reader)
    });

    console.log("debug tokenInfo: ", tokenInfo)

    useEffect(() => {
        if (!library) return;

        library.on('block', () => {
            updateTokenInfo()
        });
        return () => {
            library.removeAllListeners('block')
        }
    },
        [
            library,
            chainId,
            updateTokenInfo,
        ]
    )

    const [currentPanel, setCurrentPanel] = useState("selectToken");
    const [customTokenList, setCustomTokenList] = useState([]);
    const [tokenSearchInput, setTokenSearchInput] = useState('');
    const [favTokenList, setFavTokenList] = useState([]);

    const displayTokens = useMemo(() => {
        if (!tokenInfo) return [];
        
        const parsedTokens = tokenInfo.map((token) => {
            const balanceFloat = formatUnits(token.balance, 18)  // TODO: replace 18 with token.decimals
            return {
                ...token,
                balance: balanceFloat
            }
        })

        if (tokenSearchInput)
            return parsedTokens.filter(token => token.symbol.toLowerCase().includes(tokenSearchInput))
        return parsedTokens
    }, [tokenInfo, tokenSearchInput])

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
    };

    // TODO: save only symbol in localstorage, and useMemo to filter it out
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
        <AcyModal onCancel={onCancel} width={400} visible={visible} sideComponent={sideComponent}>
            {currentPanel == "selectToken" ? (
                <>
                    <div className={styles.title}>Select a token</div>
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
                                {displayTokens.length ? displayTokens.map((token, index) => {
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
                                            constBal={token.balance}
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
                                        constBal={supToken.balance}
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