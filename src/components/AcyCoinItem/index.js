import React, { useState, useEffect } from 'react';
import AcyIcon from '@/components/AcyIcon';
import styles from './style.less';
import placeholder from '@/pages/Dao/placeholder-round.png';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { useWeb3React } from '@web3-react/core';
import { BigNumber } from '@ethersproject/bignumber';

// data refer to the token object that contains properties such as symbol, name, and logoURI.
// selectToken is the function to execute when the token row is clicked.
// setAsFav is the function to execute when the star icon is clicked.
const AcyCoinItem = ({
  data,
  selectToken,
  setAsFav,
  hideBalance = false,
  hideFavButton = false,
  customIcon = true,
  isFav = false,
  ...rest
}) => {
  const [balance, setBal] = useState(0);
  const { account, chainId, library, activate } = useWeb3React();

  useEffect(
    () => {
      if (hideBalance) return;
      if (!library || !account || !chainId) return;
      function processString(bal) {
        let decimals = bal.split('.')[0];
        let fraction = bal.split('.')[1] || '0';
        // console.log(`decimals: ${decimals} fraction:${fraction}`);
        const million = BigNumber.from('1000000');
        const billion = BigNumber.from('1000000000');
        const trillion = BigNumber.from('1000000000000');

        const decimalBN = BigNumber.from(decimals);
        let unit = '';
        if (decimalBN.gt(trillion)) {
          decimals = `${decimalBN.div(trillion)}`;
          unit = 'T';
        } else if (decimalBN.gt(billion)) {
          decimals = `${decimalBN.div(billion)}`;
          unit = 'B';
        } else if (decimalBN.gt(million)) {
          decimals = `${decimalBN.div(million)}`;
          unit = 'M';
        }
        decimals = decimals.toString();

        const fractionBN = BigNumber.from(fraction);
        if (fractionBN.gt(trillion)) fraction = `${fractionBN.div(trillion)}`;
        else if (fractionBN.gt(billion)) fraction = `${fractionBN.div(billion)}`;
        else if (fractionBN.gt(million)) fraction = `${fractionBN.div(million)}`;
        fraction = fraction.toString();

        console.log(`decimals: ${decimals}`);
        console.log(fractionBN);
        return `${decimals}${!fractionBN.isZero() ? `.${fraction}` : ''}${unit}`;
      }
      async function getThisTokenBalance() {
        const { address, symbol, decimals } = data;
        const bal = await getUserTokenBalance(
          { address, symbol, decimals },
          chainId,
          account,
          library
        );
        console.log(bal);
        setBal(processString(bal));
      }
      getThisTokenBalance();
    },
    [library, account, chainId]
  );
  return (
    // row container that contains the token icon, symbol, name, balance amount, and star icon.
    <div className={styles.tokenRowContainer} {...rest}>
      {/* token icon container. */}
      {/* display default ethereum icon if customIcon is true, else display the relative token icon. */}
      <div className={styles.tokenRowContent} onClick={() => selectToken(data) || null}>
        <div style={{ width: "13%" }}>
          {customIcon ? (
            <AcyIcon name="eth" />
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '24px',
              }}
            >
              <img
                src={data.logoURI || placeholder}
                alt={data.symbol}
                style={{ maxHeight: '24px', maxWidth: '24px' }}
              />
            </div>
          )}
        </div>

        {/* token symbol container. */}
        <div style={{ width: "17%", color: 'white', fontWeight: '500' }}>{data.symbol}</div>
        
        <div style={{ width: "70%", display: "flex", justifyContent: "space-between"}}>
          {/* token name container. */}
          <div style={{ minWidth: "20%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{data.name}</div>

          {/* token balance container. */}
          <div hidden={hideBalance} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{balance}</div>
        </div>
      </div>

      {/* star button for user to set token as favourite. */}
      {/* star jsx is retrieved from heroicons.com. */}
      <div hidden={hideFavButton} className={styles.favButtonContainer} onClick={setAsFav}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: '1.25rem' }}
          className={styles.favButton}
          viewBox="0 0 20 20"
          fill={ isFav?"#EB5C20":"currentColor"}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>
    </div>
  );
};
export default AcyCoinItem;
