import { AcyIcon, AcyTabs, AcyTokenIcon, AcyCardList } from '@/components/Acy';
import className from 'classnames';
import { Divider, Icon, Input, Table, Button, Dropdown } from 'antd';
import {
  DownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { useDetectClickOutside } from 'react-detect-click-outside';
import onlyLastPromise, { DiscardSignal } from 'only-last-promise';
import ReactDOM from 'react-dom';
import { Link, useHistory } from 'react-router-dom';
import styles from './styles.less';
import {
  abbrHash,
  abbrNumber,
  isDesktop,
  openInNewTab,
  sortTable,
  TransactionType,
} from './Util.js';
import { WatchlistManager } from './WatchlistManager.js';
import {
  marketClient,
  fetchTokenSearch,
  fetchPoolSearch,
  fetchTokensFromId,
  fetchPoolsFromId,
  fetchSearchCoinReturns,
  fetchSearchPoolReturns,
} from './Data';

import { SCAN_URL_PREFIX } from "@/constants";
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
          <AcyTokenIcon symbol={entry.logoURL} width={20} />
          <Link
            style={{ color: 'white' }}
            className={styles.coinName}
            to={`/market/info/token/${entry.address}`}
          >
            {entry.short}
          </Link>
          <div style={{ width: 5 }}></div>
          <span className={styles.coinShort}> ({entry.name})</span>
          {/* Watchlist star */}
          {/* <AcyIcon
            name={watchlistManagerToken.getData().includes(entry.address) ? 'star_active' : 'star'}
            width={14}
            style={{ marginLeft: '0.5rem' }}
            onClick={() => {
              this.toggleWatchlist('token', entry.address, entry.short);
            }}
          /> */}
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
          {/* <div
            className={styles.percentBadge}
            style={{ marginLeft: '10px', fontSize: '14px', lineHeight: '15px' }}
          >
            {entry.percent} %
          </div> */}
          {/* Watchlist star */}
          {/* <AcyIcon
            name={
              watchlistManagerPool
                .getData()
                .toString()
                .includes(entry.address)
                ? 'star_active'
                : 'star'
            }
            width={14}
            style={{ marginLeft: '0.5rem' }}
            onClick={() => {
              this.toggleWatchlist('pool', entry.address);
            }}
          /> */}
        </div>
      );
    }

    return (
      <tr className={styles.smallTableRow}>
        <td className={styles.smallTableBody}>{content}</td>
        {/* <td
          className={styles.smallTableBody}
          style={{ display: isDesktop() == true ? 'table-cell' : 'none' }}
        >
          $ {abbrNumber(entry.volume24h)}
        </td>
        <td
          className={styles.smallTableBody}
          style={{ display: isDesktop() == true ? 'table-cell' : 'none' }}
        >
          $ {abbrNumber(entry.tvl)}
        </td>
        <td
          className={styles.smallTableBody}
          style={{ display: isDesktop() == true ? 'table-cell' : 'none' }}
        >
          $ {this.state.mode == 'token' ? abbrNumber(entry.price) : abbrNumber(entry.tvl)}
        </td> */}
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
            {/* <td
              className={styles.smallTableHeader}
              style={{ display: isDesktop() == true ? 'table-cell' : 'none' }}
            >
              Volume 24H
            </td>
            <td
              className={styles.smallTableHeader}
              style={{ display: isDesktop() == true ? 'table-cell' : 'none' }}
            >
              TVL
            </td>
            <td
              className={styles.smallTableHeader}
              style={{ display: isDesktop() == true ? 'table-cell ' : 'none' }}
            >
              Price
            </td> */}
          </tr>

          {this.state.tableData
            .slice(0, this.state.displayNumber)
            .map(item => this.renderBody(item))}

          <tr>
            <a className={styles.smallTableSeeMore} onClick={this.expandSmallTable}>
              See more...
            </a>
          </tr>
        </tbody>
      </table>
    );
  }
}

