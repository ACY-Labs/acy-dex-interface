/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import { Table, Pagination } from 'antd';
import {
  getUserTokenBalanceRaw,
  getTokenTotalSupply,
  approveTokenWithSpender,
} from '@/acy-dex-swap/utils/index';

import supportedTokens from '@/constants/TokenList';
import { Fetcher, Percent, Token, TokenAmount } from '@acyswap/sdk';
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

// // this section should be moved to backend, fetch the updated list of valid pairs, and return slice of it.
// export async function getAllLiquidityPositions(tokens, chainId, library, account, page, pageEntryCount) {
//   // we only want WETH
//   tokens = tokens.filter(token => token.symbol !== 'ETH');

//   const totalTokenCount = tokens.length;
//   const userNonZeroLiquidityPositions = [];

//   if (totalTokenCount === 1) return;

//   const checkLiquidityPositionTasks = [];

//   for (let i = 0; i < totalTokenCount; i++) {
//     for (let j = i + 1; j < totalTokenCount; j++) {
//       const { address: token0Address, symbol: token0Symbol, decimal: token0Decimal } = tokens[i];
//       const { address: token1Address, symbol: token1Symbol, decimal: token1Decimal } = tokens[j];
//       const token0 = new Token(chainId, token0Address, token0Decimal, token0Symbol);
//       const token1 = new Token(chainId, token1Address, token1Decimal, token1Symbol);

//       // quit if the two tokens are equivalent, i.e. have the same chainId and address
//       if (token0.equals(token1)) continue;

//       // queue get pair task
//       const pairTask = Fetcher.fetchPairData(token0, token1, library);
//       checkLiquidityPositionTasks.push(pairTask);
//     }
//   }
//   console.log("test length1: ", checkLiquidityPositionTasks.length);

//   const pairs = await Promise.allSettled(checkLiquidityPositionTasks);

//   // now we process the pairs
//   // eslint-disable-next-line no-restricted-syntax
//   for (let pair of pairs) {
//     if (pair.status === 'rejected') continue;

//     pair = pair.value;

//     let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);

//     if (userPoolBalance.isZero()) continue;

//     userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

//     const totalPoolTokens = await getTokenTotalSupply(pair.liquidityToken, library, account);

//     const token0Deposited = pair.getLiquidityValue(
//       pair.token0,
//       totalPoolTokens,
//       userPoolBalance,
//       false
//     );
//     const token1Deposited = pair.getLiquidityValue(
//       pair.token1,
//       totalPoolTokens,
//       userPoolBalance,
//       false
//     );

//     console.log(pair);

//     const totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);

//     const poolTokenPercentage = new Percent(userPoolBalance.raw, totalSupply.raw).toFixed(4);

//     userNonZeroLiquidityPositions.push({
//       token0: pair.token0,
//       token1: pair.token1,
//       token0LogoURI: getLogoURIWithSymbol(pair.token0.symbol),
//       token1LogoURI: getLogoURIWithSymbol(pair.token1.symbol),
//       token0Symbol: pair.token0.symbol,
//       token1Symbol: pair.token1.symbol,
//       pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
//       poolAddress: `${pair.liquidityToken.address}`,
//       token0Amount: `${token0Deposited.toSignificant(4)} ${pair.token0.symbol}`,
//       token1Amount: `${token1Deposited.toSignificant(4)} ${pair.token1.symbol}`,
//       token0Reserve: `${pair.reserve0.toExact(2)} ${pair.token0.symbol}`,
//       token1Reserve: `${pair.reserve1.toExact(2)} ${pair.token1.symbol}`,
//       share: `${poolTokenPercentage}%`,
//     });
//   }
//   console.log("test length2: ", userNonZeroLiquidityPositions.length);
//   console.log("nonZeroPositions: ", userNonZeroLiquidityPositions);

//   return userNonZeroLiquidityPositions;
// }

