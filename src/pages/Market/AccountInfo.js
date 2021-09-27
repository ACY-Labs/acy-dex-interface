import React, { useEffect, useState } from 'react';
import { Breadcrumb, Button, Table, Icon, Dropdown, Menu } from 'antd';
import { Link, useHistory, useParams } from 'react-router-dom';
import styles from './styles.less';
import { AcyIcon, AcyTokenIcon, AcyPeriodTime, AcyAccountChart } from '@/components/Acy';
import { abbrNumber, abbrHash, isDesktop, sortTable } from './Util';
import { MarketSearchBar, TransactionTable } from './UtilComponent';
import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';
import FarmsTable from '@/pages/Farms/FarmsTable';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { getAllPools } from '@/acy-dex-swap/core/farms';

let samplePositionData = [
  {
    token0: 'ETH',
    token1: 'USDC',
    totalLiquidity: 56666666666,
    reserve0: 9999999999,
    reserve1: 8888888888,
    totalFees: 91111111111,
    fees0: 2222222222,
    fees1: 44444444444,
  },
  {
    token0: 'DAI',
    token1: 'AAVE',
    totalLiquidity: 66666666666,
    reserve0: 9999999999,
    reserve1: 8888888888,
    totalFees: 11111111111,
    fees0: 2222222222,
    fees1: 44444444444,
  },
];

