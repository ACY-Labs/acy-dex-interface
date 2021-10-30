import React, { useState, useCallback } from "react";
import { Collapse, Button, Icon, Row } from 'antd';
import styles from "./styles.less";
import AntCollapse from './CustomCollapse';
import arrowDownIcon from "@/assets/icon_arrow_down.svg";

const FollowTelegram = () => {
  const [clicked, setClicked] = useState(true);  
  let [show, setShow] = useState(false);
  const [showForm, setShowForm] = useState(false)
  const [followed, setFollowed] = useState(false);
  
  const handleFollow = () => {
    setFollowed(prev => !prev)
  }

  const links = "https://www.youtube.com/"

  let avtivePanel = [];

  const buttonStyle1 = {
    background: "#3498DB", 
    border:"#3498DB",
    width: '140px', 
    color: 'white', 
    height: "2em", 
    fontSize:'20px', 
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center',
    boxShadow:"0.5px 0.8px #228CDB"
  }

  const buttonStyle2 = {
    background: "#1ABC9C", 
    border:"#1ABC9C",
    width: '80px', 
    color: 'white', 
    height: "2em", 
    fontSize:'16px', 
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center',
    marginTop:'10px'
  }

  return (
    <div className={styles.telegramBox}>
      <div className={styles.telegramText}>
        <h2>Join ACY on Telegram and Twitter</h2>
      </div>
      <div className={styles.telegramLinks}>
        <AntCollapse className={styles.telegramPanel1} header="Follow ACY Finance on Telegram">
          <Row type='flex' align='middle' justify='center'>
            <Button href={links} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
              <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
              Click Here
            </Button>
          </Row>
          <span className={styles.greyLine}> </span>
          <Row type='flex' align='middle' justify='center'>
            <Button href={links} target="_blank" style={buttonStyle2} disabled={clicked}>Continue</Button> 
            <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
          </Row>
        </AntCollapse>
        <AntCollapse isFollowed={followed} keys={show} changeKeys={(status) => setShow(status)} id={styles.telegramHeader1} key="2" header="Follow ACY Finance on Telegram Announcement Channel">
          <Row type='flex' align='middle' justify='center'>
            <Button href={links} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
              <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
              Subscribe
            </Button>
          </Row>
          <span className={styles.greyLine}> </span>
          <Row type='flex' align='middle' justify='center'>
            <Button onClick={() => {handleFollow();}} style={buttonStyle2} disabled={clicked}>Continue</Button> 
            <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
          </Row>
        </AntCollapse>
        <AntCollapse isFollowed={followed} keys={show} changeKeys={(status) => setShow(status)} id={styles.telegramHeader1} key="3" header="Follow ACY Finance on Twitter">
          <Row type='flex' align='middle' justify='center'>
            <Button href={links} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
              <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
              Subscribe
            </Button>
          </Row>
          <span className={styles.greyLine}> </span>
          <Row type='flex' align='middle' justify='center'>
            <Button onClick={() => {handleFollow();}} style={buttonStyle2} disabled={clicked}>Continue</Button> 
            <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
          </Row>
        </AntCollapse>
        <AntCollapse isFollowed={followed} keys={show} changeKeys={(status) => setShow(status)} id={styles.telegramHeader1} key="4" header="Retweet ACY Finance on Twitter">
          <Row type='flex' align='middle' justify='center'>
            <Button href={links} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
              <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
              Subscribe
            </Button>
          </Row>
          <span className={styles.greyLine}> </span>
          <Row type='flex' align='middle' justify='center'>
            <Button onClick={() => {handleFollow();}} style={buttonStyle2} disabled={clicked}>Continue</Button> 
            <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
          </Row>
        </AntCollapse>
        <Row type='flex' align='middle' justify='center'>
          <Button className={styles.swapToggleButton} shape="round" disabled={showForm} onClick={() => setShowForm(() => true)}>Swap</Button>
        </Row>
      </div>
    </div>
  );
}

export default FollowTelegram;