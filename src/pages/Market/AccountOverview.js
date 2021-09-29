import React, { useState, useEffect } from 'react';
import { AcyTokenIcon } from '@/components/Acy';
import { MarketSearchBar } from './UtilComponent.js';
import { Input, Button, Divider, Icon, Table } from 'antd';
import styles from './styles.less';
import { Link, useHistory } from 'react-router-dom';
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
  marketClient
} from './Data/index.js';
import { WatchlistManager } from './WatchlistManager.js';

const watchlistManager = new WatchlistManager('account')

let sampleAddress = [
  '0x1451351351351351313513',
  '0x9349750829429595959595',
  '0x9351305135013537505552',
];

let accountsList = [
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
  {
    account: '0x752056730636362626',
    token1: 'ETH',
    token2: 'USDC',
    value: 357235035259,
  },
];

function SavedAccounts({ accounts }) {
  return (
    <div className={styles.savedAccountCard}>
      <h3>Saved Accounts</h3>
      <Divider style={{ background: '#2e3032', marginTop: 0, marginBottom: 0 }} />
      {accounts.length > 0 ? (
        accounts.map(item => (
          <div
            style={{
              marginTop: 10,
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: '#e29227', fontWeight: 600 }}>{item}</span>
            <Icon type="close" />
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
  const [accountDisplayNumber, setAccountDisplayNumber] = useState(10);
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);
  const navHistory = useHistory();

  function columnsAccounts(isAscending, onSortChange) {
    return [
      {
        title: <div className={styles.tableHeaderFirst}>Account</div>,
        dataIndex: 'account',
        key: 'account',
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
            <div className={styles.tableData}>
              <AcyTokenIcon symbol={entry.token1} />
              <AcyTokenIcon symbol={entry.token2} />
              <span>
                {entry.token1}{' '}/{' '}{entry.token2}
              </span>
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

  const [topLP, setTopLP] = useState([])

  useEffect(() => {
    // get the top pair list
    fetchGeneralPoolInfoDay(marketClient).then((data) => {
      console.log("ACCOUNT OVERVIEW", data)
    })
  }, [])

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
        />
        <Button
          style={{ background: '#e29227', border: 'transparent', color: 'white', borderRadius: 10 }}
        >
          Load Account Details
        </Button>
      </div>
      <SavedAccounts accounts={sampleAddress} />

      <h2>Top Account</h2>
      <AccountsTable dataSourceAccounts={accountsList} />
    </div>
  );
}

export default AccountOverview;