function PositionTable({ data }) {
  const [displayNumber, setDisplayNumber] = useState(10);
  const [isAscending, setIsAscending] = useState(false);
  const [currentKey, setCurrentKey] = useState('');

  let positionColumn = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      visible: true,
      render: (text, entry) => {
        return (
          <div className={styles.tableDataFirstColumn} style={{ display: 'flex' }}>
            <div style={{ display: 'flex' }}>
              <AcyTokenIcon symbol={entry.token0} />
              <AcyTokenIcon symbol={entry.token1} />
            </div>
            <div style={{ width: 20 }} />
            <div style={{ fontWeight: 600 }}>
              <div>{`${entry.token0} / ${entry.token1}`}</div>
              <div style={{ height: 5 }} />
              <div style={{ display: 'flex' }}>
                <Button className={styles.posTableInnerButton}>Add</Button>
                <div style={{ width: 5 }} />
                <Button className={styles.posTableInnerButton}>Remove</Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <div
          className={styles.tableHeader}
          onClick={() => {
            setCurrentKey('totalLiquidity');
            setIsAscending(!isAscending);
          }}
        >
          Liquidity
          {currentKey == 'totalLiquidity' && (
            <Icon
              type={!isAscending ? 'arrow-up' : 'arrow-down'}
              style={{ fontSize: '14px', marginLeft: '4px' }}
            />
          )}
        </div>
      ),
      dataIndex: 'totalLiquidity',
      key: 'totalLiquidity',
      visible: true,
      render: (text, entry) => {
        return (
          <div className={styles.tableData}>
            <div style={{ fontWeight: 'bold' }}>{`$ ${abbrNumber(entry.totalLiquidity)}`}</div>
            <div>
              <div style={{ fontSize: 12 }}>{`${abbrNumber(entry.reserve0)} ${entry.token0}`}</div>
              <div style={{ fontSize: 12 }}>{`${abbrNumber(entry.reserve1)} ${entry.token1}`}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: (
        <div
          className={styles.tableHeader}
          onClick={() => {
            setCurrentKey('totalFees');
            setIsAscending(!isAscending);
          }}
        >
          Total Fees Earned
          {currentKey == 'totalFees' && (
            <Icon
              type={!isAscending ? 'arrow-up' : 'arrow-down'}
              style={{ fontSize: '14px', marginLeft: '4px' }}
            />
          )}
        </div>
      ),
      dataIndex: 'fees',
      key: 'fees',
      visible: isDesktop(),
      render: (text, entry) => {
        return (
          <div className={styles.tableData}>
            <div style={{ fontWeight: 'bold' }}>{`$ ${abbrNumber(entry.totalFees)}`}</div>
            <div>
              <div style={{ fontSize: 12 }}>{`${abbrNumber(entry.fees0)} ${entry.token0}`}</div>
              <div style={{ fontSize: 12 }}>{`${abbrNumber(entry.fees1)} ${entry.token1}`}</div>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <Table
      dataSource={sortTable(data, 'totalLiquidity', isAscending).slice(0, displayNumber + 1)}
      columns={positionColumn.filter(item => item.visible)}
      pagination={false}
      footer={() => (
        <div className={styles.tableSeeMoreWrapper}>
          {data.slice(0, displayNumber + 1).length > displayNumber && (
            <a
              className={styles.tableSeeMore}
              onClick={() => {
                setDisplayNumber(displayNumber + 5);
              }}
            >
              See More...
            </a>
          )}
        </div>
      )}
    />
  );
}

function PositionDropdown({ positions, onHandleMenuClick }) {
  /*
    pair format:
    {
        token0: "SYMBOL",
        token1: "SYMBOL"
    }
    */

  const [currentPair, setCurrentPair] = useState({
    token0: '',
    token1: '',
  });

  const [dropdownVisible, setDropdownVisible] = useState(false);

  let menu = (
    <Menu
      onClick={e => {
        const selected = JSON.parse(e.key);
        setCurrentPair(selected);
      }}
      style={{
        background: '#2e3032',
        borderRadius: 10,
      }}
    >
      <Menu.Item
        key={JSON.stringify({
          token0: '',
          token1: '',
        })}
        className={styles.accountDropdownItem}
        style={{ background: '#2e3032' }}
        onClick={() => {
          setDropdownVisible(false);
        }}
      >
        <div style={{ marginTop: 6, marginBottom: 6 }}>All positions</div>
      </Menu.Item>

      {positions.map(item => (
        <Menu.Item
          className={styles.accountDropdownItem}
          onClick={() => {
            setDropdownVisible(false);
          }}
          style={{ background: '#2e3032' }}
          key={JSON.stringify({
            token0: item.token0,
            token1: item.token1,
          })}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 6, marginBottom: 6 }}>
            <AcyTokenIcon symbol={item.token0} />
            <AcyTokenIcon symbol={item.token1} />
            <div style={{ width: 10 }} />
            {`${item.token0} / ${item.token1} position`}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={['click']}
      onVisibleChange={visible => {
        setDropdownVisible(visible);
      }}
    >
      <Button
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#2e3032',
          paddingTop: 20,
          paddingBottom: 20,
          border: 'solid 1px transparent',
          borderRadius: 10,
          color: dropdownVisible ? '#e29227' : '#b5b5b6',
        }}
        trigger={['click']}
      >
        {currentPair.token0.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AcyTokenIcon symbol={currentPair.token0} />
            <AcyTokenIcon symbol={currentPair.token1} /> <div style={{ width: 10 }} />
            {`${currentPair.token0} / ${currentPair.token1}`}
          </div>
        ) : (
          'All positions'
        )}{' '}
        <Icon type={dropdownVisible ? 'arrow-up' : 'arrow-down'} style={{ fontSize: 12 }} />
      </Button>
    </Dropdown>
  );
}

function AccountInfo(props) {
  const INITIAL_ROW_NUMBER = 5
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [tableRow, setTableRow] = useState([]);
  const [rowNumber, setRowNumber] = useState(INITIAL_ROW_NUMBER);
  const [walletConnected, setWalletConnected] = useState(false);
  const { account, chainId, library, activate } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 80001],
  });
  const { address } = useParams()

  // method to hide/unhidden table row.
  const onRowClick = index =>
    setTableRow(prevState => {
      const prevTableRow = [...prevState];
      prevTableRow[index].hidden = !prevTableRow[index].hidden;
      return prevTableRow;
    });

  // method to prompt metamask extension for user to connect their wallet.
  const connectWallet = () => activate(injected)

  useEffect(
    () => {
      // automatically connect to wallet at the start of the application.
      connectWallet();

      const getPools = async (library, account) => {
        // get all pools from the farm contract.
        // todo: currently account refers to the current user viewing this webpage,
        // todo: needs to be change to the user in this webpage.
        const pools = (await getAllPools(library, account)).filter((pool) => pool.hasUserPosition);
        const newFarmsContents = [];

        // format pools data to the required format that the table can read.
        pools.forEach(pool => {
          const newFarmsContent = {
            lpTokens: pool.lpTokenAddress,
            token1: pool.token0Symbol,
            token1Logo: null,
            token2: pool.token1Symbol,
            token2Logo: null,
            pendingReward: pool.rewardTokensSymbols.map((token, index) => ({
              token,
              amount: pool.rewardTokensAmount[index],
            })),
            totalApr: 89.02,
            tvl: 144542966,
            hasUserPosition: pool.hasUserPosition,
            hidden: true,
          };
          newFarmsContents.push(newFarmsContent);
        });

        setTableRow(newFarmsContents);
      };

      // account will be returned if wallet is connected.
      // so if account is present, retrieve the farms contract.
      if (account) {
        setWalletConnected(true);
        getPools(library, account);
      } else {
        setWalletConnected(false);
      }
    },
    [account]
  );

  return (
    <div className={styles.marketRoot}>
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        // refreshWatchlist={refreshWatchlist}
      />

      {/* breadcrumb */}
      <div className={styles.infoHeader}>
        <Breadcrumb
          separator={<span style={{ color: '#b5b5b6' }}>&gt;</span>}
          style={{ marginBottom: '20px', color: '#b5b5b6' }}
        >
          <Breadcrumb.Item>
            <Link style={{ color: '#b5b5b6' }} to="/market">
              Overview
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link style={{ color: '#b5b5b6' }} to="/market/accounts">
              Accounts
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item style={{ fontWeight: 'bold' }}>0x89750238520672062</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* name, hyperlink, watchlist */}
      <div
        className={styles.accountPageRow}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div>
          <div style={{ fontSize: '26px', fontWeight: 'bold' }}>
            {abbrHash('0x89750238520672062')}
          </div>
          <a href="" style={{ color: '#e29227', fontWeight: 600 }}>
            View on etherscan
          </a>
        </div>
        <AcyIcon
          name={isWatchlist ? 'star_active' : 'star'}
          style={{ marginLeft: '10px' }}
          width={16}
          onClick={() => setIsWatchlist(!isWatchlist)}
        />
      </div>

      {/* dropdown */}
      <div className={styles.accountPageRow}>
        <PositionDropdown positions={[...new Set(samplePositionData)]} />
      </div>

      {/* liquidity and fees earned */}
      <div className={styles.accountPageRow}>
        <div style={{ display: 'flex' }} className={styles.walletStatCard}>
          <div className={styles.walletStatEntry}>
            <div className={styles.walletStatIndicator}>Liquidity (including fees)</div>
            <div className={styles.walletStatValue}>$999.99m</div>
          </div>
          <div style={{ width: 20 }} />
          <div className={styles.walletStatEntry}>
            <div className={styles.walletStatIndicator}>Fees earned (cumulative)</div>
            <div className={styles.walletStatValue} style={{ color: 'greenyellow' }}>
              $999.99m
            </div>
          </div>
        </div>
      </div>

      {/* graphs */}
      <div className={styles.accountPageRow}>
        <div className={styles.accountGraphCard}>
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <AcyPeriodTime onhandPeriodTimeChoose={() => {}} times={['Liquidity', 'Fees']} />
            <AcyPeriodTime onhandPeriodTimeChoose={() => {}} times={['1W', '1M', 'All']} />
          </div>
          <div style={{height:"50vh"}}>
            <AcyAccountChart lineColor="#1e5d91"/>
          </div>


        </div>
      </div>

      {/* positions table */}
      <div className={styles.accountPageRow}>
        <h2>Positions</h2>
        <PositionTable data={samplePositionData} />
      </div>

      {/* Farms */}
      <div className={styles.accountPageRow}>
        <h2>Farms</h2>
        <FarmsTable
          tableRow={tableRow}
          onRowClick={onRowClick}
          tableTitle="User Farms"
          tableSubtitle="Stake your LP tokens and earn token rewards"
          rowNumber={rowNumber}
          setRowNumber={setRowNumber}
          hideDao
          selectedTable={0}
          tokenFilter={{ liquidityToken: true, btcEthToken: true }}
          setTokenFilter={() => {}}
          walletConnected={walletConnected}
          connectWallet={connectWallet}
          account={account}
          library={library}
          chainId={chainId}
        />
      </div>

      {/* transaction table */}
      <div className={styles.accountPageRow}>
        <h2>Transactions</h2>
        <TransactionTable dataSourceTransaction={dataSourceTransaction} />
      </div>

      {/* wallet stats */}
      <div className={styles.accountPageRow}>
        <h2>Wallet Stats</h2>
        <div style={{ display: 'flex' }} className={styles.walletStatCard}>
          <div className={styles.walletStatEntry}>
            <div className={styles.walletStatValue}>$999.99m</div>
            <div className={styles.walletStatIndicator}>Total Value Swapped</div>
          </div>
          <div style={{ width: 20 }} />
          <div className={styles.walletStatEntry}>
            <div className={styles.walletStatValue}>$999.99m</div>
            <div className={styles.walletStatIndicator}>Total Fees Paid</div>
          </div>
          <div style={{ width: 20 }} />
          <div className={styles.walletStatEntry}>
            <div className={styles.walletStatValue}>99.99k</div>
            <div className={styles.walletStatIndicator}>Total Transactions</div>
          </div>
        </div>
      </div>

      <div style={{ height: 20 }} />
    </div>
  );
}

export default AccountInfo;
