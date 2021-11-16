import React, { useState, useEffect } from "react";
import { Form, Tooltip, Button, Icon, Row } from 'antd';
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

const FollowTelegram = ({
    setSelectedForm
  }) => {
  const panelIdx = ["1","2","3","4", "5", "6"]
  const rewardsArr = ['+5', '+10', '+15']
  const [name, setName] = useState("")
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

 

  return (
    <div className={styles.telegramBox}>
      <div className={styles.telegramContainer}>
        <div className={styles.telegramLinks}>
          <AntCollapse 
            isFollowed={followed[1]} 
            show={show[1]} 
            panelID={panelIdx[0]} 
            rewards={rewardsArr[0]}
            setShow={setShow} 
            disabled={followed[1]} 
            header={
              <div style={{width:'85%', display:'inline-flex', alignItems:'left'}}>
                <img src={userIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                <span>Enter your Username and Email</span>
              </div>
            }
          >
            <InputEmail />
            <Row type='flex' align='middle' justify='center'>
              <Button onClick={() => {handleShow(1); handleShow(1);}} style={buttonStyle1} disabled={clicked}>Submit</Button> 
            </Row>
          </AntCollapse>
          <AntCollapse 
            isFollowed={followed[2]} 
            show={show[2]} 
            panelID={panelIdx[1]} 
            rewards={rewardsArr[1]}
            setShow={setShow} 
            disabled={followed[2]} 
            header={
              <div style={{width:'85%', display:'inline-flex', alignItems:'left'}}>
                <img src={telegramIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                <span>Join ACY Telegram Group</span>
              </div>
            }
          >
            <Row type='flex' align='middle' justify='space-around'>
              <Button id='linkbtn' href={links[0]} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(1); onClick();}}>
                <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                Join
              </Button>
              <Tooltip title="Visit the link to continue">
                <Button onClick={() => {handleFollow(2); handleShow(2); }} style={buttonStyle1} disabled={clicked[1]}>Continue</Button> 
              </Tooltip>
            </Row>
          </AntCollapse>
          <AntCollapse 
            isFollowed={followed[3]} 
            show={show[3]} 
            panelID={panelIdx[2]} 
            rewards={rewardsArr[1]}
            setShow={setShow} 
            disabled={followed[3]} 
            header={
              <div style={{width:'85%', display:'inline-flex', alignItems:'left'}}>
                <img src={telegramIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                <span>Join ACY Telegram Channel</span>
              </div>
            }
          >
            <Row type='flex' align='middle' justify='space-around'>
              <Button href={links[1]} target="_blank" style={buttonStyle1} onClick={() => {onLinkClick(2); onClick();}}>
                <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                Subscribe
              </Button>
              <Tooltip title="Visit the link to continue">
                <Button onClick={() => {handleFollow(3); handleShow(3); }} style={buttonStyle1} disabled={clicked[2]}>Continue</Button> 
              </Tooltip>
            </Row>
            { showInput ? <userInput /> : null }
          </AntCollapse>
          <AntCollapse 
            isFollowed={followed[4]} 
            show={show[4]} 
            panelID={panelIdx[3]} 
            rewards={rewardsArr[1]}
            setShow={setShow} 
            disabled={followed[4]} 
            header={
              <div style={{width:'55%', display:'inline-flex', alignItems:'left'}}>
                <img src={twitterBIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                <span>Follow ACY Twitter</span>
              </div>
            }
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
                <Button onClick={() => {handleFollow(4); handleShow(4);}} style={buttonStyle1} disabled={clicked[3]}>Continue</Button> 
              </Tooltip>
            </Row>
          </AntCollapse>
          <AntCollapse 
            isFollowed={followed[5]} 
            show={show[5]} 
            panelID={panelIdx[4]} 
            rewards={rewardsArr[1]}
            setShow={setShow} 
            disabled={followed[5]} 
            header={
              <div style={{width:'60%', display:'inline-flex', alignItems:'left'}}>
                <img src={twitterBIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                <span>Retweet ACY Twitter</span>
              </div>
            }
          >
            <Row type='flex' align='middle' justify='space-around'>
              <a 
                className={styles.twitterbtn}
                href="https://twitter.com/intent/retweet?tweet_id=1458721380027928582"
                target="_blank"
                rel="noreferrer"
                onClick={() => {onLinkClick(4); onClick();}}
                data-size="large"
              >
                <img src={twitterRetweetIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                <span style={{marginRight:'5px'}}>Retweet</span>
              </a>
              <Tooltip title="Visit the link above to continue">
                <Button onClick={() => {handleFollow(5); handleShow(5); }} style={buttonStyle1} disabled={clicked[4]}>Continue</Button> 
              </Tooltip>
            </Row>
          </AntCollapse>
          <AntCollapse 
            isFollowed={followed[6]} 
            show={show[6]} 
            panelID={panelIdx[5]} 
            rewards={rewardsArr[2]}
            setShow={setShow} 
            disabled={followed[6]} 
            header={
              <div style={{width:'55%', display:'inline-flex', alignItems:'left'}}>
                <img src={invFriendsIcon} alt="" style={{height:'1.5em', width:'auto', objectFit:'contain', margin: '0 7px 0 0', float:'left'}} />
                <span>Invite Friends to Join ACY IDO</span>
              </div>
            }
          >
            <Row type='flex' align='middle' justify='space-around'>
              <Button type="primary" href={links[0]} target="_blank" style={buttonStyle1} icon="link">Share Your Link To Your Friends</Button>
            </Row>
          </AntCollapse>
          <Row type='flex' align='middle' justify='space-around'>
            {/* <img 
              src={prevIcon} 
              id={styles.nextPage} 
              alt="" 
              style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '15px 0', float:'left'}}
              onClick={() => {setSelectedForm(0)}}  
            />
            <img 
              src={nextIcon} 
              id={styles.nextPage} 
              alt="" 
              style={{height:'1.2em', width:'auto', objectFit:'contain', margin: '15px 0', float:'right'}} 
              onClick={() => {setSelectedForm(2)}}  
            /> */}
            <Button style={buttonStyle2} disabled={allowNext} onClick={() => {setSelectedForm(2)}}>Enter the Whitelist</Button>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default FollowTelegram;