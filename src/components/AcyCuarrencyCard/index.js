import React, { useState } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './index.less';
import Pattern from '@/utils/pattern';
const AcyCuarrencyCard = ({
  title,
  logoURI,
  icon,
  coin,
  yuan,
  dollar,
  onChoseToken,
  onChangeToken,
  token,
  isFarm,
  inputColor,
  ...rest
}) => {
  const [light, setLight] = useState(false);
  const onChange = e => {
    const check = Pattern.coinNum.test(e.target.value);
    if (check) {
      onChangeToken && onChangeToken(e.target.value);
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
          <button className={styles.switchcoin} onClick={onChoseToken} disabled={isFarm}>
            <span className={styles.wrap}>
              <div className={styles.coin}>
                <img src={logoURI} style={{ width: '24px', marginRight: '0.5rem' }} />
                <span style={{ margin: '0px 0.25rem' }}>{coin}</span>
              </div>
              { !isFarm &&(
                <AcyIcon.MyIcon type="triangleGray" width={10} />
              )}
            </span>
          </button>
          <input
            ref={inputRef}
            className={styles.input}
            style={{color: inputColor}}
            placeholder="0.0"
            bordered={false}
            value={token}
            onChange={onChange}
          />
        </div>
        <div className={styles.cua_bottomContainer}>
          <div className={styles.cua_blanace}>{title || ''}</div>
          <div>{rest.additional}</div>
        </div>
      </div>
    </div>
  );
};
export default AcyCuarrencyCard;
