import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown } from 'antd';
import {
    DownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import onlyLastPromise, { DiscardSignal } from 'only-last-promise';
import ReactDOM from 'react-dom';
import { Link, useHistory } from 'react-router-dom';
import styles from './styles.less';
import { WatchlistManager } from '@/pages/Market/WatchlistManager';
import {
    marketClient,
    fetchTokenSearch,
    fetchPoolSearch,
    fetchTokensFromId,
    fetchPoolsFromId,
    fetchSearchCoinReturns,
    fetchSearchPoolReturns,
} from '@/pages/Market/Data';

import { SCAN_URL_PREFIX, useConstantLoader } from "@/constants";
import { ConsoleSqlOutlined } from '@ant-design/icons';


const { AcyTabPane } = AcyTabs;
const watchlistManagerToken = new WatchlistManager('token');
const watchlistManagerPool = new WatchlistManager('pool');
const lastPromiseWrapper = onlyLastPromise();


export class SmallTable extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        mode: this.props.mode,
        tableData: this.props.data,
        displayNumber: this.props.displayNumber,
        updateState: 0,
    };

    expandSmallTable = () => {
        this.setState({
            displayNumber: this.state.displayNumber + 2,
        });
    };

    toggleWatchlist = (mode, address, tokenSymbol = null) => {
        let refreshWatchlist = this.props.refreshWatchlist;
        if (mode == 'token') {
            let oldArray = watchlistManagerToken.getData();
            let oldSymbolArray = watchlistManagerToken.getTokensSymbol();
            console.log('oldSymbolArray:', oldSymbolArray);
            if (oldArray.includes(address)) {
                oldArray = oldArray.filter(item => item != address);
                oldSymbolArray = oldSymbolArray.filter(item => item != tokenSymbol);
            } else {
                oldArray.push(address);
                oldSymbolArray.push(tokenSymbol);
            }
            watchlistManagerToken.saveData(oldArray);
            watchlistManagerToken.saveTokensSymbol(oldSymbolArray);
        }

        if (mode == 'pool') {
            let oldArray = watchlistManagerPool.getData();
            if (oldArray.includes(dataddressa)) {
                oldArray = oldArray.filter(item => item != address);
            } else {
                oldArray.push(address);
            }
            watchlistManagerPool.saveData(oldArray);
        }

        refreshWatchlist();

        this.setState({
            updateState: 1,
        });
    };

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.data !== prevProps.data) {
            this.setState({
                tableData: this.props.data,
            });
        }
    }

    renderBody = entry => {
        let content = <></>;

        if (this.props.data.length == 0) {
            return;
        }

        if (this.state.mode == 'token') {
            content = (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AcyTokenIcon symbol={entry.image} width={20} />
                    <Link
                        style={{ color: 'white' }}
                        className={styles.coinName}
                    // to={`/market/info/token/${entry.address}`}
                    >
                        {entry.symbol}
                    </Link>
                    <div style={{ width: 5 }}></div>
                    <span className={styles.coinShort}> ({entry.name})</span>
                </div>
            );
        } else {
            content = (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AcyTokenIcon symbol={entry.logoURL1} width={20} />
                    <AcyTokenIcon symbol={entry.logoURL2} width={20} />
                    <Link
                        style={{ color: 'white' }}
                        to={`/market/info/pool/${entry.address}`}
                    >
                        <span className={styles.coinName}>
                            {entry.coin1}{' / '}{entry.coin2}
                        </span>
                    </Link>
                </div>
            );
        }

        return (
            <tr className={styles.smallTableRow}>
                <td className={styles.smallTableBody}>{content}</td>
            </tr>
        );
    };


    render() {
        return (
            <table className={styles.smallTable}>
                <tbody>
                    <tr className={styles.smallTableRow}>
                        <td className={styles.smallTableHeader}>
                            {this.state.mode == 'token' ? 'Token' : 'Pool'}
                        </td>
                    </tr>

                    {this.state.tableData
                        .slice(0, this.state.displayNumber)
                        .map(item => this.renderBody(item))}

                    <tr>
                        {/* <a className={styles.smallTableSeeMore} onClick={this.expandSmallTable}>
                            See more...
                        </a> */}
                    </tr>
                </tbody>
            </table>
        );
    }
}

