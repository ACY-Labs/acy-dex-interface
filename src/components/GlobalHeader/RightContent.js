import React, { useState, useEffect } from 'react';
import { FormattedMessage, connect } from 'umi';
import { Spin, Tag, Menu, Icon, Dropdown, Button, Space, Modal, message } from 'antd';
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
import { useConstantLoader, supportedChainIds } from '@/constants'
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
  nabox,
} from '@/connectors';
import {
  DownOutlined
} from '@ant-design/icons';

import styles from './index.less';
import { ReactComponent as Opera } from './Opera.svg';
import styled from "styled-components";


const GlobalHeaderRight = props => {
  const { global } = props;
  // 选择货币的弹窗
  const [visible, setVisible] = useState(false);
  const [visibleMetaMask, setVisibleMetaMask] = useState(false);
  const [visibleSetting, setVisibleSetting] = useState(false);
  const [only, setOnly] = useState(true);
  // 连接钱包函数
  const { library } = useConstantLoader();
  const { account, chainId, activate, deactivate, active } = useWeb3React();

  const [wallet, setWallet] = useState(localStorage.getItem("wallet"));

  // 连接钱包 根据localStorage
  useEffect(() => {
    setWallet(localStorage.getItem("wallet"))
    if (!account) {
      if (!wallet) {
        console.log("localStroage dosen't exist");
        localStorage.setItem('wallet', 'binance');
      }
    }
  }, [account]);

  useEffect(() => {
    console.log('test current active', active)
    if (!active)
      deactivate();
  }, [active]);

  // 判断设备
  const [userSystem, setuserSystem] = useState("other");

  useEffect(() => {
    function fIsMobile() {
      return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    if (u) {
      setuserSystem("isPC");
    } else if (isAndroid) {
      setuserSystem("isAndroid");
    } else if (isiOS) {
      setuserSystem("isiOS");
    } else setuserSystem("other");
  }, [])

  useEffect(() => {
    if (account){
      localStorage.setItem("login_status", "on");
    }
    else{
      //localStorage.setItem("login_status", "off");
      setNetworkListIndex(0)
    }
  }, [account]);

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
    setNetworkListIndex(n_index(chainId));
  };
  const onhandCancelMetaMask = () => {
    setVisibleMetaMask(false);
  };
  const onhandSetting = flag => {
    setVisibleSetting(!!flag);
  };
  const handleVisibleChange = () => { }

  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  // 选择钱包
  const selectWallet = walletName => {
    if (walletName!=localStorage.getItem("wallet"))
      localStorage.setItem("login_status", "off");
    console.log('selecting wallet', walletName);
    if (walletName === 'metamask' || walletName === 'opera') {
      try {
        ethereum;
        activate(injected);
      } catch (error) {
        message.info('No provider was found');
        if(account){
          localStorage.setItem("login_status", "on");
        }
        return
      }
    }else if (walletName === 'bitkeep'){
      try {
        ethereum;
        activate(injected);
        if (!window.isBitKeep){
          message.info('Wrong wallet, please make sure other wallet extensions has been closed');
        }
      } catch (error) {
        message.info('No provider was found');
        if(account){
          localStorage.setItem("login_status", "on");
        }
        return
      }
    } 
    else if (walletName === 'walletconnect') {
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
    } else if (walletName === 'binance') {
      try {
        BinanceChain
        activate(binance);
      } catch (error) {
        message.info('No provider was found');
        if(account){
          localStorage.setItem("login_status", "on");
        }
        return
      }
    } else if (walletName === 'nabox') {
      try {
        NaboxWallet;
        activate(nabox);
      } catch (error) {
        message.info('No provider was found');
        if(account){
          localStorage.setItem("login_status", "on");
        }
        return
      }
    } else {
      console.log("wallet ERROR");
    }
    localStorage.setItem('wallet', walletName);
    setVisibleMetaMask(false);
  };
  // 初始网络显示
  const n_index = chainId => {
    if (chainId == 56 || chainId == 97) {
      return 2
    }
    if (chainId == 137 || chainId == 80001) {
      return 3
    }
    if (chainId == undefined){
      return 0
    }
    return 1
  }
  // 通知钱包连接成功
  const checkChainNetwork = (chainId) => {
    if (!chainId) {
      switchEthereumChain("0x38"); //返回默认56链
      return
    }
    console.log("networkChanged:", chainId)
    console.log("supported chain?", supportedChainIds, chainId, supportedChainIds.indexOf(chainId) == -1)
    if (supportedChainIds && supportedChainIds.indexOf(Number(chainId)) == -1) {
      console.log("ERROR: unsupport NetWork");
      setIsModalVisible(true);
      switchEthereumChain("0x38"); //返回默认56链
    }
    else if (chainId == 97) {
      // 测试网 不显示给用户
      switchEthereumChain("0x61");
      setNetworkListIndex(0)
    }
    else {
      setIsModalVisible(false);
      setVisibleMetaMask(false);
      setNetworkListIndex(n_index(chainId))
    }
  }
  useEffect(() => {
    // todo....
    if (account) {
      console.log(account);
      setVisibleMetaMask(false);
    }
    checkChainNetwork(chainId);
    // 监听钱包网络变化 metamask
    if (localStorage.getItem("wallet") == "metamask" || localStorage.getItem("wallet") == "bitkeep") {
      try {
        ethereum.on('networkChanged', function (chainId) {
          checkChainNetwork(chainId);
        })
      } catch (error) {
        console.log("no metamask plugin");
      }
    }
    if (localStorage.getItem("wallet") == "nabox") {
      // Nabox 监听
      try {
        NaboxWallet.on('networkChanged', function (chainId) {
          checkChainNetwork(chainId);
        })
      } catch (error) {
        console.log("no nabox plugin");
      }
    }
    if (localStorage.getItem("wallet") == "binance") {
      try {
        BinanceChain.on('networkChanged', function (chainId) {
          checkChainNetwork(chainId);
        })
      } catch (error) {
        console.log("no binance plugin");
      }
    }
  }, [account, chainId, supportedChainIds, wallet]);
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
      onClick: () => {
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
      name: 'Nabox Wallet',
      icon: 'Nabox',
      onClick: () => {
        selectWallet('nabox');
      },
    },
    {
      name: 'Bitkeep Wallet',
      icon: 'Bitkeep',
      onClick: () => {
        selectWallet('bitkeep');
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

  const networkParams = {
    "0x38": {
      chainId: '0x38',
      chainName: 'Binance Smart Chain Netwaok',
      nativeCurrency: {
        name: 'Binance',
        symbol: 'BNB', // 2-6 characters long
        decimals: 18
      },
      blockExplorerUrls: ['https://bscscan.com'],
      rpcUrls: ['https://bsc-dataseed.binance.org/'],
    },
    "0x61": {
      chainId: '0x61',
      chainName: 'Binance Smart Chain Testnet',
      nativeCurrency: {
        name: 'Binance',
        symbol: 'BNB', // 2-6 characters long
        decimals: 18
      },
      blockExplorerUrls: ['https://testnet.bscscan.com'],
      rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    },
    "0x89": {
      chainId: '0x89',
      chainName: 'Polygon',
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC', // 2-6 characters long
        decimals: 18
      },
      blockExplorerUrls: ['https://polygonscan.com/'],
      rpcUrls: ['https://polygon-rpc.com/'],
    },
  };

  const switchEthereumChain = async (chainId) => {
    if (localStorage.getItem("wallet") == "metamask") {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      } catch (e) {
        if (e.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                networkParams[chainId]
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
      }
    }
    else if (localStorage.getItem("wallet") == "nabox") {
      try {
        await NaboxWallet.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      } catch (e) {
        if (e.code === 4902) {
          try {
            await NaboxWallet.request({
              method: 'wallet_addEthereumChain',
              params: [
                networkParams[chainId]
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
      }
    }
    else if (localStorage.getItem("wallet") == "binance") {
      try {
        await BinanceChain.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      } catch (e) {
        if (e.code === 4902) {
          try {
            await BinanceChain.request({
              method: 'wallet_addEthereumChain',
              params: [
                networkParams[chainId]
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
      }
    }
  }
  const showMore = () => {
    setOnly(!only);
  };
  const noticeData = getNoticeData();
  const unreadMsg = getUnreadData(noticeData);
  let className = styles.right;
  if (theme === 'dark') {
    className = `${styles.right}  ${styles.dark}`;
  }
  // 网络列表
  const [networkListIndex, setNetworkListIndex] = useState(0);
  const networkList = [
    {
      name: 'NO Network',
      //icon: 'Polygon',
      onClick: async () => {
        setVisibleMetaMask(false);
      },
    },
    {
      name: 'Wrong Network',
      //icon: 'Polygon',
      onClick: async () => {
        setVisibleMetaMask(false);
      },
    },
    {
      name: 'BSC',
      icon: 'Binance',
      onClick: async () => {
        await switchEthereumChain("0x38");
        setVisibleMetaMask(false);
      },
    },
    {
      name: 'Polygon',
      icon: 'Polygon',
      onClick: async () => {
        await switchEthereumChain("0x89");
        setVisibleMetaMask(false);
      },
    },
  ];
  const networkListInCardList = (
    <div className={styles.networkListBlock}>
      <div className={styles.networkTitle}>
        <span>Select a Network</span>
      </div>
      <AcyCardList>
        {networkList.slice(2,).map((item) => {
          return (
            <AcyCardList.Thin className={styles.networkListLayout} onClick={() => item.onClick()}>
              {
                <AcyIcon.MyIcon width={20} type={item.icon} />
              }
              <span>{item.name}</span>
            </AcyCardList.Thin>
          );
        }
        )}
      </AcyCardList>
    </div>
  );
  const deactivateTest = () => {
    deactivate();
    localStorage.setItem("login_status", 'off')
  }

  return (
    <div className={className}>
      {/* <Button onClick={deactivateTest}>disconnected</Button> */}
      <Dropdown
        overlay={networkListInCardList}
        trigger={['click']}
        placement="bottomLeft"
      //className={styles.networkButton}
      >
        <div type="primary" shape="round" className={styles.networkButton}>
          {[networkList[networkListIndex]].map(item => (
            <div>
              <AcyIcon.MyIcon type={item.icon} /> {item.name} <DownOutlined /></div>
            //<Icon><DownOutlined /></Icon>
          ))}
        </div>
      </Dropdown>

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

        {/* <div className={styles.walltitle}>
          <span style={{ marginLeft: '10px' }}>Select Network</span>
        </div>
        <Dropdown
          overlay={networkListInCardList}
          trigger={['click']}
          placement="bottomLeft"
        >
          <AcyCardList>
            {[networkList[networkListIndex]].map(item => (
              <AcyCardList.Thin className={styles.networkListLayout}>
                {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                  <AcyIcon.MyIcon width={32} type={item.icon} />
                )}
                <span>{item.name}</span>
              </AcyCardList.Thin>
            ))}
          </AcyCardList>
        </Dropdown> */}


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
              <span className={styles.fontBold}>{item.name}</span>
            </AcyCardList.Thin>
          ))}
          {BinanceWallet.map(item => (
            <AcyCardList.Thin onClick={() => item.onClick()}>
              {(item.svgicon && <Opera width={32} style={{ margin: '5px' }} />) || (
                <AcyIcon.MyIcon width={32} type={item.icon} />
              )}
              <span className={styles.fontBold}>{item.name}</span>
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
                  <span className={styles.fontBold}>{item.name}</span>
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
      {/* 错误弹窗*/}
      <AcyModal width={420} visible={isModalVisible}>
        <p>ERROR: UNSUPPORT NETWORKS</p>
        <p>We are not ready for this networks, please change your networks!</p>
      </AcyModal>

    </div>
  );
};
export default connect(({ transaction }) => ({
  transaction,
}))(GlobalHeaderRight);
