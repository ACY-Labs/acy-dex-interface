import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'umi';
import { Spin, Tag, Menu, Icon, Dropdown } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import {
  AcyIcon,
  AcyConnectWallet,
  AcyModal,
  AcyCardList,
  AcyRadioButton,
  AcySeting,
} from '@/components/Acy';
import { useWeb3React } from '@web3-react/core';

import { injected, walletconnect, walletlink, fortmatic, portis, torus } from '@/connectors';

import styles from './index.less';
import { ReactComponent as Opera } from './Opera.svg';

const GlobalHeaderRight = props => {
  const { global } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(false);
  const [visibleMetaMask, setVisibleMetaMask] = useState(false);
  const [visibleSetting, setVisibleSetting] = useState(false);
  // 连接钱包函数
  const { account, chainId, library, activate, deactivate } = useWeb3React();

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
      name: 'Trezor',
      icon: 'Trezor',
      onClick: () => {},
    },
    {
      name: 'Ledger',
      icon: 'Ledger',
      onClick: () => {},
    },
    {
      name: 'Fortmatic',
      icon: 'Fortmatic',
      onClick: () => {
        selectWallet('fortmatic');
      },
    },
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
    {
      name: 'Gnosis Safe',
      icon: 'Gnosis',
      onClick: () => {},
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
        chainId={chainId}
        isMobile={isMobile}
        value={account}
        onClick={onhandMetaMask}
      />
      <Dropdown
        overlay={
          <div className={styles.setting} onClick={e => e.preventDefault()}>
            <ul className={styles.list}>
              <li>
                <AcySeting title="Language" current="English">
                  <AcyRadioButton data={['English', '中文']} />
                </AcySeting>
              </li>
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
      <AcyModal width={420} visible={visibleMetaMask} onCancel={onhandCancel}>
        <div className={styles.walltitle}>
          <AcyIcon.MyIcon width={20} type="Wallet" />{' '}
          <span style={{ marginLeft: '10px' }}>Select a Wallet</span>
          {/* <AcyIcon onClick={this.onhandCancel} name="close" /> */}
        </div>
        <AcyCardList style={{ marginTop: '10px' }}>
          <AcyCardList.Agree>
            By connecting a wallet, you agree to ACY{' '}
            <a target="_blank" href="https://acy.finance/terms-of-use">
              Terms of Service
            </a>{' '}
            .
          </AcyCardList.Agree>
        </AcyCardList>
        <AcyCardList>
          {MetaMask.map(item => (
            <AcyCardList.Thin onClick={() => item.onClick()}>
              {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                <AcyIcon.MyIcon width={32} type={item.icon} />
              )}
              <span>{item.name}</span>
            </AcyCardList.Thin>
          ))}
        </AcyCardList>
        <AcyCardList>
          {walletList.map((item, index) => {
            if (only && index > 1) {
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
      </AcyModal>
    </div>
  );
};
export default GlobalHeaderRight;
