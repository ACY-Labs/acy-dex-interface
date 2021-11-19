import React, { useState, useEffect, useCallback } from "react";
import { Collapse, Tooltip, Button, Icon, Row } from 'antd';
import InputEmail from "./inputEmail";
import styled from "styled-components";
import SwapTicket from "./swapTicket";
import styles from "./styles.less";
import prevIcon from '@/assets/icon_prevpage.svg';
import nextIcon from '@/assets/icon_nextpage.svg';
import userIcon from '@/assets/icon_user.svg';
import telegramIcon from '@/assets/icon_telegram_black.svg';
import twitterBIcon from '@/assets/icon_twitter_black.svg';
import twitterWIcon from '@/assets/icon_twitter_white.svg';
import twitterRetweetIcon from '@/assets/icon_twitter_retweet.svg';
import invFriendsIcon from '@/assets/icon_invite_friends.svg';
import AntCollapse from "./CustomCollapse";
import axios from "axios";

const FollowTelegram = ({
    setSelectedForm
  }) => {
  const panelIdx = ["1","2","3","4", "5", "6"]
  const rewardsArr = ['+5', '+10', '+15']
  const [showInput, setShowInput] = React.useState(false)
  const [showForm, setShowForm] = useState(false)
  const [allowNext, setAllowNext] = useState(true)
  const [clicked, setClicked] = useState({
    1 : true,
    2 : true,
    3 : true,
    4 : true,
    5 : true,
    6 : true
  })
  const [show, setShow] = useState({
    1 : false,
    2 : false,
    3 : false,
    4 : false,
    5 : false,
    6 : false
  }) 
  const [followed, setFollowed] = useState({
    1 : false,
    2 : false,
    3 : false,
    4 : false,
    5 : false,
    6 : false
  })

  let count = 0;

  const onClick = () => setShowInput(true)

  const onLinkClick = (n) => {
    const val = !clicked[n]
    setClicked(prev => ({...prev, [n] : val}))
  }

  const handleFollow = (idx) => {
    const val = !followed[idx]
    setFollowed(prev => ({...prev, [idx] : val}))
    count += 1
  }

  const handleShow = (panelId) => {
    const val = !show[panelId]
    // setShow(prev => ({...prev, [panelId] : val}))
    // setShow(prev => Object.fromEntries(Object.entries(prev).map(([k, v]) => Number(k) !== panelId ? [k, !v] : [k, false])))
    Object.fromEntries(Object.keys(show).map((k) => [k, false]))
    setShow(prev => ({...prev, [panelId] : val}))
  }

  useEffect(() => {
    if(count >= 3) setAllowNext(false)
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
            accordion 
            bordered={false} 
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
            >
              <div className={styles.emailContainer}>
                <div>
                  <div className={styles.emailBox}>
                    <div>
                      <StyledInput 
                        value={name} 
                        required 
                        placeholder="Full Name" 
                        onChange={(e) => { setName(e.target.value);}} 
                      />
                    </div>
                    <div>
                      <StyledInput 
                        required 
                        placeholder="Email Address" 
                        value={email} 
                        onChange={(e) => { setEmail(e.target.value);}} 
                      />
                    </div>
                    {hasError && <small className={errorText}>{errorMsg}</small>}
                  </div>
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>
      </div>
    </div>
  );
}

export default FollowTelegram;