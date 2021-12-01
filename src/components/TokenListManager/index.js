import { useState, useEffect } from "react";
import { PageHeader, Input } from "antd";
import { AcyCoinItem } from "@/components/Acy";
import styles from "./styles.less"
import className from "classnames";
import styled from "styled-components";
import axios from "axios";
import utils from "web3-utils";

const AcyPageHeader = ({ onBack, className: styledClassName, ...props }) => {
    return (
        <PageHeader
            {...props}
            className={className(styledClassName)}
            onBack={() => { onBack ? onBack() : null }}
        />
    )
}

const StyledPageHeader = styled(AcyPageHeader)`
    padding: 0;
    .ant-page-header-heading-title {
        font-size: 18px;
        font-weight: 600;
        line-height: 52px;
        color: #b5b6b6;
    }
    .ant-page-header-back {
        font-size: 18px;
        font-weight: 600;
        line-height: 52px;
        margin: 0 16px 0 0;
    }
    .ant-page-header-back-button {
        color: #b5b6b6 !important;
    }
    .ant-page-header-heading-sub-title {
        color: white;
    }
`;

const TokenListManager = ({ onBack }) => {
    const [searchAddr, setSearchAddr] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [customTokenList, setCustomTokenList] = useState([]);

    // // FIXME: device a faster way of token lookup
    // const [tokenList, setTokenList] = useState([]);
    // const getTokenList = async (address) => {
    //     console.log("start to fetch")
    //     const list = await axios.get("https://api.coingecko.com/api/v3/coins/list");
    //     setTokenList(list.data);
    // }
    // useEffect(() => {
    //     getTokenList();
    // }, []);

    const getTokenInfo = async () => {
        console.log("start to fetch")
        // const list = await axios.get("https://api.coingecko.com/api/v3/coins/list");
        axios.get(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${searchAddr}`).then(res => {
            console.log("test returned data", res)
            const { name, symbol, image } = res.data;
            setSearchResult({ name: name.charAt(0).toUpperCase() + name.slice(1), symbol: symbol.toUpperCase(), logoURI: image.small });
        }).catch(error => { console.log("error happened", error) })
    }
    useEffect(() => {
        if (utils.isAddress(searchAddr))
            getTokenInfo();
        else
            setSearchResult(null);
    }, [searchAddr]);

    return (
        <StyledPageHeader
            onBack={() => onBack()}
            title="Manage Token List"
        // subTitle="This is a subtitle"
        >
            {/* <div className={styles.title}> a token</div> */}
            <div>can test with 0x1f9840a85d5af5bf1d1762f925bdaddc4201f984</div>
            <div className={styles.search}>
                <Input
                    size="large"
                    style={{
                        backgroundColor: '#373739',
                        borderRadius: '40px',
                    }}
                    placeholder="Enter the token address"
                    value={searchAddr}
                    onChange={e => setSearchAddr(e.currentTarget.value)}
                    id="liquidity-token-search-input"
                />
            </div>
            <div className={styles.container}>
                {searchResult ? <AcyCoinItem
                    data={searchResult}
                    customIcon={false}
                    setAsFav={() => null}
                    selectToken={() => setCustomTokenList(prev => [...prev, searchResult])}
                    hideBalance
                    hideFavButton
                />
                    : <div className={styles.textCenter}>
                        {searchAddr ? "No matching token found" : "Please search a token"}
                    </div>
                }
            </div>

            <div className={styles.container}>
                <div>{customTokenList.length} Custom Tokens</div>
                <div className={styles.container}>
                    {customTokenList.map((token, idx) => (
                        <AcyCoinItem
                            data={token}
                            key={idx}
                            customIcon={false}
                            setAsFav={() => null}
                            selectToken={() => null}
                            hideBalance
                            hideFavButton
                        />
                    ))}
                </div>
            </div>
        </StyledPageHeader>
    )
}

export default TokenListManager;