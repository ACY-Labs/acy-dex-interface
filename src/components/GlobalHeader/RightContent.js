import React, { PureComponent } from 'react';
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
} from '@/components/Acy';
import NoticeIcon from '../NoticeIcon';
import HeaderSearch from '../HeaderSearch';
import HeaderDropdown from '../HeaderDropdown';
import SelectLang from '../SelectLang';
import styles from './index.less';
import { T } from 'antd/lib/upload/utils';

export default class GlobalHeaderRight extends PureComponent {
  state = {
    visible: false,
    visibleMetaMask: false,
    visibleSetting: false,
  };
  getNoticeData() {
    const { notices = [] } = this.props;
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
  }

  getUnreadData = noticeData => {
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

  changeReadState = clickedItem => {
    const { id } = clickedItem;
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeNoticeReadState',
      payload: id,
    });
  };

  fetchMoreNotices = tabProps => {
    const { list, name } = tabProps;
    const { dispatch, notices = [] } = this.props;
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
  onhandConnect = () => {
    this.setState({
      visible: true,
    });
  };
  onhandCancel = () => {
    this.setState({
      visible: false,
    });
  };
  onhandMetaMask = () => {
    this.setState({
      visibleMetaMask: true,
    });
  };
  onhandCancelMetaMask = () => {
    this.setState({
      visibleMetaMask: false,
    });
  };
  onhandSetting = flag => {
    this.setState({
      visibleSetting: !!flag,
    });
  };
  handleVisibleChange = () => {};

  // 选择钱包 
  selectWallet=()=>{
    activate(injected);
  }
  render() {
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
      account
    } = this.props;
    const { visible, visibleMetaMask, visibleSetting } = this.state;
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
    const noticeData = this.getNoticeData();
    const unreadMsg = this.getUnreadData(noticeData);
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }
    return (
      <div className={className}>
        {/* <AcyIcon onClick={this.onhandConnect} name="acy" /> */}
        <AcyConnectWallet value={account}  onClick={this.onhandMetaMask} />
        <Dropdown
          overlay={
            <div className={styles.setting} onClick={e => e.preventDefault()}>
              <ul className={styles.list}>
                <li>
                  <div className={styles.listitem}>
                    <span>Gas Price</span>
                    <span>
                      18.0 GWEI <AcyIcon width={16} name="nabla" />{' '}
                    </span>
                  </div>
                  {/* <div>
                <AcyRadioButton data={["22.0 gwei ～ 15s～ Rapid ","18.5 gwei ～ 45s～ Fast ","14.5 gwei ～ 2min～ Medium "]}/>
              </div> */}
                </li>
                <li>
                  <div className={styles.listitem}>
                    <span>Endpoint</span>
                    <span>
                      Global 159.2ms <AcyIcon width={16} name="nabla" />{' '}
                    </span>
                  </div>
                  {/* <div>
                <AcyRadioButton data={["Global 210.7ms","APAC 210.5ms","N. America 879.6ms","Europe 880.2ms"]}/>
              </div> */}
                </li>
                <li>
                  <div className={styles.listitem}>
                    <span>Language</span>
                    <span>
                      English <AcyIcon width={16} name="nabla" />{' '}
                    </span>
                  </div>
                  <div>
                    <AcyRadioButton data={['English', '中文', 'Pусский', '日本語']} />
                  </div>
                </li>
                <li>
                  <div className={styles.listitem}>
                    <span>Network</span>
                    <span>
                      Ethereum
                      <AcyIcon width={16} name="nabla" />{' '}
                    </span>
                  </div>
                  {/* <div>
                <AcyRadioButton data={["Ethereum","BSC","Polygon","Solana"]}/>
              </div> */}
                </li>
                <li>
                  <div className={styles.listitem}>
                    <span>
                      <AcyIcon width={25} name="help" />
                      <span>FAQ</span>
                    </span>
                  </div>
                </li>
                <li>
                  <div className={styles.listitem}>
                    <span>
                      <AcyIcon width={25} name="announcements" />
                      <span>Announcements</span>
                    </span>
                  </div>
                </li>
                <li>
                  <div className={styles.listitem}>
                    <span>
                      <AcyIcon width={25} name="documents" />
                      <span>Documents</span>
                    </span>
                  </div>
                </li>
              </ul>
              <div className={styles.message}>
                <AcyIcon width={30} name="twitter" title="Twitter" />
                <AcyIcon width={30} name="twitter" title="Twitter" />
                <AcyIcon width={30} name="twitter" title="Twitter" />
                <AcyIcon width={30} name="twitter" title="Twitter" />
                <AcyIcon width={30} name="twitter" title="Twitter" />
              </div>
            </div>
          }
          trigger={['click']}
          placement="bottomLeft"
          visible={visibleSetting}
          onVisibleChange={this.onhandSetting}
        >
          <AcyIcon name="colors" onClick={() => this.onhandSetting(true)} />
        </Dropdown>

        {/* <HeaderSearch
          className={`${styles.action} ${styles.search}`}
          placeholder={formatMessage({ id: 'component.globalHeader.search' })}
          dataSource={[
            formatMessage({ id: 'component.globalHeader.search.example1' }),
            formatMessage({ id: 'component.globalHeader.search.example2' }),
            formatMessage({ id: 'component.globalHeader.search.example3' }),
          ]}
          onSearch={value => {
            console.log('input', value); // eslint-disable-line
          }}
          onPressEnter={value => {
            console.log('enter', value); // eslint-disable-line
          }}
        />
        <Tooltip title={formatMessage({ id: 'component.globalHeader.help' })}>
          <a
            target="_blank"
            href="https://pro.ant.design/docs/getting-started"
            rel="noopener noreferrer"
            className={styles.action}
          >
            <Icon type="question-circle-o" />
          </a>
        </Tooltip>
        <NoticeIcon
          className={styles.action}
          count={currentUser.unreadCount}
          onItemClick={(item, tabProps) => {
            console.log(item, tabProps); // eslint-disable-line
            this.changeReadState(item, tabProps);
          }}
          locale={{
            emptyText: formatMessage({ id: 'component.noticeIcon.empty' }),
            clear: formatMessage({ id: 'component.noticeIcon.clear' }),
            loadedAll: formatMessage({ id: 'component.noticeIcon.loaded' }),
            loadMore: formatMessage({ id: 'component.noticeIcon.loading-more' }),
          }}
          onClear={onNoticeClear}
          onLoadMore={this.fetchMoreNotices}
          onPopupVisibleChange={onNoticeVisibleChange}
          loading={fetchingNotices}
          clearClose
        >
          <NoticeIcon.Tab
            count={unreadMsg.notification}
            list={noticeData.notification}
            title={formatMessage({ id: 'component.globalHeader.notification' })}
            name="notification"
            emptyText={formatMessage({ id: 'component.globalHeader.notification.empty' })}
            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
            {...loadMoreProps}
          />
          <NoticeIcon.Tab
            count={unreadMsg.message}
            list={noticeData.message}
            title={formatMessage({ id: 'component.globalHeader.message' })}
            name="message"
            emptyText={formatMessage({ id: 'component.globalHeader.message.empty' })}
            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
            {...loadMoreProps}
          />
          <NoticeIcon.Tab
            count={unreadMsg.event}
            list={noticeData.event}
            title={formatMessage({ id: 'component.globalHeader.event' })}
            name="event"
            emptyText={formatMessage({ id: 'component.globalHeader.event.empty' })}
            emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
            {...loadMoreProps}
          />
        </NoticeIcon>
        {currentUser.name ? (
          <HeaderDropdown overlay={menu}>
            <span className={`${styles.action} ${styles.account}`}>
              <Avatar
                size="small"
                className={styles.avatar}
                src={currentUser.avatar}
                alt="avatar"
              />
              <span className={styles.name}>{currentUser.name}</span>
            </span>
          </HeaderDropdown>
        ) : (
          <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
        )}
        <SelectLang className={styles.action} /> */}
        <AcyModal width={957} visible={visible} onCancel={this.onhandCancel}>
          <div className={styles.walltitle}>
            <span>Connect Wallet</span>
            <AcyIcon onClick={this.onhandCancel} name="close" />
          </div>
          <AcyCardList title="Select Network">
            <AcyCardList.Thin onClick={this.selectWallet}>
              <AcyIcon name="eth" />
              Ethereum
            </AcyCardList.Thin>
            <AcyCardList.Thin>
              <AcyIcon name="eth" />
              Ethereum
            </AcyCardList.Thin>
            <AcyCardList.Thin>
              <AcyIcon name="eth" />
              Ethereum
            </AcyCardList.Thin>
            <AcyCardList.Thin>
              <AcyIcon name="eth" />
              Ethereum
            </AcyCardList.Thin>
          </AcyCardList>
          <AcyCardList title="Select Wallet" style={{ marginTop: '70px' }}>
            <AcyCardList.Fat>
              <AcyIcon name="eth" big />
              <p>Ethereum</p>
            </AcyCardList.Fat>
            <AcyCardList.Fat>
              <AcyIcon name="eth" big />
              <p>Ethereum</p>
            </AcyCardList.Fat>
            <AcyCardList.Fat>
              <AcyIcon name="eth" big />
              <p>Ethereum</p>
            </AcyCardList.Fat>
            <AcyCardList.Fat>
              <AcyIcon name="eth" big />
              <p>Ethereum</p>
            </AcyCardList.Fat>
          </AcyCardList>
          <AcyCardList style={{ marginTop: '50px' }}>
            <AcyCardList.Agree>
              <AcyCheckBox>
                I have read, understand, and agree to the <strong>Terms of Service</strong>.
              </AcyCheckBox>
            </AcyCardList.Agree>
          </AcyCardList>
        </AcyModal>
        <AcyModal width={957} visible={visibleMetaMask} onCancel={this.onhandCancelMetaMask}>
          <div className={styles.metamasktitle}>
            <span>0xE34780…25f7</span>
            <AcyIcon onClick={this.onhandCancelMetaMask} name="close" />
          </div>
          <AcyCardList title="MetaMask">
            <AcyWarp>
              <div className={styles.coin}>
                <div className={styles.coinname}>
                  <AcyIcon name="eth" width={55} />
                  ETH
                </div>
                <div className={styles.coinprice}>
                  <p>0.5213</p>
                  <p className={styles.dollar}>$615.39</p>
                </div>
              </div>
            </AcyWarp>
          </AcyCardList>
          <AcyCardList style={{ marginTop: '44px' }}>
            <AcyIcon name="view" width={80} title="View" />
            <AcyIcon name="copy" width={80} title="Copy" />
            <AcyIcon name="switch" width={80} title="Switch" />
            <AcyIcon name="disconnect" width={80} title="Disconnect" />
          </AcyCardList>
          <p className={styles.buyCrypto}>Buy Crypto</p>
          <div className={styles.transak}>
            <AcyIcon name="eth" width={60} /> Transak
          </div>
          <div className={styles.clear}>
            <div>
              <p>Recent Transactions</p>
              <p className={styles.subtitle}>No results found</p>
            </div>
            <AcyIcon width={60} title="Clear" onClick={this.onhandCancel} name="clear" />
          </div>
        </AcyModal>
      </div>
    );
  }
}
