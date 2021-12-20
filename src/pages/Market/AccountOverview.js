import React, { useState, useEffect, useCallback } from 'react';
import { AcyTokenIcon } from '@/components/Acy';
import { MarketSearchBar } from './UtilComponent.js';
import { Input, Button, Divider, Icon, Table } from 'antd';
import styles from './styles.less';
import { Link, useHistory } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import className from 'classnames';
import {
  abbrHash,
  abbrNumber,
  isDesktop,
  openInNewTab,
  sortTable,
  TransactionType,
} from './Util.js';
import {
  dataSourceCoin,
  dataSourcePool,
  dataSourceTransaction,
  graphSampleData,
} from './SampleData.js';
import {
  fetchTopLP,
  fetchGeneralPoolInfoDay,
  fetchTopExchangeVolumes,
  marketClient,
  fetchGlobalTransaction,
} from './Data/index.js';
import { WatchlistManager } from './WatchlistManager.js';
import { TransactionTable } from './UtilComponent.js';

const watchlistManager = new WatchlistManager('account');

let sampleAddress = [
  '0x1451351351351351313513',
  '0x9349750829429595959595',
  '0x9351305135013537505552',
];

let accountsList = [
  {
    account: '0x663a5c229c09b049e36dcc11a9b0d4a8eb9db214',
    token1: 'ETH',
    token2: 'USDC',
    value: 357235035259,
  },
  {
    account: '0x752056730636362626',
    token1: 'ETH',
    token2: 'USDC',
    value: 357235035259,
  },
  {
    account: '0x752056730636362626',
    token1: 'ETH',
    token2: 'USDC',
    value: 357235035259,
  },
  {
    account: '0x752056730636362626',
    token1: 'ETH',
    token2: 'USDC',
    value: 357235035259,
  },
  {
    account: '0x752056730636362626',
    token1: 'ETH',
    token2: 'USDC',
    value: 357235035259,
  },
];