export function TokenTable(props) {
  const [tokenSortAscending, setTokenSortAscending] = useState(true);
  const [tokenDisplayNumber, setTokenDisplayNumber] = useState(9);
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);
  const navHistory = useHistory();

  function columnsCoin(isAscending, onSortChange) {
    return [
      {
        title: (
          <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>
            #
          </div>
        ),
        key: 'index',
        width: '6rem',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        visible: isDesktop()
      },
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => {
              setCurrentKey('name');
              onSortChange();
            }}
          >
            Name
            {currentKey == 'name' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'name',
        key: 'name',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>
              <AcyTokenIcon symbol={entry.logoURL} />
              <Link
                style={{ color: 'white' }}
                className={styles.coinName}
                to={`/market/info/token/${entry.address}`}
                tokenData={entry}
              >
                {entry.short}
              </Link>
              <span className={styles.coinShort}> ({entry.name})</span>
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
              setCurrentKey('price');
              onSortChange();
            }}
          >
            Price
            {currentKey == 'price' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'price',
        key: 'price',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
        },
        visible: isDesktop(),
      },
      // {
      //   title: (
      //     <div
      //       className={styles.tableHeader}
      //       onClick={() => {
      //         setCurrentKey('priceChange');
      //         onSortChange();
      //       }}
      //     >
      //       Price Change
      //       {currentKey == 'priceChange' && (
      //         <Icon
      //           type={!isAscending ? 'arrow-up' : 'arrow-down'}
      //           style={{ fontSize: '14px', marginLeft: '4px' }}
      //         />
      //       )}
      //     </div>
      //   ),
      //   dataIndex: 'priceChange',
      //   key: 'priceChange',
      //   render: priceChange => {
      //     return (
      //       <div className={styles.tableData}>
      //         <span className={priceChange < 0 ? styles.priceChangeDown : styles.priceChangeUp}>
      //           {Math.abs(priceChange) > 0.01 && Math.abs(priceChange) > 0
      //             ? `${priceChange.toFixed(2)} %`
      //             : priceChange >= 0
      //             ? '<0.01 %'
      //             : '- <0.01%'}
      //         </span>
      //       </div>
      //     );
      //   },
      //   visible: isDesktop(),
      // },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('tvl');
              onSortChange();
            }}
          >
            TVL
            {currentKey == 'tvl' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'tvl',
        key: 'tvl',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
        },
        visible: isDesktop(),
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('volume24h');
              onSortChange();
            }}
          >
            Volume 24H
            {currentKey == 'volume24h' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'volume24h',
        key: 'volume24h',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(text)}</div>;
        },
        visible: true,
      },
    ];
  }

  return (
    <Table
      dataSource={sortTable(props.dataSourceCoin, currentKey, tokenSortAscending).slice(
        0,
        tokenDisplayNumber + 1
      )}
      columns={columnsCoin(tokenSortAscending, () => {
        setTokenSortAscending(!tokenSortAscending);
      }).filter(item => item.visible == true)}
      pagination={false}
      style={{
        marginBottom: '20px',
        cursor: isHover ? 'pointer' : 'default',
      }}
      onRowClick={(record, index, event) => {
        navHistory.push(`/market/info/token/${record.address}`);
      }}
      onRowMouseEnter={() => setIsHover(true)}
      onRowMouseLeave={() => setIsHover(false)}
      footer={() => (
        <div className={styles.tableSeeMoreWrapper}>
          {props.dataSourceCoin.slice(0, tokenDisplayNumber + 1).length > tokenDisplayNumber && (
            <a
              className={styles.tableSeeMore}
              onClick={() => {
                setTokenDisplayNumber(tokenDisplayNumber + 5);
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

export function PoolTable(props) {
  const [poolSortAscending, setPoolSortAscending] = useState(true);
  const [poolDisplayNumber, setPoolDisplayNumber] = useState(9);
  const [currentKey, setCurrentKey] = useState('');
  const [isHover, setIsHover] = useState(false);
  const [, update] = useState(0);

  const navHistory = useHistory();
  useEffect(
    () => {
      update(1);
    },
    [props.poolData]
  );

  function columnsPool(isAscending, onSortChange) {
    return [
      {
        title: (
          <div className={className(styles.tableHeaderFirst, styles.tableIndex)}>
            #
          </div>
        ),
        key: 'index',
        render: (text, record, index) => (
          <div className={className(styles.tableDataFirstColumn, styles.tableIndex)}>
            {index + 1}
          </div>
        ),
        width: '6rem',
        visible: isDesktop()
      },
      {
        title: (
          <div
            className={styles.tableHeaderFirst}
            onClick={() => {
              setCurrentKey('coin1');
              onSortChange();
            }}
          >
            Pool
            {currentKey == 'coin1' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'pool',
        key: 'pool',
        className: 'leftAlignTableHeader',
        render: (text, entry) => {
          return (
            <div className={styles.tableHeader}>
              <AcyTokenIcon symbol={entry.logoURL1} />
              <AcyTokenIcon symbol={entry.logoURL2} />
              <Link
                style={{ color: 'white' }}
                to={`/market/info/pool/${entry.pairAddr}`}
              >
                <span className={styles.coinName}>
                  {entry.coin1}{' '}/{' '}{entry.coin2}
                </span>
              </Link>
              {/* <div
                className={styles.percentBadge}
                style={{ marginLeft: '10px', fontSize: '14px', lineHeight: '15px' }}
              >
                {entry.percent} %
              </div> */}
            </div>
          );
        },
        visible: true,
      },
      {
        title: (<div style={{ marginLeft: "100px" }}></div>),
        visible: isDesktop(),
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('tvl');
              onSortChange();
            }}
          >
            TVL
            {currentKey == 'tvl' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'tvl',
        key: 'tvl',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(entry.tvl)}</div>;
        },
        visible: isDesktop(),
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('volume24h');
              onSortChange();
            }}
          >
            Volume 24H
            {currentKey == 'volume24h' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'volume24h',
        key: 'volume24h',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(entry.volume24h)}</div>;
        },
        visible: true,
      },
      // {
      //   title: (
      //     <div
      //       className={styles.tableHeader}
      //       onClick={() => {
      //         setCurrentKey('volume7d');
      //         onSortChange();
      //       }}
      //     >
      //       Volume 7D
      //       {currentKey == 'volume7d' && (
      //         <Icon
      //           type={!isAscending ? 'arrow-up' : 'arrow-down'}
      //           style={{ fontSize: '14px', marginLeft: '4px' }}
      //         />
      //       )}
      //     </div>
      //   ),
      //   dataIndex: 'volume7d',
      //   key: 'volume7d',
      //   render: (text, entry) => {
      //     return <div className={styles.tableData}>$ {abbrNumber(entry.volume7d)}</div>;
      //   },
      //   visible: isDesktop(),
      // },
    ];
  }

  return (
    <Table
      dataSource={sortTable(props.dataSourcePool, currentKey, poolSortAscending).slice(
        0,
        poolDisplayNumber + 1
      )}
      columns={columnsPool(poolSortAscending, () => {
        setPoolSortAscending(!poolSortAscending);
      }).filter(item => item.visible == true)}
      pagination={false}
      onRowMouseEnter={() => setIsHover(true)}
      onRowMouseLeave={() => setIsHover(false)}
      onRowClick={(record, index, event) => {
        navHistory.push(`/market/info/pool/${record.pairAddr}`);
      }}
      style={{
        marginBottom: '20px',
        cursor: isHover ? 'pointer' : 'default',
      }}
      footer={() => (
        <div className={styles.tableSeeMoreWrapper}>
          {props.dataSourcePool.slice(0, poolDisplayNumber + 1).length > poolDisplayNumber && (
            <a
              className={styles.tableSeeMore}
              onClick={() => {
                setPoolDisplayNumber(poolDisplayNumber + 5);
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

export function TransactionTable(props) {
  const [transactionSortAscending, setTransactionSortAscending] = useState(true);
  const [transactionView, setTransactionView] = useState(TransactionType.ALL);
  const [transactionDisplayNumber, setTransactionDisplayNumber] = useState(9);
  const [currentKey, setCurrentKey] = useState('');

  // header for the transaction table
  function transactionHeader(selectedTransaction, onClickHandler, isAscending, onSortChange) {
    let styleArrangement = {
      All: 'normal',
      Swap: 'normal',
      Add: 'normal',
      Remove: 'normal',
    };

    styleArrangement[selectedTransaction] = 'bold';

    return [
      {
        title: (
          <div className={styles.tableHeaderFirst}>
            <div className={styles.transactionHeader}>
              <a
                className={styles.transactionType}
                style={{ fontWeight: styleArrangement['All'] }}
                onClick={onClickHandler}
                id={TransactionType.ALL}
              >
                All
              </a>
              <a
                className={styles.transactionType}
                style={{ fontWeight: styleArrangement['Swap'] }}
                onClick={onClickHandler}
                id={TransactionType.SWAP}
              >
                Swap
              </a>
              <a
                className={styles.transactionType}
                style={{ fontWeight: styleArrangement['Add'] }}
                onClick={onClickHandler}
                id={TransactionType.ADD}
              >
                Add
              </a>
              <a
                className={styles.transactionType}
                style={{ fontWeight: styleArrangement['Remove'] }}
                onClick={onClickHandler}
                id={TransactionType.REMOVE}
              >
                Remove
              </a>
            </div>
          </div>
        ),
        dataIndex: '',
        key: 'transactionName',
        render: (text, entry) => {
          return (
            <div
              className={className(styles.tableDataFirstColumn, styles.transactionLink)}
              style={{ fontWeight: 600 }}
              onClick={() => openInNewTab(`${SCAN_URL_PREFIX()}/tx/${entry.transactionID}`)}
            >
              {entry.type} {entry.coin1} {entry.type == TransactionType.SWAP ? 'for' : 'and'}{' '}
              {entry.coin2}
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
              setCurrentKey('totalValue');
              onSortChange();
            }}
          >
            Total Value
            {currentKey == 'totalValue' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'totalValue',
        key: 'totalValue',
        render: (text, entry) => {
          return <div className={styles.tableData}>$ {abbrNumber(entry.totalValue)}</div>;
        },
        visible: isDesktop(),
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('coin1Amount');
              onSortChange();
            }}
          >
            Token Amount
            {currentKey == 'coin1Amount' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'coin1Amount',
        key: 'coin1Amount',
        render: (text, entry) => {
          return (
            <div className={styles.tableData}>
              {abbrNumber(entry.coin1Amount)} {entry.coin1}
            </div>
          );
        },
        visible: isDesktop(),
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('coin2Amount');
              onSortChange();
            }}
          >
            Token Amount
            {currentKey == 'coin2Amount' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'coin2Amount',
        key: 'coin2Amount',
        render: (text, entry) => {
          return (
            <div className={styles.tableData}>
              {abbrNumber(entry.coin2Amount)} {entry.coin2}
            </div>
          );
        },
        visible: isDesktop(),
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('account');
              onSortChange();
            }}
          >
            Account
            {currentKey == 'account' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'account',
        key: 'account',
        render: (text, entry) => {
          return (
            <div
              onClick={() => openInNewTab(`${SCAN_URL_PREFIX()}/address/${entry.account}`)}
              className={className(styles.tableData, styles.transactionLink)}
              style={{ textOverflow: 'ellipsis' }}
            >
              {abbrHash(text)}
            </div>
          );
        },
        visible: isDesktop(),
      },
      {
        title: (
          <div
            className={styles.tableHeader}
            onClick={() => {
              setCurrentKey('time');
              onSortChange();
            }}
          >
            Time
            {currentKey == 'time' && (
              <Icon
                type={!isAscending ? 'arrow-up' : 'arrow-down'}
                style={{ fontSize: '14px', marginLeft: '4px' }}
              />
            )}
          </div>
        ),
        dataIndex: 'time',
        key: 'time',
        render: (text, entry) => {
          function getRelTime(timestamp) {
            let tx_time;
            tx_time = moment(parseInt(timestamp * 1000)).format('YYYY-MM-DD HH:mm:ss');
            // console.log("printing time....",tx_time);
            if (tx_time == 'Invalid date') tx_time = timestamp;
            let a = moment(new Date(tx_time.replace(/-/g, "/"))).locale('en');
            return a.fromNow();
          }

          return <div className={styles.tableData}>{getRelTime(text)}</div>;
        },
        visible: true,
      },
    ];
  }

  // event handler callbacks
  const onClickTransaction = useCallback(e => {
    let destFilter = e.target.id;
    setTransactionView(destFilter);
  });

  const filterTransaction = (table, category) => {
    if (category == TransactionType.ALL) return table;
    else return table.filter(item => item.type == category);
  };

  //

  return (
    <Table
      dataSource={sortTable(
        filterTransaction(props.dataSourceTransaction, transactionView),
        currentKey,
        transactionSortAscending
      ).slice(0, transactionDisplayNumber + 1)}
      columns={transactionHeader(
        transactionView,
        onClickTransaction,
        transactionSortAscending,
        () => {
          setTransactionSortAscending(!transactionSortAscending);
        }
      ).filter(item => item.visible == true)}
      pagination={false}
      locale={{ emptyText: 'No Data' }}
      style={{
        marginBottom: '20px',
      }}
      footer={() => (
        <div className={styles.tableSeeMoreWrapper}>
          {filterTransaction(props.dataSourceTransaction, transactionView).slice(
            0,
            transactionDisplayNumber + 1
          ).length > transactionDisplayNumber && (
              <a
                className={styles.tableSeeMore}
                onClick={() => {
                  setTransactionDisplayNumber(transactionDisplayNumber + 5);
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

// react functional component
export const MarketSearchBar = props => {
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
      localToken.filter(
        token => token.short.includes(e.target.value.toUpperCase())||token.name.toUpperCase().includes(e.target.value.toUpperCase())
      )
    );
    setSearchPoolReturns(
      localPool.filter(
        item => item.coin1.includes(e.target.value.toUpperCase())||item.coin2.includes(e.target.value.toUpperCase())
      )
    );

    // setSearchPoolReturns(
    //   localPool.filter(token => token.short.includes(e.target.value.toUpperCase()))
    // );

    // lastPromiseWrapper(fetchTokenSearch(marketClient, e.target.value)).then(data => {
    //   
    //   setSearchCoinReturns(
    //     data.slice(0, 5).map(item => {
    //       //return { address: item.id, name: item.name, short: item.symbol };
    //       return { logoURL: 'https://acy.finance/static/media/logo.78c0179c.svg', address: item.id, name: item.name, short: item.short };
    //     })
    //   );
    //   
    //     
    //   
    //   lastPromiseWrapper(
    //     fetchPoolSearch(marketClient, e.target.value, data.map(item => item.id))
    //   ).then(pooldata => {
    //     setSearchPoolReturns(
    //       pooldata.map(item => {
    //         return { address: item.id, coin1: item.token0, coin2: item.token1, percent: 0 };
    //       })
    //     );
    //     setIsLoading(false);
    //   });
    // });

    // let query = e.target.value.toLowerCase();

    // coins return
    // let newCoin = props.dataSourceCoin.filter(
    //   item => item.name.toLowerCase().includes(query) || item.short.toLowerCase().includes(query)
    // );
    // setSearchCoinReturns(newCoin);
    // let newPool = props.dataSourcePool.filter(
    //   item => item.coin1.toLowerCase().includes(query) || item.coin2.toLowerCase().includes(query)
    // );
    //setSearchPoolReturns(newPool);
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

    // let newWatchlistPool = props.dataSourcePool.filter(item =>
    //   poolWatchlistData.toString().includes([item.coin1, item.coin2, item.percent].toString())
    // );

    // setWatchlistPool([...newWatchlistPool]);
    // update()

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
        props.getNetwork('BSC');
        localStorage.setItem("market", 56);
      },
    },
    {
      name: 'Polygon',
      icon: 'Polygon',
      onClick: async () => {
        setNetworkListIndex(1);
        props.getNetwork('Polygon');
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

  const n_index = () =>{
    const n = localStorage.getItem("market");
    if (n == 56){
      return 0;
    }else if (n==137){
      return 1;
    }else return 0;
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
        setSearchCoinReturns(
          data.map(item => {
            return { logoURL: item.logoURL, address: item.address, name: item.name, short: item.short };
          })
        );
        setLocalToken(
          data.map(item => {
            return { logoURL: item.logoURL, address: item.address, name: item.name, short: item.short };
          })
        )
      }
    }).catch(error => {
      console.log("Error in fetch search coin returns:", error);
    })

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
                      backgroundColor: '#373739',
                      borderRadius: '40px',
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

                        <Divider className={styles.searchModalDivider} />
                        {isLoading ? (
                          <Icon type="loading" />
                        ) : (
                          <>
                            {searchPoolReturns.length > 0 ? (
                              <SmallTable
                                mode="pool"
                                data={searchPoolReturns}
                                displayNumber={displayNumber}
                                refreshWatchlist={refreshWatchlist}
                              />
                            ) : (
                              <div
                                style={{ fontSize: '20px', margin: '20px' }}
                                refreshWatchlist={refreshWatchlist}
                              >
                                No results
                              </div>
                            )}
                          </>
                        )}
                      </AcyTabPane>
                      {/* <AcyTabPane tab="Watchlist" key="2">
                        {watchlistToken.length > 0 ? (
                          <SmallTable
                            mode="token"
                            data={watchlistToken}
                            displayNumber={displayNumber}
                            refreshWatchlist={refreshWatchlist}
                          />
                        ) : (
                          <span style={{ color: '#757579', fontWeight: '600', paddingTop: '30px' }}>
                            Add items by clicking on the star
                          </span>
                        )}

                        <Divider className={styles.searchModalDivider} />

                        {watchlistPool.length > 0 ? (
                          <SmallTable
                            mode="pool"
                            data={watchlistPool}
                            displayNumber={displayNumber}
                            refreshWatchlist={refreshWatchlist}
                          />
                        ) : (
                          <span style={{ color: '#757579', fontWeight: '600', marginTop: '10px' }}>
                            Add items by clicking on the star
                          </span>
                        )}
                      </AcyTabPane> */}
                    </AcyTabs>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* network button */}
      <div>
        {props.networkShow ?
        (<Dropdown
        overlay={networkListInCardList}
        trigger={['click']}
        placement="bottomLeft"
        className={styles.networkHandle}
      >
        <div type="primary" shape="round">
          {[networkList[networkListIndex]].map(item => (
            <div>
              <AcyIcon.MyIcon type={item.icon} /> {item.name} Network<DownOutlined className={styles.networkHandleFont}/> </div>
          ))}
        </div>
      </Dropdown>):''}
      </div>
      
    </div>
  );
};
