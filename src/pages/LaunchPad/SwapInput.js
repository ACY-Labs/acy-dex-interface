import React, { useState } from 'react';
import { Divider, Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './styles.less';
import Pattern from '@/utils/pattern';
import AcyLogoIcon from '@/assets/icon_acy.svg';
import ticketIcon from '@/assets/icon_swap_ticket1.svg';


const SwapInput = ({
  title,
  onChoseToken,
  onChangeToken,
  value,
  isInput = false,
  TicketPrice,
  ...rest
}) => {
  const [light, setLight] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const onChange = e => {
    const check = Pattern.coinNum.test(e.target.value);
    if (check) { 
      onChangeToken(e.target.value);
    }
  };
  const onBlur = () => {
    setLight(false);
  };
  const onFocus = () => {
    setLight(true);
    inputRef.current.focus();
  };
  const onChose = () => {

  };
  const inputRef = React.createRef();
  return (
    <div
      {...rest}
      className={styles.acycuarrencycard}
      tabindex="-1"
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className={`${styles.cua_body} ${light && styles.cua_light}`}>
        <div className={styles.coinContainer}>
          <div className={styles.cua_group}>
            <div className={styles.switchcoin}>
              <div className={styles.wrap}>
                <div className={styles.coin}>
                  {  isInput && (
                  <div style={{display: 'flex', justifyContent:'center', alignItems:'center'}}>
                    <img src='https://storageapi2.fleek.co/chwizdo-team-bucket/ACY%20Token%20List/USDT.svg' alt="" style={{ width: '24px', marginTop:'2px'}} />
                    <span style={{ margin: '0 0.35rem' }}>{title}</span>
                  </div>
                  )}

                  {  !isInput && (
                    <div style={{ display: 'flex', justifyContent:'center', alignItems:'center'}}>
                      <img src={ticketIcon} alt="" style={{ width: '24px', marginTop:'2px'}} />
                      <span style={{ margin: '0px 0.35rem' }}>{title}</span>
                    </div>
                  )}
                </div>
              </div>            
            </div>
            
            <input
              ref={inputRef}
              disabled={!isInput}
              className={styles.input}
              placeholder="0"
              bordered={false}
              value={value}
              onChange={onChange}
            />
          </div>
          {
          TicketPrice && (
            <div>
            <div className={styles.cua_blanace}>
              {  value? (TicketPrice * value * 100).toFixed(1):0 }
              <span>&nbsp;</span>
              ACY
            </div>
            
            </div>
          )
        }
        </div>
      </div>
    </div>
  );
};
export default SwapInput;