export const SearchBar = props => {
    // states
    const [visible, setVisible] = useState(true);
    const [visibleSearchBar, setVisibleSearchBar] = useState(false);
    const [visibleNetwork, setVisibleNetwork] = useState(false);
    const [activeNetwork, setActiveNetwork] = useState('Ethereum');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCoinReturns, setSearchCoinReturns] = useState([]);
    const [searchPoolReturns, setSearchPoolReturns] = useState([]);
    const [displayNumber, setDisplayNumber] = useState(3);
    const [watchlistToken, setWatchlistToken] = useState([]);
    const [watchlistPool, setWatchlistPool] = useState([]);
    const [, update] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const [localToken, setLocalToken] = useState([]);
    const [localPool, setLocalPool] = useState([]);

    const [dataSourceCoin, setDataSourceCoin] = useState([]);
    const [marketNetwork, setmarketNetwork] = useState('');
    const { chainId } = useConstantLoader();

    useEffect(() => {
        // fetch coin list
        const apiUrlPrefix = "https://api.coingecko.com/api/v3"
        axios.get(
            `${apiUrlPrefix}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`
        ).then(data => {
            setDataSourceCoin(data.data)
        })
        .catch(e => {
            console.log(e);
        });
    }, [chainId, marketNetwork]);

    // fetch searchcoinresults
    const networkOptions = [
        {
            name: 'Ethereum',
            logo: (
                <img
                    src="data:image/png;base64,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"
                    style={{ width: '20px', marginRight: '0.5rem' }}
                />
            ),
        },
        {
            name: 'Optimism',
            logo: <AcyIcon name="optimism" width={20} style={{ marginRight: '0.5rem' }} />,
        },
        {
            name: 'Arbitrum',
            logo: <AcyIcon name="arbitrum" width={20} style={{ marginRight: '0.5rem' }} />,
        },
    ];

    // some helper functions
    const matchQueryCoin = (data, query) => {
        let lowercase = query.toLowerCase();
        let newData = data.filter(item => {
            if (lowercase.length == 0) {
                return true;
            }
            return (
                item.name.toLowerCase().includes(lowercase) || item.short.toLowerCase().includes(lowercase)
            );
        });

        return newData;
    };

    const matchQueryPool = (data, query) => {
        let lowercase = query.toLowerCase();
        let newData = data.filter(item => {
            if (lowercase.length == 0) {
                return true;
            }
            return (
                item.coin1.toLowerCase().includes(lowercase) || item.coin2.toLowerCase().includes(lowercase)
            );
        });

        return newData;
    };

    // callback event handlers
    const onSearchFocus = useCallback(() => {
        setVisibleSearchBar(true);
        setVisibleNetwork(false);
    });

    const onInput = useCallback(e => {
        setIsLoading(false);
        setSearchQuery(e.target.value);
        const key = 'volume24h'
        setSearchCoinReturns(
            // localToken.filter(
            //   token => token.short.includes(e.target.value.toUpperCase()) || token.name.toUpperCase().includes(e.target.value.toUpperCase())
            // )
            dataSourceCoin.filter(
                token => token.symbol.includes(e.target.value.toUpperCase()) || token.name.toUpperCase().includes(e.target.value.toUpperCase())
            )
        );
        setSearchPoolReturns(
            localPool.filter(
                item => item.coin1.includes(e.target.value.toUpperCase()) || item.coin2.includes(e.target.value.toUpperCase())
            )
        );

    });

    const onScroll = e => {
        let scrollValue = e.target.scrollTop;
        if (scrollValue > 250) setVisible(false);
        else setVisible(true);
    };

    let refreshWatchlist = () => {
        if (props.onRefreshWatchlist) props.onRefreshWatchlist();

        let tokenWatchlistData = watchlistManagerToken.getData();
        let poolWatchlistData = watchlistManagerPool.getData();

        // fetch the data here
        fetchTokensFromId(marketClient, tokenWatchlistData).then(data => {
            setWatchlistToken(
                data.tokens.map(item => ({ address: item.id, name: item.name, short: item.symbol }))
            );
        });

        fetchPoolsFromId(marketClient, poolWatchlistData).then(data => {
            setWatchlistPool(
                data.pairs.map(item => ({ address: item.id, coin1: item.token0.symbol, coin2: item.token1.symbol, percent: 0 }))
            );
        })

        if (props.refreshWatchlist) props.refreshWatchlist();
    };

    // refs
    const outsideClickRef = useDetectClickOutside({
        onTriggered: () => {
            setVisibleSearchBar(false);
        },
    });
    const outsideClickRefNetwork = useDetectClickOutside({
        onTriggered: () => {
            setVisibleNetwork(false);
        },
    });
    const rootRef = React.useRef();

    // 网络列表
    const [networkListIndex, setNetworkListIndex] = useState(0);

    const networkList = [
        {
            name: 'BSC',
            icon: 'Binance',
            onClick: async () => {
                setNetworkListIndex(0);
                //   props.getNetwork('BSC');
                setmarketNetwork('BSC');
                localStorage.setItem("market", 56);
            },
        },
        {
            name: 'Polygon',
            icon: 'Polygon',
            onClick: async () => {
                setNetworkListIndex(1);
                //   props.getNetwork('Polygon');
                setmarketNetwork('Polygon');
                localStorage.setItem("market", 137);
            },
        },
    ];

    const networkListInCardList = (
        <div className={styles.networkListBlock}>
            <div>
                <span className={styles.networkTitle}>Select Market Network</span>
            </div>
            <AcyCardList>
                {networkList.map((item) => {
                    return (
                        <AcyCardList.Thin className={styles.networkListLayout} onClick={() => item.onClick()}>
                            {
                                <AcyIcon.MyIcon width={15} type={item.icon} />
                            }
                            <span>{item.name}</span>
                        </AcyCardList.Thin>
                    );
                }
                )}
            </AcyCardList>
        </div>
    );

    const n_index = () => {
        const n = localStorage.getItem("market");
        if (n == 56) {
            return 0;
        } else if (n == 137) {
            return 1;
        } else return 0;
    }

    // lifecycle methods
    useEffect(() => {
        setNetworkListIndex(n_index);
        let contentRoot = ReactDOM.findDOMNode(rootRef.current).parentNode.parentNode;
        contentRoot.addEventListener('scroll', onScroll);

        setIsLoading(true);

        const isLoadingSearchCoin = true;
        const isLoadingSearchPool = true;

        // fetch search coin returns
        // possible keys = ["volume24h", "tvl"]
        const key = 'volume24h'
        fetchSearchCoinReturns(key).then(data => {
            if (data) {
                // setSearchCoinReturns(
                //   data.map(item => {
                //     return { logoURL: item.logoURL, address: item.address, name: item.name, short: item.short };
                //   })
                // );
                setLocalToken(
                    data.map(item => {
                        return { logoURL: item.logoURL, address: item.address, name: item.name, short: item.short };
                    })
                )
            }
        }).catch(error => {
            console.log("Error in fetch search coin returns:", error);
        })

        setSearchCoinReturns(dataSourceCoin)

        // fetch search pool returns
        fetchSearchPoolReturns(key).then(data => {
            if (data) {
                setSearchPoolReturns(
                    data.map(item => {
                        return { coin1: item.coin1, coin2: item.coin2, logoURL1: item.logoURL1, logoURL2: item.logoURL2, address: item.address };
                    })
                );
                setLocalPool(
                    data.map(item => {
                        return { coin1: item.coin1, coin2: item.coin2, logoURL1: item.logoURL1, logoURL2: item.logoURL2, address: item.address };
                    })
                );
            }
            setIsLoading(false);
        }).catch(error => {
            console.log("Error in fetch search pool returns:", error);
        })

        // lastPromiseWrapper(fetchSearchCoinReturns()).then(data => {


        //   lastPromiseWrapper(fetchPoolSearch(marketClient, '', data.map(item => item.id))).then(
        //     pooldata => {
        //       setSearchPoolReturns(
        //         pooldata.map(item => {
        //           return { address: item.id, coin1: item.token0, coin2: item.token1, percent: 0 };
        //         })
        //       );
        //       setIsLoading(false);
        //     }
        //   );
        // });

        // refreshWatchlist();

        return function cleanup() {
            contentRoot.removeEventListener('scroll', onScroll);
        };
    }, []);

    // the DOM itself
    return (
        <div
            className={styles.marketNavbar}
            style={{ opacity: visible ? 1 : 0, zIndex: visible ? 10 : -1 }}
            ref={rootRef}>
            {/* search bar */}
            <div className={styles.marketNavbarRight}>
                <div className={styles.searchSection}>
                    {/* this is the gray background */}
                    {visibleSearchBar && <div className={styles.searchBackground} />}
                    <div ref={outsideClickRef}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                                width: '100%',
                            }}
                        >
                            <div className={styles.searchWrapper}>
                                <div className={styles.searchInnerWrapper}>
                                    <Input
                                        placeholder="Search"
                                        size="large"
                                        style={{
                                            backgroundColor: 'black',
                                            borderRadius: '5px',
                                            border: '1px solid #333333',
                                            paddingLeft: '20px',
                                        }}
                                        onFocus={onSearchFocus}
                                        onChange={onInput}
                                        className={styles.searchBar}
                                        value={'' || searchQuery}
                                    />
                                </div>
                            </div>
                            {/* Search modal */}
                            <div style={{ width: '100%', position: 'relative', zIndex: 10 }}>
                                {visibleSearchBar && (
                                    <div
                                        className={styles.searchModal}
                                        style={{ position: 'absolute', left: 0, right: 0, top: '10px' }}
                                    >
                                        <AcyTabs>
                                            <AcyTabPane tab="Search" key="1">
                                                {isLoading ? (
                                                    <Icon type="loading" />
                                                ) : (
                                                    <>
                                                        {searchCoinReturns.length > 0 ? (
                                                            <SmallTable
                                                                mode="token"
                                                                data={searchCoinReturns}
                                                                displayNumber={displayNumber}
                                                                refreshWatchlist={refreshWatchlist}
                                                            />
                                                        ) : (
                                                            <div style={{ fontSize: '16x', margin: '20px' }}>No results</div>
                                                        )}
                                                    </>
                                                )}
                                            </AcyTabPane>
                                        </AcyTabs>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};