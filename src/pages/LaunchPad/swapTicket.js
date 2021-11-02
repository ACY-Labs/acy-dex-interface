import React, { useState, useEffect } from "react";
import SwapInput from './SwapInput';
import styles from './styles.less';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/assets/icon_double_down.svg';
import AcyButton from '@/components/AcyButton';


const TICKETPRICE_USDT = 100;
const TICKETPRICE_ACY  = 1.2;

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
          title={"Ticket"}
          onChangeToken={ amount => {
            setValue(amount)
          }}
          value={value}
          TicketPrice={TICKETPRICE_ACY}
        />
        <div className={styles.double_arrow}>
          <img src={AcyIcon} />
        </div>
        <SwapInput
          title={"USDT"}

          value={value? value * TICKETPRICE_USDT: ''}
          token={'test'}
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