import React, { useState } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './styles.less';
import Pattern from '@/utils/pattern';
const SwapInput = ({
  title,
  onChoseToken,
  onChangeToken,
  value,
  calAcy = false,
  TicketPrice,
  ...rest
}) => {
  const [light, setLight] = useState(false);
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
        <div className={styles.cua_group}>
          <button className={styles.switchcoin} onClick={onChoseToken}>
            <span className={styles.wrap}>
              <div className={styles.coin}>
                {/* <img src={logoURI} style={{ width: '24px', marginRight: '0.5rem' }} /> */}
                <span style={{ margin: '0px 0.25rem' }}>{title}</span>
              </div>
              {/* <AcyIcon.MyIcon type="triangleGray" width={10} /> */}
            </span>
          </button>
          <input
            ref={inputRef}
            disabled={!TicketPrice}
            className={styles.input}
            placeholder="0"
            bordered={false}
            value={value}
            onChange={onChange}
            onKeyPress={(event) => {
              if (!/[0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
          />
        </div>
        {
          TicketPrice && (
            <div className={styles.cua_blanace}>{  value? TicketPrice * value:0 } ACY</div>
          )
        }
        
      </div>
    </div>
  );
};
export default SwapInput;
