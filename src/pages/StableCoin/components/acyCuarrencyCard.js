import React, { useState, useEffect } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './acyCuarrencyCard.less';
import classname from 'classnames';
import Pattern from '@/utils/pattern';
import { getAllSupportedTokensPrice } from '@/acy-dex-swap/utils';
import { getUserTokenBalance} from '@/acy-dex-usda/utils'


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
  isLocked,
  inputColor,
  library,
  isMax,
  onClickMax,
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
  

  const [usdValue, setUsdValue] = useState(null);
  useEffect(async () => {
    if (token == 0)
      setUsdValue(0);
    else if (!token)
      setUsdValue(null);

    const tokenPriceList = await getAllSupportedTokensPrice();
    const tokenPrice = tokenPriceList[coin];
    const tokenAmountUSD = tokenPrice * token;
    setUsdValue(tokenAmountUSD.toFixed(2));
    console.log("tokenprice, token", tokenPrice, token)
    console.log("test token price: ", coin, tokenPrice);
  }, [coin, token])

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
          <button className={styles.switchcoin} onClick={onChoseToken} disabled={isLocked}>
            <span className={styles.wrap}>
              <div className={styles.coin}>
                <img src={logoURI} style={{ width: '24px', marginRight: '0.5rem' }} />
                <span style={{ margin: '0px 0.25rem' }}>{coin}</span>
              </div>
              {!isLocked && (
                <AcyIcon.MyIcon type="triangleGray" width={10} />
              )}
            </span>
          </button>
          <input
            ref={inputRef}
            className={styles.input}
            style={{ color: inputColor }}
            placeholder="0.0"
            bordered={false}
            value={token}
            onChange={onChange}
          />
        </div>
        <div className={styles.cua_bottomContainer}>
          <div className={styles.cua_blanace}>
            {title || ''}
            {rest.account ? <div className={(isMax && classname(styles.maxButton, styles.disabled)) || styles.maxButton} onClick={() => !isMax && onClickMax()}>Max</div> : null}
          </div>
          <div>{rest.showBalance && !isNaN(usdValue) ? `$ ${usdValue}` : null}</div>
        </div>
      </div>
    </div>
  );
};
export default AcyCuarrencyCard;
