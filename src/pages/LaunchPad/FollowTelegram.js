import React, { useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Button, Icon, Row } from 'antd';
import SwapTicket from "./swapTicket";
import styles from "./styles.less";
import AntCollapse from './CustomCollapse';
import stepComponent from"./stepComponent";


const FollowTelegram = () => {
  const [clicked, setClicked] = useState(true);  
  const [show, setShow] = useState(false);
  const [showForm, setShowForm] = useState(false)
  const [followed, setFollowed] = useState(false);
  
  const handleFollow = () => {
    setFollowed(prev => !prev)
  }

  const handleShow = () => {
    setShow(false)
  }

  const links = "https://www.youtube.com/"

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

  let history = useHistory();

  return (
    <div className={styles.telegramBox}>
      { !showForm ? (
        <div className={styles.telegramContainer}>
          <div className={styles.telegramText}>
            <h2>Join ACY on Telegram and Twitter</h2>
          </div>
          <div className={styles.telegramLinks}>
            <AntCollapse isFollowed={followed} show={show} keys="1" setShow={setShow} id={styles.telegramHeader1} header="Follow ACY Finance on Telegram">
              <Row type='flex' align='middle' justify='center'>
                <Button href={links} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Subscribe
                </Button>
              </Row>
              <span className={styles.greyLine}> </span>
              <Row type='flex' align='middle' justify='center'>
                <Button onClick={() => {handleFollow(); handleShow(); }} style={buttonStyle2} disabled={clicked}>Continue</Button> 
                <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
              </Row>
            </AntCollapse>
            <AntCollapse className={styles.telegramPanel1} isFollowed={followed} show={show} key="2" setShow={setShow} header="Follow ACY Finance on Telegram">
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
            <AntCollapse isFollowed={followed} keys={show} id={styles.telegramHeader1} key="3" header="Follow ACY Finance on Twitter">
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
            <AntCollapse isFollowed={followed} show={show} setShow={setShow} id={styles.telegramHeader1} header="Retweet ACY Finance on Twitter">
              <Row type='flex' align='middle' justify='center'>
                <Button href={links} target="_blank" style={buttonStyle1} onClick={() => setClicked(false)}>
                  <Icon type="link" style={{ color: '#fff' }} theme="outlined" />
                  Subscribe
                </Button>
              </Row>
              <span className={styles.greyLine}> </span>
              <Row type='flex' align='middle' justify='center'>
                <Button onClick={() => {handleFollow(); handleShow(); }} style={buttonStyle2} disabled={clicked}>Continue</Button> 
                <Button type='text' style={{color:'#EB7B59', border:'#f7f7f7', background:'#f7f7f7',height: "2em", fontSize:'16px', margin:'10px 0 0 10px'}}>Cancel</Button>
              </Row>
            </AntCollapse>
            <Row type='flex' align='middle' justify='center'>
              <Button className={styles.swapToggleButton} shape="round" disabled={showForm}>Edit Email</Button>
            </Row>
            <Row type='flex' align='middle' justify='center'>
              <Button className={styles.swapToggleButton} shape="round" disabled={showForm} onClick={() => setShowForm(() => true)}>Swap</Button>
            </Row>
          </div>
        </div>
      ) : (
        <SwapTicket />
      )}
    </div>
  );
}

export default FollowTelegram;