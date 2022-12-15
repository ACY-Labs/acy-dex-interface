import React, { useState, useEffect } from 'react';
import { Card, Icon, Input, Row, Col } from 'antd';
import AcyIcon from '@/components/AcyIcon';
import styles from './index.less';
import classname from 'classnames';
import Pattern from '@/utils/pattern';
import { getAllSupportedTokensPrice,getTokenPrice } from '@/acy-dex-swap/utils';
import { useChainId } from '@/utils/helpers';

const AcyCuarrencyCard = ({
  title,
  logoURI,
  icon,
  coin,
  yuan,
  dollar,
  onChoseToken,
  onChangeToken,
  setTokenAmount,
  amountChanged,
  token,
  isLocked,
  inputColor,
  library,
  onClickTitle,
  ...rest
}) => {
  const { chainId } = useChainId();
  const [light, setLight] = useState(false);
  const [tokenPrice,setTokenPrice] = useState(0);
  const [tokenDisplayAmount,setTokenDisplayAmount] = useState(0);
  const onChange = e => {
    console.log("A",e.target.value);
    const check = Pattern.coinNum.test(e.target.value);
    if (check) {
      onChangeToken && onChangeToken(e.target.value);
      // setTokenAmount(e.target.value);
      setTokenDisplayAmount(e.target.value);
    }
    console.log("B",e.target.value)
  };

  useEffect(()=>{
    console.log("tokenDisplayAmount1",tokenDisplayAmount)
    const timeoutId = setTimeout(()=>{
      console.log("tokenDisplayAmount2",tokenDisplayAmount)
      setTokenAmount(tokenDisplayAmount)
      amountChanged(tokenDisplayAmount)
    },1500)
    return ()=>clearTimeout(timeoutId)
  },[tokenDisplayAmount])

  useEffect(()=>{
    setTokenDisplayAmount(token)
  },[token])

  const onBlur = () => {
    setLight(false);
  };
  const onFocus = () => {
    setLight(true);
    inputRef.current.focus();
  };

  const [usdValue, setUsdValue] = useState(null);
  // get token price from backend
  useEffect(async()=>{
    const _tokenPrice = await getTokenPrice(coin.address,chainId)
    setTokenPrice(_tokenPrice)
    console.log("tokenprice, token", tokenPrice, token)
  },[coin])
  // calculate usd value when user input token amount
  useEffect(async () => {
    if (tokenDisplayAmount == 0)
      setUsdValue(0);
    else if (!tokenDisplayAmount)
      setUsdValue(null);
    const tokenAmountUSD = tokenPrice * tokenDisplayAmount;
    setUsdValue(tokenAmountUSD.toFixed(2));
    console.log("UsdValue",usdValue)
  }, [coin, tokenDisplayAmount])

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
          <input
              ref={inputRef}
              className={styles.input}
              style={{ color: inputColor }}
              placeholder="0.0"
              bordered={false}
              value={tokenDisplayAmount}
              onChange={onChange}
            />
          <button className={styles.switchcoin} onClick={onChoseToken} disabled={isLocked}>
            <span className={styles.wrap}>
              <div className={styles.coin}>
                <img src={logoURI} style={{ width: '24px', marginRight: '0.5rem' }} />
                <span style={{ margin: '0px 0.25rem' }}>{coin.symbol}</span>
              </div>
              {!isLocked && (
                <AcyIcon.MyIcon type="triangleGray" width={10} />
              )}
            </span>
          </button>
        </div>
          {rest.bonus && rest.bonus != 0
          ? <div className={classname(styles.cua_group, styles.bonus)}>{rest.bonus > 0 ? "+" + rest.bonus : rest.bonus}</div>
          : null}
        <div className={styles.cua_bottomContainer}>
          <div className={styles.cua_blanace}
          onClick={onClickTitle}
          >{title || ''}</div>
          <div>{rest.showBalance && !isNaN(usdValue) ? `$ ${usdValue}` : null}</div>
        </div>
      </div>
    </div>
  );
};
export default AcyCuarrencyCard;
