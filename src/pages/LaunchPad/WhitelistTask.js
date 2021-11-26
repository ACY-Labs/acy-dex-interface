import React, { useState, useEffect, useCallback } from "react";
import { Collapse, Tooltip, Button, Icon, Row } from 'antd';
import styled from "styled-components";
import InputEmail from "./inputEmail";
import styles from "./styles.less";
import userIcon from '@/assets/icon_user.svg';
import telegramIcon from '@/assets/icon_telegram_black.svg';
import twitterBIcon from '@/assets/icon_twitter_black.svg';
import twitterWIcon from '@/assets/icon_twitter_white.svg';
import twitterRetweetIcon from '@/assets/icon_twitter_retweet.svg';
import invFriendsIcon from '@/assets/icon_invite_friends.svg';
import TwitterComponent from "./twitterComponent";


const FollowTelegram = ({
    setSelectedForm
  }) => {
  const rewardsArr = ['+5', '+10', '+15']
  const [showInput, setShowInput] = React.useState(false)
  const [allowNext, setAllowNext] = useState(true)
  const [clicked, setClicked] = useState({
    1 : true,
    2 : true,
    3 : true,
    4 : true,
    5 : true,
    6 : true
  })
  const [followed, setFollowed] = useState({
    1 : false,
    2 : false,
    3 : false,
    4 : false,
    5 : false,
  })
  const [open, setOpen] = useState([]);
  const [count, setCount] = useState(0);

  const onClick = () => setShowInput(true)

  const handlePanelClose = () => {
    setOpen([]);
  };

  const onLinkClick = (n) => {
    const val = !clicked[n]
    setClicked(prev => ({...prev, [n] : val}))
  }

  const handleFollow = (idx) => {
    const val = !followed[idx]
    setFollowed(prev => ({...prev, [idx] : val}))
    setCount(prev => prev + 1)
  }

  useEffect(() => {
    if(count >= 2) setAllowNext(false)
  }, [count]);
  
  const links = [
    "https://t.me/acyfinance", 
    "https://t.me/ACYFinanceChannel"
  ]

  const buttonStyle1 = {
    backgroundColor: "#c6224e", 
    width: 'auto', 
    color: 'white', 
    height: "2em", 
    fontSize:'15px', 
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center',
  }

  const buttonStyle2 = {
    backgroundColor: "#c6224e", 
    width: 'auto', 
    color: 'white', 
    height: "2em", 
    fontSize:'15px', 
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center',
    margin:'10px 0'
  }

  const StyledInput = styled.input`
  font-size: 15px;
  background-color: inherit;
  color: lighten(#000000, 100%);
  width: 95%;
  border-width: 1px;
  align-self: center;
  line-height: 30px;
  border-right: 0px solid transparent;
  border-top: 0px solid transparent;
  border-left: 0px solid transparent;
  margin-bottom: 10px;
  &:focus {
    outline-width: 0;
    filter: brightness(75%);
  }
`;

  const errorText = {
    color:'#e53e3e',
    fontFamily:'Inter, sans-serif'
  }

  const { Panel } = Collapse;

  // api
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("An error occured");
  const [success, setSuccess] = useState(false);

  let subscribe = useCallback(() => {
    setHasError(false);
    console.log("Subscribe!");
    if (!name.length || !email.length) {
      setHasError(true);
      setErrorMsg("Fields cannot be empty");
      return;
    }
    // eslint-disable-next-line no-undef
    axios
      .post("/api/subscribe/add", {
        name,
        email,
      })
      .then((res) => {
        setHasError(false);
        setSuccess(true);
      })
      .catch((e) => {
        setHasError(true);
        setErrorMsg(e.response.data || "Error");
      });
  }, [name, email]);
  
  return (
    <div className={styles.telegramBox}>
      <div className={styles.telegramContainer}>
        <div className={styles.telegramLinks}>
          <Collapse 
            className={styles.myCollapse} 
            ghost 
            activeKey={open}
            accordion
            onChange={(panelKey) => setOpen(prev => [panelKey])}
            expandIcon={
              ({ isActive, isFollowed, panelKey }) => !isFollowed ? 
                    ( 
                      isActive ? 
                      <Icon type="down" /> 
                      :
                      <div className={styles.themeBox}>
                        <span style={{color:'#29292c', fontWeight: '500'}}>{panelKey === "1" ? rewardsArr[0] : (panelKey === "6" ? rewardsArr[2] : rewardsArr[1])}</span>
                      </div>
                    )
                  :
                  <Icon type="check" />
            }
            expandIconPosition='right'
          >
            <Panel 
              header={
                <div style={{width:'85%', display:'inline-flex', alignItems:'left'}}>
                  <img src={userIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span>Enter your Username and Email</span>
                </div>
              }
              key="1"
              disabled={followed[1]}
            >
              <div className={styles.emailContainer}>
                <div>
                  <InputEmail />
                </div>
              </div>
            </Panel>
            <Panel 
              header={
                <div style={{width:'85%', display:'inline-flex', alignItems:'left'}}>
                  <img src={telegramIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span>Join ACY Telegram Group</span>
                </div>
              } 
              key="2"
              isFollowed={followed[2]}
              disabled={followed[2]}
            >
              <Row type='flex' align='middle' justify='space-around'>
                <Button className={styles.taskBtn} href={links[0]} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(1); onClick();}}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Join
                </Button>
                <Tooltip title="Visit the link to continue">
                  <Button className={styles.taskBtn} onClick={() => {handleFollow(2); handlePanelClose();}} style={buttonStyle1} disabled={clicked[1]}>Continue</Button> 
                </Tooltip>
              </Row>
            </Panel>
            <Panel 
              header={
                <div style={{width:'85%', display:'inline-flex', alignItems:'left'}}>
                  <img src={telegramIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span>Join ACY Telegram Channel</span>
                </div>
              }
              key="3"
              isFollowed={followed[3]}
              disabled={followed[3]}
            >
              <Row type='flex' align='middle' justify='space-around'>
                <Button className={styles.taskBtn} href={links[1]} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(2); onClick();}}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Subscribe
                </Button>
                <Tooltip title="Visit the link to continue">
                  <Button className={styles.taskBtn} onClick={() => {handleFollow(3); handlePanelClose();}} style={buttonStyle1} disabled={clicked[2]}>Continue</Button> 
                </Tooltip>
              </Row>
            </Panel>
            <Panel 
              header={
                <div style={{width:'55%', display:'inline-flex', alignItems:'left'}}>
                  <img src={twitterBIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span>Follow ACY Twitter</span>
                </div>
              } 
              key="4"
              isFollowed={followed[4]}
              disabled={followed[4]}
            >
              <Row type='flex' align='middle' justify='space-around'>
                <a 
                  href="https://twitter.com/intent/follow?https://twitter.com/CycanNetwork&screen_name=CycanNetwork" 
                  target="_blank"
                  rel="noreferrer"
                  className={styles.twitterbtn}
                  onClick={() => {onLinkClick(3); onClick();}}
                  data-size="large" 
                  data-lang="en" 
                  data-show-count="false"
                >
                  <img src={twitterWIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span style={{marginRight:'5px'}}>Follow @ACYFinance</span>
                </a>
                <script async src="https://platform.twitter.com/widgets.js" charset="utf-8" /> 
                <Tooltip title="Visit the link above to continue">
                  <Button className={styles.taskBtn} onClick={() => {handleFollow(4); handlePanelClose();}} style={buttonStyle1} disabled={clicked[3]}>Continue</Button> 
                </Tooltip>
              </Row>
            </Panel>
            <Panel 
              header={
                <div style={{width:'60%', display:'inline-flex', alignItems:'left'}}>
                  <img src={twitterBIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span>Retweet ACY Twitter</span>
                </div>
              } 
              key="5"
              isFollowed={followed[5]}
              disabled={followed[5]}
            >
              <Row type='flex' align='middle' justify='space-around'>
                {/* <a 
                  className={styles.twitterbtn}
                  href="https://twitter.com/intent/retweet?tweet_id=1458721380027928582"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {onLinkClick(4); onClick();}}
                  data-size="large"
                >
                  <img src={twitterRetweetIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span style={{marginRight:'5px'}}>Retweet</span>
                </a> */}
                <TwitterComponent />
                <Tooltip title="Visit the link above to continue">
                  <Button className={styles.taskBtn} onClick={() => {handleFollow(5); handlePanelClose();}} style={buttonStyle1} disabled={clicked[4]}>Continue</Button> 
                </Tooltip>
              </Row>
            </Panel>
            <Panel 
              header={
                <div style={{width:'75%', display:'inline-flex', alignItems:'left'}}>
                  <img src={invFriendsIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                  <span>Invite Friends to Join ACY IDO</span>
                </div>
              } 
              key="6"
              disabled={followed[6]}
            >
              <Row type='flex' align='middle' justify='space-around'>
                <Button className={styles.taskBtn} type="primary" href={links[0]} target="_blank" style={buttonStyle1} icon="link">Share Your Link To Your Friends</Button>
              </Row>
            </Panel>
          </Collapse>
          <Row type='flex' align='middle' justify='space-around'>
            <Button style={buttonStyle2} disabled={allowNext} onClick={() => {setSelectedForm(2)}}>Enter the Whitelist</Button>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default FollowTelegram;