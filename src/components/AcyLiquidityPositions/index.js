/* eslint-disable react/react-in-jsx-scope */
import { useState, useEffect, useMemo } from 'react';
import { useWeb3React } from '@web3-react/core';
import styles from './styles.less';
import { AcyCard } from '@/components/Acy';
import { Table, Empty } from 'antd';
import {
  supportedTokens,
  getUserTokenBalanceRaw,
  getTokenTotalSupply,
} from '@/acy-dex-swap/utils/index';
import { Fetcher, Percent, Token, TokenAmount } from '@uniswap/sdk';
import TokenSelection from '@/pages/Dao/components/TokenSelection';
import AcyRemoveLiquidityModal from '@/components/AcyRemoveLiquidityModal';
import { isMobile } from 'react-device-detect';

export async function getAllLiquidityPositions(tokens, chainId, library, account) {
  // we only want WETH
  tokens = tokens.filter(token => token.symbol !== 'ETH');

  const totalTokenCount = tokens.length;
  const userNonZeroLiquidityPositions = [];

  if (totalTokenCount === 1) return;

  const checkLiquidityPositionTasks = [];

  for (let i = 0; i < totalTokenCount; i++) {
    for (let j = i + 1; j < totalTokenCount; j++) {
      const { address: token0Address, symbol: token0Symbol, decimal: token0Decimal } = tokens[i];
      const { address: token1Address, symbol: token1Symbol, decimal: token1Decimal } = tokens[j];

      const token0 = new Token(chainId, token0Address, token0Decimal, token0Symbol);
      const token1 = new Token(chainId, token1Address, token1Decimal, token1Symbol);

      // quit if the two tokens are equivalent, i.e. have the same chainId and address
      if (token0.equals(token1)) continue;

      // queue get pair task
      const pairTask = Fetcher.fetchPairData(token0, token1, library);
      checkLiquidityPositionTasks.push(pairTask);
    }
  }

  const pairs = await Promise.allSettled(checkLiquidityPositionTasks);

  // now we process the pairs
  for (let pair of pairs) {
    if (pair.status === 'rejected') continue;

    pair = pair.value;

    let userPoolBalance = await getUserTokenBalanceRaw(pair.liquidityToken, account, library);

    if (userPoolBalance.isZero()) continue;

    userPoolBalance = new TokenAmount(pair.liquidityToken, userPoolBalance);

    const totalPoolTokens = await getTokenTotalSupply(pair.liquidityToken, library, account);

    const token0Deposited = pair.getLiquidityValue(
      pair.token0,
      totalPoolTokens,
      userPoolBalance,
      false
    );
    const token1Deposited = pair.getLiquidityValue(
      pair.token1,
      totalPoolTokens,
      userPoolBalance,
      false
    );

    const totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);

    const poolTokenPercentage = new Percent(userPoolBalance.raw, totalSupply.raw).toFixed(4);

    userNonZeroLiquidityPositions.push({
      token0: pair.token0,
      token1: pair.token1,
      pool: `${pair.token0.symbol}/${pair.token1.symbol}`,
      poolAddress: `${pair.liquidityToken.address}`,
      token0Amount: `${token0Deposited.toSignificant(4)} ${pair.token0.symbol}`,
      token1Amount: `${token1Deposited.toSignificant(4)} ${pair.token1.symbol}`,
      token0Reserve: `${pair.reserve0.toExact(2)} ${pair.token0.symbol}`,
      token1Reserve: `${pair.reserve1.toExact(2)} ${pair.token1.symbol}`,
      share: `${poolTokenPercentage}%`,
    });
  }

  return userNonZeroLiquidityPositions;
}

const AcyLiquidityPositions = () => {
  const [userLiquidityPositions, setUserLiquidityPositions] = useState([]);
  const { account, chainId, library, activate } = useWeb3React();

  let [loading, setLoading] = useState(true);
  let [isModalVisible, setIsModalVisible] = useState(false);
  let [removeLiquidityPosition, setRemoveLiquidityPosition] = useState(null);

  const columns = useMemo(() => [
    {
      title: 'Pool',
      dataIndex: 'name',
      key: 'poolAddress',
      className: 'leftAlignTableHeader',
      render: (text, record, index) => {
        let addressLength = record.poolAddress.length;
        return (
          <div className={styles.pool}>
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
      async function getAllUserLiquidityPositions() {
        if (account != undefined) {
          setUserLiquidityPositions(
            await getAllLiquidityPositions(supportedTokens, chainId, library, account)
          );
        }
      }
      setLoading(true);
      getAllUserLiquidityPositions().finally(() => {
        setLoading(false);
      });
    },
    [chainId, library, account]
  );

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
