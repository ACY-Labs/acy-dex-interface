/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { connect } from 'umi';
import { useWeb3React } from '@web3-react/core';
import { Table, Pagination, Input, Button } from 'antd';
import {
  getUserTokenBalanceRaw,
  getTokenTotalSupply,
  approveTokenWithSpender,
} from '@/acy-dex-swap/utils/index';

import { Icon } from "antd";
import supportedTokens from '@/constants/TokenList';
import { Fetcher, Percent, Token, TokenAmount, Pair } from '@acyswap/sdk';
import AcyRemoveLiquidityModal from '@/components/AcyRemoveLiquidityModal';
import { isMobile } from 'react-device-detect';
import styles from './styles.less';

function getLogoURIWithSymbol(symbol) {
  for (let j = 0; j < supportedTokens.length; j++) {
    if (symbol === supportedTokens[j].symbol) {
      return supportedTokens[j].logoURI;
    }
  }
  return 'https://storageapi.fleek.co/chwizdo-team-bucket/token image/ethereum-eth-logo.svg';
}

const AcyLiquidityPositions = (props) => {
  const [userLiquidityPositions, setUserLiquidityPositions] = useState([]); // list of pools that user has share
  const { account, chainId, library, activate } = useWeb3React();

  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [removeLiquidityPosition, setRemoveLiquidityPosition] = useState(null);
  const [validPoolPairs, setValidPoolPairs] = useState([]); // fetch a list of valid pool from backend
  const [readListPointer, setReadListPointer] = useState(0);  // last processed read position of "validPoolPairs"
  const displayCountIncrement = 5;
  const [selectedRow, setSelectedRow] = useState(null);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters
    }) => (
      <div style={{ padding: 8, backgroundColor: "grey", borderRadius: "3px" }}>
        <Input
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys, confirm, dataIndex)
          }
          style={{ width: 188, marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon="search"
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90, backgroundColor: "black" }}
        >
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered) => (
      <Icon type="search" style={{ backgroundColor: "transparent", color: filtered ? "orange" : "white" }} />
    ),
    onFilter: (value, record) => {
      console.log("onFilter");
      return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
    },
  });
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
  };
  const handleReset = (clearFilters) => {
    clearFilters();
  };

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
      title: 'Pool',
      dataIndex: 'pool',
      // key can be omitted if dataIndex is given (specified in docs)
      // duplicate column keys will cause search filter problems.
      className: 'centerAlignTableHeader',
      // sort
      // sorter: (a, b) => a.pool.localeCompare(b.pool),
      // search
      ...getColumnSearchProps("pool"),
      //
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
                setSelectedRow(index);
              }} >
                {record.pool}
              </p>
              <a target="_blank" href={`https://rinkeby.etherscan.io/address/${record.poolAddress}`} >
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
      title: 'My Liquidity',
      dataIndex: 'token0Amount',
      key: 'token0Amount',
      className: 'centerAlignTableHeader',
      render: (text, record, index) => (
        <div>
          <p>{record.token0Amount}</p>
          <p>{record.token1Amount}</p>
        </div>
      ),
      visible: !isMobile,
    },
    {
      title: 'Pool Share',
      dataIndex: 'share',
      className: 'centerAlignTableHeader',
      key: 'share',
      render: (text, record, index) => <div>{record.share}</div>,
      visible: true,
    },
    {
      title: 'Reserve',
      key: 'token0Reserve',
      dataIndex: 'token0Reserve',
      className: 'centerAlignTableHeader',
      render: (text, record, index) => (
        <div>
          <p>{record.token0Reserve}</p>
          <p>{record.token1Reserve}</p>
        </div>
      ),
      visible: !isMobile,
    },
    {
      title: 'Operation',
      key: 'poolAddress',
      className: 'centerAlignTableHeader',
      render: (text, record, index) => (
        <div>
          <button
            className={styles.removeLiquidityButton}
            type="button"
            onClick={() => {
              setIsModalVisible(true);
              setRemoveLiquidityPosition(record);
            }}
          >
            Remove
          </button>
        </div>
      ),
      visible: true,
    },
    // { title: "Expand", key: "expand",  visible: true},
  ]);

  // fetch lists of valid pool
  function getValidPoolList() {
    console.log("getting list on chain ", chainId);
    axios.get(
      // fetch valid pool list from remote
      `https://api.acy.finance/api/pool?chainId=${chainId}`
      // `http://localhost:3001/api/pool?chainId=${chainId}`
    ).then(res => {
      const tokens = supportedTokens;

      // construct pool list locally
      const array = res.data;
      const validPairs = [];
      for (let pairIdx of array) {
        const token0Idx = pairIdx["token0Idx"];
        const token1Idx = pairIdx["token1Idx"];
        validPairs.push([token0Idx, token1Idx]);
      }

      setValidPoolPairs(validPairs);
      console.log(validPairs);

    }).catch(e => console.log("error: ", e));
  }
  // fetch user shares in above pools
  async function getUserPoolShare() {
    const tokens = supportedTokens.filter(token => token.symbol !== "ETH");

    // const checkLiquidityPositionTasks = [];
    const userNonZeroLiquidityPositions = [];
    let readIdx = readListPointer;
    let newPoolCount = 0;
    while (readIdx < validPoolPairs.length) {

      const [token0Idx, token1Idx] = validPoolPairs[readIdx];
      readIdx++;

      const { address: token0Address, symbol: token0Symbol, decimals: token0Decimal } = tokens[token0Idx];
      const { address: token1Address, symbol: token1Symbol, decimals: token1Decimal } = tokens[token1Idx];
      const token0 = new Token(chainId, token0Address, token0Decimal, token0Symbol);
      const token1 = new Token(chainId, token1Address, token1Decimal, token1Symbol);

      // almost impossible: quit if the two tokens are equivalent, i.e. have the same chainId and address
      if (token0.equals(token1)) continue;

      // queue get pair task
      const pair = await Fetcher.fetchPairData(token0, token1, library);
      console.log("fetched pair: ", pair);

      // check if user has share in this pool
      let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);
      if (userPoolBalance.isZero()) {
        console.log("zero balance, discard");
        continue;
      }

      console.log(">> added pair");

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

      userNonZeroLiquidityPositions.push({
        token0: pair.token0,
        token1: pair.token1,
        token0LogoURI: getLogoURIWithSymbol(pair.token0.symbol),
        token1LogoURI: getLogoURIWithSymbol(pair.token1.symbol),
        token0Symbol: pair.token0.symbol,
        token1Symbol: pair.token1.symbol,
        pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
        poolAddress: `${pair.liquidityToken.address}`,
        token0Amount: `${token0Deposited.toSignificant(4)} ${pair.token0.symbol}`,
        token1Amount: `${token1Deposited.toSignificant(4)} ${pair.token1.symbol}`,
        token0Reserve: `${pair.reserve0.toExact(2)} ${pair.token0.symbol}`,
        token1Reserve: `${pair.reserve1.toExact(2)} ${pair.token1.symbol}`,
        share: `${poolTokenPercentage}%`,
      });

      newPoolCount++;
      console.log(`validPoolPairs.length: ${validPoolPairs.length}. break the loop? ${newPoolCount} <=> ${displayCountIncrement}`);
      if (newPoolCount == displayCountIncrement)
        break;
    }

    // write readpoolpointer to state
    setReadListPointer(readIdx);

    // const validPairs = await Promise.allSettled(checkLiquidityPositionTasks);

    // console.log(validPairs)

    // // now we process the pairs
    // // eslint-disable-next-line no-restricted-syntax
    // const userNonZeroLiquidityPositions = [];
    // for (let pair of validPairs) {
    //   pair = pair.value;

    //   let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);
    //   if (userPoolBalance.isZero()) continue;

    //   userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

    //   const totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);

    //   const token0Deposited = pair.getLiquidityValue(
    //     pair.token0,
    //     totalSupply,
    //     userPoolBalance,
    //     false
    //   );
    //   const token1Deposited = pair.getLiquidityValue(
    //     pair.token1,
    //     totalSupply,
    //     userPoolBalance,
    //     false
    //   );

    //   const poolTokenPercentage = new Percent(userPoolBalance.raw, totalSupply.raw).toFixed(4);

    //   userNonZeroLiquidityPositions.push({
    //     token0: pair.token0,
    //     token1: pair.token1,
    //     token0LogoURI: getLogoURIWithSymbol(pair.token0.symbol),
    //     token1LogoURI: getLogoURIWithSymbol(pair.token1.symbol),
    //     token0Symbol: pair.token0.symbol,
    //     token1Symbol: pair.token1.symbol,
    //     pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
    //     poolAddress: `${pair.liquidityToken.address}`,
    //     token0Amount: `${token0Deposited.toSignificant(4)} ${pair.token0.symbol}`,
    //     token1Amount: `${token1Deposited.toSignificant(4)} ${pair.token1.symbol}`,
    //     token0Reserve: `${pair.reserve0.toExact(2)} ${pair.token0.symbol}`,
    //     token1Reserve: `${pair.reserve1.toExact(2)} ${pair.token1.symbol}`,
    //     share: `${poolTokenPercentage}%`,
    //   });
    // }
    // console.log("test length2: ", userNonZeroLiquidityPositions.length);
    // console.log("nonZeroPositions: ", userNonZeroLiquidityPositions);

    return userNonZeroLiquidityPositions;

  }

  async function getAllUserLiquidityPositions() {
    if (!chainId || !library || !account || validPoolPairs.length === 0) return;
    setLoading(true);
    console.log("getting user liquidity")
    const userPoolShare = await getUserPoolShare();
    console.log(userPoolShare);
    setUserLiquidityPositions([...userLiquidityPositions, ...userPoolShare]);
    setLoading(false);
  }

  // auto scroll to newly loaded data
  useEffect(() => {
    if (userLiquidityPositions.length > 0) {
      document.querySelector(`#liquidityPositionTable > div > div >div.ant-table-body > table > tbody > tr:last-child`).scrollIntoView({ behavior: "smooth" });
      console.log(`scroll last row of table into view`);
    }
  }, [userLiquidityPositions]);

  useEffect(() => getValidPoolList(), []);

  useEffect(
    () => { getAllUserLiquidityPositions() },
    [chainId, library, account, validPoolPairs]
  );

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

  return (
    <div>
      {!(userLiquidityPositions.length) && loading ? (
        <h2 style={{ textAlign: "center", color: "white" }}> <Icon type="loading" /> Loading...</h2>
      ) : (
        <>
          <Table
            id="liquidityPositionTable"
            style={{ textAlign: 'center' }}
            rowClassName={(record, index) => index === selectedRow ? styles.rowHighlighted : styles.rowNormal}
            dataSource={userLiquidityPositions}
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
            // expandRowByClick
            // expandIconAsCell={false}
            // expandIconColumnIndex={6}
            // expandIcon={(props) => {
            //   if (props.expanded) {
            //     return <a style={{ color: 'white' }} onClick={e => {
            //       props.onExpand(props.record, e);
            //     }}><Icon type="down" /></a>
            //   } else {
            //     return <a style={{ color: 'white' }} onClick={e => {
            //       props.onExpand(props.record, e);
            //     }}><Icon type="right" /></a>
            //   }
            // }}
            // expandedRowRender={(record) => <p style={{ margin: 0 }}>Addr: {record.poolAddress}</p>}
            footer={() => (
              <>
                {userLiquidityPositions.length < validPoolPairs.length && (
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