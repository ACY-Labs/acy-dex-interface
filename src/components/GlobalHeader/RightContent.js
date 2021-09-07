import React, { PureComponent, useState, useEffect } from 'react';
import { FormattedMessage, formatMessage } from 'umi';
import { Spin, Tag, Menu, Icon, Avatar, Tooltip, Checkbox, Dropdown } from 'antd';
import moment from 'moment';
import groupBy from 'lodash/groupBy';
import {
  AcyIcon,
  AcyConnectWallet,
  AcyModal,
  AcyCheckBox,
  AcyCardList,
  AcyWarp,
  AcyRadioButton,
  AcySeting,
} from '@/components/Acy';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletLinkConnector } from '@web3-react/walletlink-connector';
import { FortmaticConnector } from '@web3-react/fortmatic-connector';
import { PortisConnector } from '@web3-react/portis-connector';
import { TorusConnector } from '@web3-react/torus-connector';

import NoticeIcon from '../NoticeIcon';
import HeaderSearch from '../HeaderSearch';
import HeaderDropdown from '../HeaderDropdown';
import SelectLang from '../SelectLang';
import styles from './index.less';
import { ReactComponent as Opera } from './Opera.svg'; //
import { T } from 'antd/lib/upload/utils';

const GlobalHeaderRight = props => {
  const { global } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(false);
  const [visibleMetaMask, setVisibleMetaMask] = useState(false);
  const [visibleSetting, setVisibleSetting] = useState(false);
  // 连接钱包函数
  const { account, chainId, library, activate } = useWeb3React();
  const RPC_URLS = {
    1: 'https://mainnet.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2',
    4: 'https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2',
  };
  // 连接钱包时支持的货币id
  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  });
  const walletlink = new WalletLinkConnector({
    url: RPC_URLS['4'],
    appName: 'ACY swap',
    supportedChainIds: [1, 3, 4, 5, 42, 10, 137, 69, 420, 80001],
  });
  const fortmatic = new FortmaticConnector({ apiKey: 'pk_test_1897AD5B792BA339', chainId: 4 });
  const portis = new PortisConnector({
    dAppId: 'c474625b-8239-4ce8-ab42-bd16489873c3',
    networks: [1, 3, 4, 5, 42],
  });
  const torus = new TorusConnector({ chainId: 1 });
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

  const changeReadState = clickedItem => {
    const { id } = clickedItem;
    const { dispatch } = props;
    dispatch({
      type: 'global/changeNoticeReadState',
      payload: id,
    });
  };

  const fetchMoreNotices = tabProps => {
    const { list, name } = tabProps;
    const { dispatch, notices = [] } = props;
    const lastItemId = notices[notices.length - 1].id;
    dispatch({
      type: 'global/fetchMoreNotices',
      payload: {
        lastItemId,
        type: name,
        offset: list.length,
      },
    });
  };
  const onhandConnect = () => {
    setVisible(true);
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
    if (walletName === 'metamask') {
      activate(injected);
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
      name: 'TrustWallet',
      icon: 'TrustWallet',
      onClick: () => {},
    },
    {
      name: 'WalletConnect',
      icon: 'WalletConnect',
      onClick: () => {},
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
      onClick: () => {},
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
      <AcyConnectWallet isMobile={isMobile} value={account} onClick={onhandMetaMask} />
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