function SavedAccounts({ accounts, onRemoveItem }) {
  const [accountsData, setAccountsData] = useState(accounts);

  useEffect(
    () => {
      setAccountsData(accounts);
    },
    [accounts]
  );

  return (
    <div className={styles.savedAccountCard}>
      <h3>Saved Accounts</h3>
      <Divider style={{ background: '#2e3032', marginTop: 0, marginBottom: 0 }} />
      {accountsData.length > 0 ? (
        accountsData.map(item => (
          <div
            style={{
              marginTop: 10,
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Link to={`/market/accounts/${item}`} style={{ fontWeight: 600 }}>
              {item}
            </Link>
            <Icon
              type="close"
              onClick={() => {
                let newAccount = accounts.filter(entry => entry != item);
                setAccountsData(newAccount);
                watchlistManager.saveData(newAccount);
                onRemoveItem(item);
              }}
            />
          </div>
        ))
      ) : (
        <span>No saved accounts</span>
      )}
    </div>
  );
}

function AccountsTable(props) {
  const [accountSortAscending, setAccountSortAscending] = useState(true);
  const [accountDisplayNumber, setAccountDisplayNumber] = useState(9);
  const [currentKey, setCurrentKey] = useState('value');
  const [isHover, setIsHover] = useState(false);
  const navHistory = useHistory();

  function columnsAccounts(isAscending, onSortChange) {
    return [
      {
        title: <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>#</div>,
        key: 'index',
        width: '4em',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        visible: isDesktop(),
      },
      {
        title: <div className={styles.tableHeaderFirst}>Account</div>,
        dataIndex: 'account',
        key: 'account',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableDataFirstColumn}>
              <Link to={`/market/accounts/${entry.account}`}>{text}</Link>
            </div>
          );
        },
        visible: true,
      },
      {
        title: <div className={styles.tableHeader}>Pair</div>,
        dataIndex: 'pair',
        key: 'pair',
        render: (text, entry) => {
          return (
            <div
              className={styles.tableData}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <AcyTokenIcon symbol={entry.token1} />
              <AcyTokenIcon symbol={entry.token2} />
              <div style={{ width: 3 }} />
              <Link to={`/market/info/pool/${entry.pairAddress}`}>
                {entry.token1}
                {' / '}
                {entry.token2}
              </Link>
            </div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('value');
              onSortChange();
            }}
          >
            Value
            {currentKey == 'value' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'value',
        key: 'value',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
        },
        visible: isDesktop(),
      },
    ];
  }

  return (
    <Table
      dataSource={sortTable(props.dataSourceAccounts, currentKey, accountSortAscending).slice(
        0,
        accountDisplayNumber + 1
      )}
      columns={columnsAccounts(accountSortAscending, () => {
        setAccountSortAscending(!accountSortAscending);
      }).filter(item => item.visible == true)}
      pagination={false}
      style={{
        marginBottom: '20px',
        cursor: isHover ? 'pointer' : 'default',
      }}
      footer={() => (
        <div className={styles.tableSeeMoreWrapper}>
          {props.dataSourceAccounts.slice(0, accountDisplayNumber + 1).length >
            accountDisplayNumber && (
            <a
              className={styles.tableSeeMore}
              onClick={() => {
                setAccountDisplayNumber(accountDisplayNumber + 5);
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

function VolumesTable(props) {
  const [accountSortAscending, setAccountSortAscending] = useState(true);
  const [accountDisplayNumber, setAccountDisplayNumber] = useState(9);
  const [currentKey, setCurrentKey] = useState('value');
  const [isHover, setIsHover] = useState(false);
  const navHistory = useHistory();

  function columnsAccounts(isAscending, onSortChange) {
    return [
      {
        title: <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>#</div>,
        key: 'index',
        width: '4em',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        visible: isDesktop(),
      },
      {
        title: <div className={styles.tableHeaderFirst}>Account</div>,
        dataIndex: 'account',
        key: 'account',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableDataFirstColumn}>
              <Link to={`/market/accounts/${entry.account}`}>{text}</Link>
            </div>
          );
        },
        visible: true,
      },
      {
        title: <div className={styles.tableHeader}>Tokens</div>,
        dataIndex: 'tokens',
        key: 'tokens',
        render: (text, entry) => {
          return (
            <div
              className={styles.tableData}
              style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}
            >
              <AcyTokenIcon symbol={entry.token1} />
              <div style={{ width: 3 }} />
              {entry.token1}
              <div style={{ width: 3 }} /> <Icon type="arrow-right" /> <div style={{ width: 3 }} />
              <AcyTokenIcon symbol={entry.token2} />
              <span style={{ width: 3 }} />
              {entry.token2}
            </div>
          );
        },
        visible: true,
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('value');
              onSortChange();
            }}
          >
            Value
            {currentKey == 'value' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'value',
        key: 'value',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
        },
        visible: isDesktop(),
      },
    ];
  }

  return (
    <Table
      dataSource={sortTable(props.dataSourceAccounts, currentKey, accountSortAscending).slice(
        0,
        accountDisplayNumber + 1
      )}
      columns={columnsAccounts(accountSortAscending, () => {
        setAccountSortAscending(!accountSortAscending);
      }).filter(item => item.visible == true)}
      pagination={false}
      style={{
        marginBottom: '20px',
        cursor: isHover ? 'pointer' : 'default',
      }}
      footer={() => (
        <div className={styles.tableSeeMoreWrapper}>
          {props.dataSourceAccounts.slice(0, accountDisplayNumber + 1).length >
            accountDisplayNumber && (
            <a
              className={styles.tableSeeMore}
              onClick={() => {
                setAccountDisplayNumber(accountDisplayNumber + 5);
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

function AccountOverview(props) {
  const [topLP, setTopLP] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [accountInput, setAccountInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [topEV, setTopEV] = useState([]);

  const [transactions, settransactions] = useState([]);
  
  const { account, chainId, library, activate } = useWeb3React();

  useEffect(() => {
    // fetch transaction data
    if(library) {
      fetchGlobalTransaction(library).then(globalTransactions => {
        console.log('globaltransaction', globalTransactions);
        if(globalTransactions) settransactions(globalTransactions);
      });
    }
  }, [library]);
  
  useEffect(() => {
    // fetch the watchlist
    setWatchlist(watchlistManager.getData());

    // fetch exchange volumes
    // TODO: sort data with total transaction value for the coins
    // TODO: fins a way to calculater the volume
    fetchTopExchangeVolumes(marketClient)
      .then(data => {
        let formatted = data.map(item => ({
          account: item.sender,
          token1: item.pair.token0.symbol,
          token2: item.pair.token1.symbol,
          value: parseFloat(item.amountUSD),
        }));

        setTopEV(formatted);
      })
      .catch(err => console.log(err));

    // fetch pool and its respective liquidity positions
    fetchGeneralPoolInfoDay(marketClient).then(data => {
      let poolAddresses = data.map(item => item.address);
      let infoPromise = [];
      let topLPData = [];
      let length = poolAddresses.length;

      for (let i = 0; i < length; i++) {
        infoPromise.push(
          fetchTopLP(marketClient, poolAddresses[i]).then(posData => {
            let rawArr = posData.liquidityPositions;
            let arrLen = rawArr.length;
            let tempArr = [];

            for (let j = 0; j < arrLen; j++) {
              let tableEntry = {
                account: rawArr[j].user.id,
                token1: data[i].coin1,
                token2: data[i].coin2,
                value:
                  (parseFloat(rawArr[j].liquidityTokenBalance) /
                    parseFloat(rawArr[j].pair.totalSupply)) *
                  parseFloat(rawArr[j].pair.reserveUSD),
                pairAddress: rawArr[j].pair.id,
              };

              // remove duplicate same account by value
              let presentElem = topLPData.filter(item => item.account == tableEntry.account);

              if (presentElem.length == 0) topLPData.push(tableEntry);
              else {
                let isMaxPresentInArray = false;
                for (let k = 0; k < presentElem.length; k++) {
                  if (presentElem[k].value >= tableEntry.value) {
                    isMaxPresentInArray = true;
                    break;
                  }
                }

                if (!isMaxPresentInArray) topLPData.push(tableEntry);
              }
            }
          })
        );
      }

      Promise.all(infoPromise).then(() => {
        setTopLP(topLPData.slice(0, 100));
      });
    });
  }, []);

  const onInput = useCallback(e => {
    setAccountInput(e.target.value);
  });

  const navHistory = useHistory();

  function switchChart(dest) {
    setGraphTabIndex(dest);
  }

  const redirectToInputAddress = () => navHistory.push(`/market/accounts/${accountInput}`);

  return (
    <div className={styles.marketRoot}>
      <MarketSearchBar
        dataSourceCoin={dataSourceCoin}
        dataSourcePool={dataSourcePool}
        // refreshWatchlist={refreshWatchlist}
      />

      <h2>Wallet Analytics</h2>
      <div
        style={{
          display: 'flex',
        }}
      >
        <Input
          placeholder="Search account address..."
          style={{ background: '#2e3032', marginRight: 5, borderRadius: 10 }}
          value={accountInput || ''}
          onChange={onInput}
        />
        <Button
          style={{ background: '#e29227', border: 'transparent', color: 'white', borderRadius: 10 }}
          onClick={() => {
            if (!isNaN(accountInput) && accountInput.length == 42) {
              redirectToInputAddress();
            } else {
              setInputError('Invalid account number!');
            }
          }}
        >
          Load Account Details
        </Button>
      </div>
      <div style={{ color: '#c6224e', marginTop: 5, fontWeight: 600 }}>{inputError}</div>
      <SavedAccounts
        accounts={watchlist}
        onRemoveItem={removedAddress => {
          setWatchlist(watchlist.filter(item => item != removedAddress));
        }}
      />

      <h2>Top Liquidity Positions</h2>
      {topLP.length > 0 ? <AccountsTable dataSourceAccounts={topLP} /> : <Icon type="loading" />}

      <h2>Top Exchange Volume</h2>
      {account && transactions.length <= 0 ? (
        <Icon type="loading" />
      ) : (
        <TransactionTable dataSourceTransaction={transactions} />
      )}
      <div style={{ height: '20px' }} />
    </div>
  );
}

export default AccountOverview;
