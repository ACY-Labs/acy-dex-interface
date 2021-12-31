import React, { useState, useEffect } from 'react';
import { FormattedMessage, connect } from 'umi';
import { Spin, Tag, Menu, Icon, Dropdown } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import { Link } from 'react-router-dom';
import {
  AcyIcon,
  AcyConnectWallet,
  AcyModal,
  AcyCardList,
  AcyRadioButton,
  AcySeting,
} from '@/components/Acy';
import { useWeb3React } from '@web3-react/core';

import {
  injected,
  walletconnect,
  walletlink,
  fortmatic,
  portis,
  torus,
  trezor,
  ledger,
  binance,
} from '@/connectors';

import styles from './index.less';
import { ReactComponent as Opera } from './Opera.svg';

const GlobalHeaderRight = props => {
  const { global } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(false);
  const [visibleMetaMask, setVisibleMetaMask] = useState(false);
  const [visibleSetting, setVisibleSetting] = useState(false);
  // 连接钱包函数
  const { account, chainId, library, activate, deactivate, active } = useWeb3React();

  useEffect(() => {
    if (!account){
      activate(binance);
      activate(injected);
    }
  }, []);

  useEffect(() => {
    console.log('test current active', active)
    if (!active)
      deactivate();
  }, [active])

  useEffect(() => console.log("test current ", account), [account]);

  const getNoticeData = () => {
    const { notices = [] } = props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  };

  const getUnreadData = noticeData => {
    const unreadMsg = {};
    Object.entries(noticeData).forEach(([key, value]) => {
      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }
      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter(item => !item.read).length;
      }
    });
    return unreadMsg;
  };

  const onhandCancel = () => {
    setVisibleMetaMask(false);
  };
  const onhandMetaMask = () => {
    setVisibleMetaMask(true);
  };
  const onhandCancelMetaMask = () => {
    setVisibleMetaMask(false);
  };
  const onhandSetting = flag => {
    setVisibleSetting(!!flag);
  };
  const handleVisibleChange = () => {};

  // 选择钱包
  const selectWallet = walletName => {
    console.log('selecting wallet');
    if (walletName === 'metamask' || walletName === 'opera') {
      activate(injected);
    } else if (walletName === 'walletconnect') {
      activate(walletconnect);
    } else if (walletName === 'coinbase') {
      activate(walletlink);
    } else if (walletName === 'fortmatic') {
      activate(fortmatic);
    } else if (walletName === 'portis') {
      activate(portis);
    } else if (walletName === 'torus') {
      activate(torus);
    } else if (walletName === 'trezor') {
      activate(trezor);
    } else if (walletName === 'ledger') {
      activate(ledger);
    } else if(walletName === 'binance'){
      activate(binance);
    }
    setVisibleMetaMask(false);
  };
  // 通知钱包连接成功
  useEffect(() => {
    // todo....
    if (account) {
      console.log(account);
      setVisibleMetaMask(false);
    }
  }, account);
  const {
    currentUser,
    fetchingMoreNotices,
    fetchingNotices,
    loadedAllNotices,
    onNoticeVisibleChange,
    onMenuClick,
    onNoticeClear,
    skeletonCount,
    theme,
    isMobile,
  } = props;
  // const { visible, visibleMetaMask, visibleSetting } = this.state;
  const menu = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item key="userCenter">
        <Icon type="user" />
        <FormattedMessage id="menu.account.center" defaultMessage="account center" />
      </Menu.Item>
      <Menu.Item key="userinfo">
        <Icon type="setting" />
        <FormattedMessage id="menu.account.settings" defaultMessage="account settings" />
      </Menu.Item>
      <Menu.Item key="triggerError">
        <Icon type="close-circle" />
        <FormattedMessage id="menu.account.trigger" defaultMessage="Trigger Error" />
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <Icon type="logout" />
        <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
      </Menu.Item>
    </Menu>
  );
  const loadMoreProps = {
    skeletonCount,
    loadedAll: loadedAllNotices,
    loading: fetchingMoreNotices,
  };
  // 货币列表
  const MetaMask = [
    {
      name: 'MetaMask',
      icon: 'Metamask',
      onClick: () => {
        selectWallet('metamask');
      },
    },
  ];
  const BinanceWallet = [
    {
      name: 'Binance Wallet',
      icon: 'Binance',
      onClick:()=>{
        selectWallet('binance');
      },
    },
  ];

  const walletList = [
    {
      name: 'Coinbase Wallet',
      icon: 'Coinbase',
      onClick: () => {
        selectWallet('coinbase');
      },
    },
    {
      name: 'WalletConnect',
      icon: 'WalletConnect',
      onClick: () => {
        selectWallet('walletconnect');
      },
    },
    {
      name: 'TrustWallet',
      icon: 'TrustWallet',
      onClick: () => {
        selectWallet('walletconnect');
      },
    },
    // {
    //   name: 'Trezor',
    //   icon: 'Trezor',
    //   onClick: () => {
    //     selectWallet('trezor');
    //   },
    // },
    // {
    //   name: 'Ledger',
    //   icon: 'Ledger',
    //   onClick: () => {
    //     selectWallet('ledger');
    //   },
    // },
    // {
    //   name: 'Fortmatic',
    //   icon: 'Fortmatic',
    //   onClick: () => {
    //     selectWallet('fortmatic');
    //   },
    // },
    {
      name: 'Portis',
      icon: 'Portis',
      onClick: () => {
        selectWallet('portis');
      },
    },
    {
      name: 'Torus',
      icon: 'Torus',
      onClick: () => {
        selectWallet('torus');
      },
    },
    {
      name: 'Opera',
      icon: 'Opera',
      svgicon: true,
      onClick: () => {
        selectWallet('opera');
      },
    },
  ];
  const [only, setOnly] = useState(true);
  const showMore = () => {
    setOnly(!only);
  };
  const noticeData = getNoticeData();
  const unreadMsg = getUnreadData(noticeData);
  let className = styles.right;
  if (theme === 'dark') {
    className = `${styles.right}  ${styles.dark}`;
  }

  return (
    <div className={className}>
      {/* <AcyIcon onClick={this.onhandConnect} name="acy" /> */}
      <AcyConnectWallet
        chainId={chainId} // this is the chainId from useWeb3React
        isMobile={isMobile}
        onClick={onhandMetaMask}
        pendingLength={
          props.transaction.transactions.length
        }
      />
      {false && (
        <Dropdown
          overlay={
            <div className={styles.setting} onClick={e => e.preventDefault()}>
              <ul className={styles.list}>
                <li>
                  <AcySeting title="Gas Price" current="Rapid(85.1gwei) ~3">
                    <AcyRadioButton data={['Rapid(85.1gwei) ~3', 'Rapid(67.1gwei) ~6']} />
                  </AcySeting>
                </li>
                <li>
                  <AcySeting title="Endpoint" current="Global 122.0ms">
                    <AcyRadioButton data={['Global 122.0ms', 'Custom']} />
                  </AcySeting>
                </li>
                <li>
                  <AcySeting title="Network" current="ETH">
                    <AcyRadioButton
                      data={['ETH', 'BSC', 'Heco', 'Polygon', 'Arbitrum', 'OkChain']}
                    />
                  </AcySeting>
                </li>
                {/* <li style={{borderBottom:'1px solid rgb(64, 64, 64)',paddingBottom:'20px'}}>
                <AcySeting title="Language" current="English">
                  <AcyRadioButton data={['English', '中文']} />
                </AcySeting>
              </li> */}
                {/* <li style={{marginTop:'30px'}}>
                  <a className={styles.setitem}>
                    <Icon type="question-circle" />Help
                  </a>
                  <a className={styles.setitem}>
                  <Icon type="notification" />Announcements
                  </a>
                  <a className={styles.setitem}>
                  <Icon type="message" />Forum
                  </a>
              </li> */}
              </ul>
            </div>
          }
          trigger={['click']}
          placement="bottomLeft"
          visible={visibleSetting}
          onVisibleChange={onhandSetting}
        >
          <AcyIcon
            width={30}
            name={visibleSetting ? 'colors-active' : 'colors'}
            onClick={() => onhandSetting(true)}
          />
        </Dropdown>
      )}
      <AcyModal width={420} visible={visibleMetaMask} onCancel={onhandCancel}>
        <div className={styles.walltitle}>
          {/* <AcyIcon.MyIcon width={20} type="Wallet" />{' '} */}
          <span style={{ marginLeft: '10px' }}>Select a Wallet</span>
          {/* <AcyIcon onClick={this.onhandCancel} name="close" /> */}
        </div>
        {/* <AcyCardList style={{ marginTop: '10px' }}>
          <AcyCardList.Agree>
            By connecting a wallet, you agree to ACY{' '}
            <a target="_blank" href="https://acy.finance/terms-of-use">
              Terms of Service
            </a>{' '}
            .
          </AcyCardList.Agree>
        </AcyCardList> */}

        <AcyCardList>
          {MetaMask.map(item => (
            <AcyCardList.Thin onClick={() => item.onClick()}>
              {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                <AcyIcon.MyIcon width={32} type={item.icon} />
              )}
              <span>{item.name}</span>
            </AcyCardList.Thin>
          ))}
          {BinanceWallet.map(item =>(
            <AcyCardList.Thin onClick={()=>item.onClick()}>
              {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
              <AcyIcon.MyIcon width={32} type={item.icon} />
            )}
            <span>{item.name}</span>
          </AcyCardList.Thin>
          ))}
        </AcyCardList>

        <AcyCardList>
          {walletList.map((item, index) => {
            if (only && index > -1) {
              return;
            } else {
              return (
                <AcyCardList.Thin onClick={() => item.onClick()}>
                  {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                    <AcyIcon.MyIcon width={32} type={item.icon} />
                  )}
                  <span>{item.name}</span>
                </AcyCardList.Thin>
              );
            }
          })}
        </AcyCardList>
        {only && (
          <p className={styles.showmore} onClick={showMore}>
            See More...
          </p>
        )}
        {/* {account && (
          <AcyCardList>
            <div
              style={{
                background: '#29292c',
                width: '100%',
                marginTop: 10,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Link to={`/market/accounts/${account}`} style={{ color: '#eb5c20' }}>
                See My Account
              </Link>
              <div style={{ marginTop: 5 }}>
                <div className={styles.descLine}>
                  <div style={{fontWeight: "bold"}}>My Liquidity</div>
                  <div>$999.99</div>
                </div>
                <div className={styles.descLine}>
                  <div style={{fontWeight: "bold"}}>My Volume</div>
                  <div>$999.99</div>
                </div>
                <div className={styles.descLine}>
                  <div style={{fontWeight: "bold"}}>My Farms</div>
                  <div>$999.99</div>
                </div>
              </div>
            </div>
          </AcyCardList>
        )} */}
      </AcyModal>
    </div>
  );
};
export default connect(({ transaction }) => ({
  transaction,
}))(GlobalHeaderRight);
