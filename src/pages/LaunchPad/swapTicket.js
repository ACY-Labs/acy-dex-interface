import React, { useState, useEffect } from "react";
import SwapInput from './SwapInput';
import styles from './styles.less';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/assets/icon_double_down.svg';
import AcyButton from '@/components/AcyButton';


const TICKETPRICE_USDT = 100;
const TICKETPRICE_ACY  = 0.2;

const swapTicket = (props) => {
  const [light, setLight] = useState(false);
  const onBlur = () => {
    setLight(false);
  };
  const onFocus = () => {
    setLight(true);
    inputRef.current.focus();
  };
  const inputRef = React.createRef();
  const [value, setValue] = useState();

  
  return (
    <div>
      <div className={styles.swapContainer}>
        <SwapInput
          title={"USDT"}
          value={value}
          isInput
          onChangeToken={amount => {
            setValue(amount)
            }}
            
        />
          {/* {  isInput && ( */}
          {/* <div style={{ marginRight: '12px', marginBottom: '12px'}}> */}
              {/* <div className={styles.dropdown}>  
                <ul>
                  <li> 
                    <img src='https://storageapi2.fleek.co/chwizdo-team-bucket/ACY%20Token%20List/USDT.svg' style={{ width: '24px', marginRight: '0.5rem' }} />
                    USDT
                  </li>
                  <li> 
                    <img src='https://storageapi2.fleek.co/chwizdo-team-bucket/ACY%20Token%20List/USDC.svg' style={{ width: '24px', marginRight: '0.5rem' }} />
                    USDC
                  </li>
                </ul>
              </div> */}
            {/* )} */}
            {/* </div> */}
        
        {/* <div className={styles.double_arrow}>
          <img src={AcyIcon} />
        </div> */}

        <div className={styles.swaparrow}>
          <Icon style={{ fontSize: '16px', color:'#b5b5b6' }} type="arrow-down" />
        </div>
     
        <SwapInput
          title={"Ticket"}
          
          value={value? Math.trunc(value / TICKETPRICE_USDT): ''}
          TicketPrice={TICKETPRICE_ACY}
        />
        <div className={styles.swap_button}
          onClick={() => {
            console.log('Participate clicked!')
          }}
        >
          Participate
        </div>
      </div>
    </div>
  )
}

export default swapTicket;