/* eslint-disable react/react-in-jsx-scope */
import { getAllSuportedTokensPrice } from "@/acy-dex-swap/utils";
import { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { connect } from 'umi';
import { useWeb3React } from '@web3-react/core';
import { Table, Pagination, Input, Button } from 'antd';
import {
  getTokenContract,
  getUserTokenBalanceRaw,
  getTokenTotalSupply,
  approveTokenWithSpender,
} from '@/acy-dex-swap/utils/index';

import { Icon } from "antd";
import { Fetcher, Percent, Token, TokenAmount, Pair } from '@acyswap/sdk';
import AcyRemoveLiquidityModal from '@/components/AcyRemoveLiquidityModal';
import { isMobile } from 'react-device-detect';
import styles from './styles.less';
import { useConstantLoader, TOKENLIST } from '@/constants';


function getLogoURIWithSymbol(symbol) {
  const supportedTokens = TOKENLIST();
  for (let j = 0; j < supportedTokens.length; j++) {
    if (symbol === supportedTokens[j].symbol) {
      return supportedTokens[j].logoURI;
    }
  }
  return 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg';
}

// table pool column search component
const SearchField = ({ setKeyword, showSearch, setShowSearch }) => {
  const inputRef = useRef();

  let renderComponent;
  if (showSearch) {
    renderComponent = <div style={{ display: "flex", alignItems: "center", backgroundColor: "#191b20", margin: "0 -16px 0 0", borderRadius: "4px" }}>
      <input
        ref={inputRef}
        autoFocus
        style={{ display: showSearch ? "block" : "none", width: "100%", backgroundColor: "transparent", border: "1px solid #1c9965", borderRadius: "30px", outline: 0, paddingLeft: "0.4rem" }}
        onChange={e => { setKeyword(e.target.value) }}
        onKeyPress={e => { if (e.key === "Enter") setKeyword(e.target.value); inputRef.current.value = e.target.value }}
      />
      <Icon type="close"
        className={styles.hoverToWhite}
        style={{ justifyContent: "end", marginLeft: "0.7rem", marginRight: "0.2rem", fontSize: "0.9rem" }}
        onClick={() => {
          setKeyword("");
          inputRef.current.value = "";
          setShowSearch(false);
        }} />
    </div>;
  } else {
    renderComponent = <>
      Pool
      <Icon
        type="search"
        className={styles.hoverToWhite}
        style={{ backgroundColor: "transparent", color: "white", marginLeft: "1rem" }}
        onClick={() => { setShowSearch(true); console.log(showSearch) }}
      />
    </>;
  }
  return renderComponent;
}

// const ExpandableRowTable = (dataSource) => {
//   const columns = useMemo(() => [
//     {
//       title: '#',
//       className: 'centerAlignTableHeader',
//       key: 'index',
//       render: (text, record, index) => (
//         <div>
//           {index + 1}
//         </div>
//       ),
//       width: '3rem',
//     },
//     {
//       title: 'My liquidity',
//       dataIndex: ,
//       // key can be omitted if dataIndex is given (specified in docs)
//       // duplicate column keys will cause search filter problems.
//       className: 'centerAlignTableHeader',
//       render: (text, record, index) => {

//       },
//     },
//     {
//       title: 'Pool share',
//       dataIndex: 'token0Amount',
//       key: 'token0Amount',
//       className: 'centerAlignTableHeader',
//       render: (text, record, index) => (
//         <div>
//           <p>{record.token0Amount}</p>
//           <p>{record.token1Amount}</p>
//         </div>
//       ),
//       visible: !isMobile,
//     },
//     {
//       title: '',
//       dataIndex: 'share',
//       className: 'centerAlignTableHeader',
//       key: 'share',
//       render: (text, record, index) => <div>{record.share}</div>,
//       visible: true,
//     },
//     {
//       title: '',
//       key: 'token0Reserve',
//       dataIndex: 'token0Reserve',
//       className: 'centerAlignTableHeader',
//       render: (text, record, index) => (
//         <div>
//           <p>{record.token0Reserve}</p>
//           <p>{record.token1Reserve}</p>
//         </div>
//       ),
//       visible: !isMobile,
//     },
//     {
//       title: <b>Operation</b>,
//       key: 'poolAddress',
//       className: 'centerAlignTableHeader',
//       render: (text, record, index) => (
//         <div>
//           <button
//             className={styles.removeLiquidityButton}
//             type="button"
//             onClick={() => {
//               setIsModalVisible(true);
//               setRemoveLiquidityPosition(record);
//             }}
//           >
//             Remove
//           </button>
//         </div>
//       ),
//       visible: true,
//     },
//     // { title: "Expand", key: "expand",  visible: true},
//   ]);

//   return (
//     <Table
//             style={{ textAlign: 'center' }}
//             rowKey="?"
//             dataSource={dataSource}
//             columns={columns}
//             pagination={false}
//             locale={{
//               emptyText: (
//                 <span>
//                   <h2>No data for this pool.</h2>
//                 </span>
//               ),
//             }}
//           />
//   )
// }

const AcyLiquidityPositions = (props) => {
  // const [userLiquidityPools, setUserLiquidityPools] = useState([]); // list of pools that user has share
  const { account, chainId, library, tokenList: supportedTokens, scanUrlPrefix: { scanUrl: scanUrlPrefix }, farmSetting: { API_URL: apiUrlPrefix } } = useConstantLoader();
  const { activate } = useWeb3React();

  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [removeLiquidityPosition, setRemoveLiquidityPosition] = useState(null);
  const [userLPHandlers, setUserLPHandlers] = useState([]);
  // const [userLPData, setUserLPData] = useState([]); // fetch a list of valid pool from backend
  const [userLPShares, setUserLPShares] = useState([]);
  const [readListPointer, setReadListPointer] = useState(0);  // last processed read position of "validPoolPairs"
  const displayCountIncrement = 5;

  // fullTableData = userLPData + volume/APR
  const [fullTableData, setFullTableData] = useState([])

  // search component
  const [filteredData, setFilteredData] = useState();
  const [keyword, setKeyword] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // table expanded row
  const [expandedRowKey, setExpandedRowKey] = useState([]);

  // const getColumnSearchProps = (dataIndex) => ({
  //   filterDropdown: ({
  //     setSelectedKeys,
  //     selectedKeys,
  //     confirm,
  //     clearFilters
  //   }) => 
  //     // {
  //     //   setTableFilters([dataIndex, setSelectedKeys, selectedKeys, confirm, clearFilters])
  //     //   return (<></>)
  //     // },
  //     (
  //     <div style={{ padding: 8, backgroundColor: "grey", borderRadius: "3px" }}>
  //       {/* {setTableFilters([dataIndex, setSelectedKeys, selectedKeys, confirm, clearFilters])} */}
  //       {setTableFilters(() => setSelectedKeys)}
  //       <Input
  //         onChange={(e) =>
  //           setSelectedKeys(e.target.value ? [e.target.value] : [])
  //         }
  //         onPressEnter={() =>
  //           handleSearch(selectedKeys, confirm, dataIndex)
  //         }
  //         style={{ width: 188, marginBottom: 8, display: "block" }}
  //       />
  //       <Button
  //         type="primary"
  //         onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
  //         icon="search"
  //         size="small"
  //         style={{ width: 90, marginRight: 8 }}
  //       >
  //         Search
  //       </Button>
  //       <Button
  //         onClick={() => handleReset(clearFilters)}
  //         size="small"
  //         style={{ width: 90, backgroundColor: "black" }}
  //       >
  //         Reset
  //       </Button>
  //     </div>
  //   ),
  //   filterDropdown: () => <> </>,
  //   filterIcon: (filtered) => (
  //     <Icon type="search" style={{ backgroundColor: "transparent", color: filtered ? "orange" : "white" }} onClick={() => {setShowSearch(!showSearch); console.log(showSearch) } } />
  //   ),
  //   onFilter: (value, record) => {
  //     console.log("onFilter");
  //     return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
  //   },
  // });
  // const handleSearch = (selectedKeys, confirm, dataIndex) => {
  //   confirm();
  // };
  // const handleReset = (clearFilters) => {
  //   clearFilters();
  // };

  // table data definitions
  const columns = useMemo(() => [
    {
      title: '#',
      className: 'centerAlignTableHeader',
      key: 'index',
      render: (text, record, index) => (
        <div>
          {index + 1}
        </div>
      ),
      width: '3rem',
      visible: !isMobile
    },
    {
      title: <SearchField {...{ showSearch, setShowSearch, setKeyword }} />,
      dataIndex: 'pool',
      // key can be omitted if dataIndex is given (specified in docs)
      // duplicate column keys will cause search filter problems.
      className: 'centerAlignTableHeader',
      // sort
      // sorter: (a, b) => a.pool.localeCompare(b.pool),
      // search
      // ...getColumnSearchProps("pool"),
      render: (text, record, index) => {
        const addressLength = record.poolAddress.length;

        const token0logo = getLogoURIWithSymbol(record.token0Symbol);
        const token1logo = getLogoURIWithSymbol(record.token1Symbol);

        return (
          <div className={styles.pool}>
            <img
              src={token0logo}
              alt={record.token0Symbol}
              style={{
                maxWidth: '24px',
                maxHeight: '24px',
                marginRight: '0.25rem',
                marginTop: '0.1rem',
              }}
            />
            <img
              src={token1logo}
              alt={record.token1Symbol}
              style={{
                maxWidth: '24px',
                maxHeight: '24px',
                marginRight: '0.5rem',
                marginTop: '0.1rem',
              }}
            />
            <div>
              <p className={styles.bigtitle} onClick={() => {
                setAddComponentPairs(record.token0, record.token1);
              }} >
                {record.pool}
              </p>
              <a target="_blank" href={`${scanUrlPrefix}/address/${record.poolAddress}`} >
                <p className={styles.value}>
                  {`${record.poolAddress.slice(0, 5)}...${record.poolAddress.slice(
                    addressLength - 5,
                    addressLength
                  )}`}
                </p>
              </a>
            </div>
          </div>
        );
      },
      visible: true,
    },
    {
      title: "7D Volume",
      dataIndex: 'volume',
      className: 'centerAlignTableHeader',
      key: 'volume',
      render: (text, record, index) => {
        return (<div>$ {(record.volume * 7).toFixed(2)}</div>)
      },
      visible: !isMobile,
    },
    {
      title: "APR",
      dataIndex: 'apr',
      key: 'apr',
      className: 'centerAlignTableHeader',
      render: (text, record, index) => {
        // const pairOverviewData = userLPOverview[record.poolAddress];
        // if (!pairOverviewData) return;
        // const aprPercentage = pairOverviewData.apr * 100;
        return (
          <div>{(record.apr * 100).toFixed(1)}%</div>
        )
      },
      visible: !isMobile,
    },
    {
      title: "Reserve",
      key: 'token0Reserve',
      dataIndex: 'token0Reserve',
      className: 'centerAlignTableHeader',
      render: (text, record, index) => (
        <div style={{ color: "white" }}>
          <p>{record.token0Reserve}</p>
          <p>{record.token1Reserve}</p>
        </div>
      ),
      visible: true,
    },
    // { title: "Expand", key: "expand",  visible: true},
  ]);

  // fetch lists of valid pool
  const getValidPoolList = () => {
    setLoading(true);
    console.log("fetching user pool list, urlPrefix", apiUrlPrefix);
    axios.get(
      // fetch valid pool list from remote
      // `${apiUrlPrefix}/pool?chainId=${chainId}`
      `${apiUrlPrefix}/userpool?walletId=${account}`
      // `http://localhost:3001/api/userpool?walletId=${account}`
    ).then(async res => {
      console.log(">> received data from backend", res);

      const tokens = supportedTokens;

      // construct pool list locally
      const pools = res.data.pools;

      if (!pools.length) {
        setLoading(false);
        return;
      }
      const fetchTask = [];
      for (let pairAddr of pools) {
        const token0addr = supportedTokens.findIndex(item => item.address === pairAddr.token0);
        const token1addr = supportedTokens.findIndex(item => item.address === pairAddr.token1);

        const { address: token0Address, symbol: token0Symbol, decimals: token0Decimal } = tokens[token0addr];
        const { address: token1Address, symbol: token1Symbol, decimals: token1Decimal } = tokens[token1addr];
        const token0 = new Token(chainId, token0Address, token0Decimal, token0Symbol);
        const token1 = new Token(chainId, token1Address, token1Decimal, token1Symbol);

        // queue get pair task
        const pair = Fetcher.fetchPairData(token0, token1, library, chainId);
        fetchTask.push(pair);
        console.log("adding task to array")
      }
      const pairs = await Promise.allSettled(fetchTask);
      console.log("fetched pairs", pairs);

      const LPHandlers = pairs.map(pair => pair.value);
      setUserLPHandlers(LPHandlers);
      console.log("userLPHandlers is updated with length", LPHandlers.length);

    }).catch(e => console.log("error: ", e));
  }

  const userLPData = useMemo(() => {
    const userPools = [];
    console.log("fetched pairs userLPHandlers", userLPHandlers);
    for (let pair of userLPHandlers) {
      if (!pair)
        continue;

      userPools.push({
        token0: pair.token0,
        token1: pair.token1,
        token0LogoURI: getLogoURIWithSymbol(pair.token0.symbol),
        token1LogoURI: getLogoURIWithSymbol(pair.token1.symbol),
        token0Symbol: pair.token0.symbol,
        token1Symbol: pair.token1.symbol,
        pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
        poolAddress: `${pair.liquidityToken.address}`,
        token0Reserve: `${pair.reserve0.toExact(2)} ${pair.token0.symbol}`,
        token1Reserve: `${pair.reserve1.toExact(2)} ${pair.token1.symbol}`,
      });
    }
    console.log("userLPData is updated with length", userPools.length);
    
    console.log("test elapsed time", new Date());
    return userPools;
  }, [userLPHandlers]);

  // search input component update
  useEffect(() => {
    let filtered = fullTableData;
    if (keyword !== "" && filtered) {
      const conditions = keyword.toLowerCase().split(/[\s\/,]+/);
      filtered = filtered.filter(item => conditions.every(condition => item.pool.toLowerCase().includes(condition)));
    }
    
    setFilteredData(filtered);
  }, [fullTableData, keyword]);
  
  // show loading spinner until the end of loading phase, or 10 seconds has passed.
  useEffect(() => {
    if (fullTableData && fullTableData.length)
      setLoading(false)
  }, [loading, fullTableData]);
  useEffect(() => {
    // setTimeout(() => setLoading(false), 10000)
  }, [])

  // fetch user shares in above pools
  async function getUserPoolShare() {

    const fetchPoolShare = async (pair) => {
      console.log("poolToken,", pair.liquidityToken)
      let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library).catch(e => console.log("fetchPoolShare error", e));
      if (userPoolBalance.isZero()) {
        console.log("zero balance, discard", pair);
        return {};
      }

      userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

      const totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);

      const token0Deposited = pair.getLiquidityValue(
        pair.token0,
        totalSupply,
        userPoolBalance,
        false
      );
      const token1Deposited = pair.getLiquidityValue(
        pair.token1,
        totalSupply,
        userPoolBalance,
        false
      );

      const poolTokenPercentage = new Percent(userPoolBalance.raw, totalSupply.raw).toFixed(4);

      const newData = {
        token0Amount: `${token0Deposited.toSignificant(4)} ${pair.token0.symbol}`,
        token1Amount: `${token1Deposited.toSignificant(4)} ${pair.token1.symbol}`,
        share: `${poolTokenPercentage}%`,
      };

      console.log("userLPShares is updated: ", newData);

      setUserLPShares(prev => ({ ...prev, [pair.liquidityToken.address]: newData }));
    }

    (async () => {
      for (let pair of userLPHandlers) {
        if (!pair)
          continue;
        fetchPoolShare(pair);
      }
    })()

  }

  const getFullTableData = async () => {
    console.log("this is userLPData", userLPData);
    const poolOverview = {};

    const asyncTasks = [];

    const calculateVolAndApr = async (pair) => {
      const token0 = pair.token0;
      const token1 = pair.token1;
      console.log("this is", token0, token1)
      return await axios.get(`${apiUrlPrefix}/poolchart/pair?token0=${token0.address}&token1=${token1.address}`).then(async (res) => {
        // calculate volume in USD
        console.log("this is return data", res.data)
        const { token0: token0Vol, token1: token1Vol } = res.data.data.lastVolume;
        const currentPriceDict = await getAllSuportedTokensPrice();
        const vol0Usd = currentPriceDict[token0.symbol] * token0Vol;
        const vol1Usd = currentPriceDict[token1.symbol] * token1Vol;
        const poolVolumeInUsd = vol0Usd + vol1Usd;

        // calculate reserve in USD
        const { token0: token0Reserve, token1: token1Reserve } = res.data.data.lastReserves;
        const reserve0Usd = currentPriceDict[token0.symbol] * token0Reserve;
        const reserve1Usd = currentPriceDict[token1.symbol] * token1Reserve;
        const poolReserveInUsd = reserve0Usd + reserve1Usd;

        console.log("this is test1", currentPriceDict, poolReserveInUsd, poolVolumeInUsd)

        // calculate APR
        const apr = poolVolumeInUsd * 0.3 / 1000 * 365 / poolReserveInUsd;

        const data = {
          volume: poolVolumeInUsd,
          apr
        }
        poolOverview[pair.poolAddress] = data;

      }).catch(e => {
        console.log("fetching pair volume error", e)
      })
    }

    for (const pair of userLPData) {
      asyncTasks.push(calculateVolAndApr(pair));
    }
    const resolved = await Promise.allSettled(asyncTasks)

    console.log("here", poolOverview)
    const completeTableData = userLPData.map(d => {
      const overviewData = poolOverview[d.poolAddress]
      let temp = d;
      if (overviewData)
        temp = { ...d, ...overviewData }
      return temp
    })
    return completeTableData
  }
  useEffect(async () => {
    const data = await getFullTableData();
    setFullTableData(data);
  }, [userLPData])

  // link liquidity position table and add component together
  const { dispatch, liquidity } = props;
  const setAddComponentPairs = (token0, token1) => {
    dispatch({
      type: "liquidity/setAddTokens",
      payload: {
        token0: token0,
        token1: token1
      }
    });
    console.log("test done setAddTokens from table")
  }

  // // auto scroll to newly loaded data
  // useEffect(() => {
  //   if (filteredData.length) {
  //     document.querySelector(`#liquidityPositionTable > div > div >div.ant-table-body > table > tbody > tr:last-child`).scrollIntoView({ behavior: "smooth" });
  //     console.log(`scroll last row of table into view`);
  //   }
  // }, [filteredData]);

  // first time loading
  useEffect(() => {
    setUserLPHandlers([]);
    getValidPoolList();
  }, [account, chainId]);
  // refresh table data on add/remove liquidity
  useEffect(() => {
    if (liquidity.refreshTable) {
      getValidPoolList();
      setUserLPShares({});
      getUserPoolShare();

      dispatch({
        type: "liquidity/setRefreshTable",
        payload: false,
      });
    }
  }, [liquidity.refreshTable]);

  // useEffect(
  //   () => {
  //     console.log('library:',library);
  //     approveTokenWithSpender(
  //       '0xE971616d94335dec2E54939118AdFcB68E6dCAd6',
  //       '0x6ef448ecb7f650c3a1157acf37ca19ae86dee8da',
  //       library,
  //       account
  //     );
  //   },
  //   []
  // );

  useEffect(
    async () => {
      if (!chainId || !library || !account || !userLPHandlers) return;
      console.log("getting user liquidity on chainId, userLPHandlers", chainId, userLPHandlers)
      await getUserPoolShare();
    },
    [userLPHandlers]
  );



  return (
    <div>
      {loading && loading ? (
        <h2 style={{ textAlign: "center", color: "white", top: "1rem", position: "relative" }}>Loading <Icon type="loading" /></h2>
      ) : (
        <>
          <Table
            id="liquidityPositionTable"
            style={{ textAlign: 'center' }}
            rowKey="poolAddress"
            rowClassName={(record, index) => record.poolAddress === expandedRowKey ? `${styles.rowExpanded} ant-table-expanded-row` : styles.rowNormal}
            expandedRowKeys={expandedRowKey}
            onExpand={(expanded, record) => { expandedRowKey === record.poolAddress ? setExpandedRowKey("") : setExpandedRowKey(record.poolAddress) }}
            dataSource={filteredData || []}
            // loading={{ indicator: <div><Icon type="loading" /></div>, spinning: loading}}
            columns={columns.filter(item => item.visible)}
            pagination={false}
            scroll={{ y: 300 }} // this height is override by global.less #root > .ant-table-body
            locale={{
              emptyText: (
                <span>
                  <h2>No positions available. </h2>
                </span>
              ),
            }}
            // expandable row
            expandRowByClick
            expandIconAsCell={false}
            expandIconColumnIndex={6}
            expandIcon={(props) => {
              if (props.expanded) {
                return <a style={{ color: 'white' }} onClick={e => {
                  props.onExpand(props.record, e);
                }}><Icon type="down" /></a>
              } else {
                return <a style={{ color: 'white' }} onClick={e => {
                  props.onExpand(props.record, e);
                }}><Icon type="right" /></a>
              }
            }}
            expandedRowRender={(record, index) => {
              const data = userLPShares[record.poolAddress];
              return (
                <div style={{ display: "flex", paddingLeft: "3rem" }}>
                  <table id="expandedRowTable">
                    <tbody>
                      <tr>
                        <td>My liquidity</td>
                        {!isMobile && <td>Pool share</td>}
                        {!isMobile && <td></td>}
                        {/* the following height is randomly set to 10px,
                      it's only useful for its div children to get full height info */}
                        <td rowSpan="2" style={{ height: "10px" }}>
                          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-around" }} >
                            <button
                              className={styles.removeLiquidityButton}
                              style={{ background: "transparent", border: "1px solid green" }}
                              type="button"
                              onClick={() => {
                                setAddComponentPairs(record.token0, record.token1);
                              }}
                            >
                              Add
                            </button>

                            <button
                              className={styles.removeLiquidityButton}
                              style={{ background: "transparent", border: "1px solid green" }}
                              type="button"
                              onClick={() => {
                                setIsModalVisible(true);
                                setRemoveLiquidityPosition(record);
                                console.log("remove record", record);
                              }}
                            >
                              Remove
                            </button>

                          </div>
                        </td>
                      </tr>

                      <tr className={styles.whiteTextExpandableRow}>
                        <td>
                          <p>{data?.token0Amount || "loading..."}</p>
                          <p>{data?.token1Amount || "loading..."}</p>
                        </td>
                        {!isMobile && 
                          <td>
                            <p>{data?.share || "loading..."}</p>
                          </td>}
                        {!isMobile && <td></td>}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )
            }}
            footer={() => (
              <>
                {userLPData.length < userLPData.length && (
                  <div className={styles.tableSeeMoreWrapper}>
                    <a
                      className={styles.tableSeeMore}
                      onClick={() => {
                        getAllUserLiquidityPositions()
                      }}
                    >
                      {loading ? <><Icon type="loading" /> Loading... </> : " See More..."}
                    </a>
                  </div>
                )}
              </>
            )}
          />
          {/* <Pagination
              current={page}
              defaultPageSize={pageEntryCount}
              total={userLiquidityPositions.length}
              onChange={(newPage) => setPage(newPage)}
            /> */}
          <AcyRemoveLiquidityModal
            removeLiquidityPosition={removeLiquidityPosition}
            isModalVisible={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default connect(({ liquidity }) => ({
  liquidity
}))(AcyLiquidityPositions);