// this test version uses data from "./samplePairs/samplePairs.js"
export async function getAllLiquidityPositions(tokens, chainId, library, account, page, pageEntryCount) {
  let pairs = require("../../pages/Liquidity/samplePairs/samplePairs.json");
  const startIdx = (page - 1) * pageEntryCount;
  const endIdx = page * pageEntryCount;

  return pairs.slice(startIdx, endIdx);
}

const AcyLiquidityPositions = () => {
  const [userLiquidityPositions, setUserLiquidityPositions] = useState([]);
  const { account, chainId, library, activate } = useWeb3React();

  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [removeLiquidityPosition, setRemoveLiquidityPosition] = useState(null);
  const [page, setPage] = useState(1);

  const pageEntryCount = 15;
  const totalPairCount = 345;

  const columns = useMemo(() => [
    {
      title: 'Pool',
      dataIndex: 'name',
      key: 'poolAddress',
      className: 'leftAlignTableHeader',
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
              <p className={styles.bigtitle}>{record.pool}</p>
              <p className={styles.value}>
                {`${record.poolAddress.slice(0, 5)}...${record.poolAddress.slice(
                  addressLength - 5,
                  addressLength
                )}`}
              </p>
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
      className: 'leftAlignTableHeader',
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
      className: 'leftAlignTableHeader',
      key: 'share',
      render: (text, record, index) => <div>{record.share}</div>,
      visible: true,
    },
    {
      title: 'Reserve',
      key: 'token0Reserve',
      dataIndex: 'token0Reserve',
      className: 'leftAlignTableHeader',
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
  ]);

  useEffect(
    () => {
      if (!chainId || !library || !account) return;
      async function getAllUserLiquidityPositions() {
        if (account != undefined) {
          setUserLiquidityPositions(
            await getAllLiquidityPositions(supportedTokens, chainId, library, account, page, pageEntryCount)
          );
        }
      }
      setLoading(true);
      getAllUserLiquidityPositions().finally(() => {
        setLoading(false);
      });
    },
    [chainId, library, account, page]
  );

  // useEffect(() => {
  //   approveTokenWithSpender(
  //     '0xf90619d9098a937794ef7cd665b9cc1d7249f9d7',
  //     '0x7b028A293dA85097B98c5c9cbb076Fd58467b3f1',
  //     library,
  //     account
  //   );
  // }, []);

  // useEffect(() => {
  //   const userLiquidityPositionsCopy = [...userLiquidityPositions]
  //   console.log(userLiquidityPositionsCopy)
  //   for (let i = 0; i < userLiquidityPositionsCopy.length; i++) {
  //     for (let j = 0; j < supportedTokens.length; j++) {
  //       if (userLiquidityPositionsCopy[i].token0Symbol === supportedTokens[j].symbol) {
  //         userLiquidityPositionsCopy[i].token0logo = supportedTokens[j].logoURI
  //       }
  //       if (userLiquidityPositionsCopy[i].token1Symbol === supportedTokens[j].symbol) {
  //         userLiquidityPositionsCopy[i].token1logo = supportedTokens[j].logoURI
  //       }
  //     }
  //   }
  //   setUserLiquidityPositions(userLiquidityPositionsCopy)
  // }, [userLiquidityPositions])

  return (
    <div>
      {loading ? (
        <h2>Loading...</h2>
      ) : (
        <>
          <Table
            id="liquidityPositionTable"
            style={{ textAlign: 'left' }}
            dataSource={userLiquidityPositions}
            columns={columns.filter(item => item.visible)}
            pagination={false}
            locale={{
              emptyText: (
                <span>
                  <h2>No positions available. </h2>
                </span>
              ),
            }}
          />
            <Pagination
              current={page}
              defaultPageSize={pageEntryCount}
              total={totalPairCount}
              onChange={(newPage) => setPage(newPage)}
            />
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

export default AcyLiquidityPositions;
