import React, { useState, useEffect } from 'react';
import AcyIcon from '@/components/AcyIcon';
import {Icon} from "antd";
import styles from './style.less';
import placeholder from '@/pages/Dao/placeholder-round.png';
import { getUserTokenBalance } from '@/acy-dex-swap/utils';
import { useConstantLoader } from '@/constants';
import { BigNumber } from '@ethersproject/bignumber';

// parse number with shortform T,B,M, or return itself.
export function processString(bal) {
  bal = Number.parseFloat(bal);

  const million = 1000000
  const billion = 1000000000
  const trillion = 1000000000000

  let abbrNum = bal.toFixed(2);
  if (bal.toString().split(".")[1] > 3) {
      abbrNum = bal.toFixed(3)
  }
  if ((bal / million).toFixed(2) > 1) {
      abbrNum = (bal / million).toFixed(2) + "M"
  }
  if ((bal / billion).toFixed(2) > 1) {
      abbrNum = (bal / billion).toFixed(2) + "B"
  }
  if ((bal / trillion).toFixed(2) > 1) {
      abbrNum = (bal / trillion).toFixed(2) + "T"
  }
  return abbrNum
}

// data refer to the token object that contains properties such as symbol, name, and logoURI.
// selectToken is the function to execute when the token row is clicked.
// setAsFav is the function to execute when the star icon is clicked.
const AcyCoinItem = ({
  data,
  selectToken = () => null,
  clickCallback,
  actionIcon,
  hideBalance = false,
  customIcon = true,
  isFav = false,
  constBal,
  ...rest
}) => {
  const [balance, setBal] = useState(0);
  const { account, chainId, library } = useConstantLoader();
  const [showActionButton, setShowActionButton] = useState(false);
  useEffect(() => {
    if (clickCallback !== undefined) setShowActionButton(true);
    else setShowActionButton(false);
  }, [clickCallback])

  // loading balance if constBal is not given
  // request balance multiple time have a high cost
  useEffect(
    () => {
      if (hideBalance) return;
      if (!library || !account || !chainId) return;

      if (!constBal) {
        const { address, symbol, decimals } = data; 
        getUserTokenBalance(
          { address, symbol, decimals },
          chainId,
          account,
          library
        ).then((bal) => {
          setBal(processString(bal));
          console.log('made request', data, bal);
        }).catch(err => {
          console.log("Failed to load balance, error param: ", address, symbol, decimals, err);
        })
      }
    },
    [library, account, chainId]
  );
  return (
    // row container that contains the token icon, symbol, name, balance amount, and star icon.
    <div className={styles.tokenRowContainer} {...rest}>
      {/* token icon container. */}
      {/* display default ethereum icon if customIcon is true, else display the relative token icon. */}
      <div className={styles.tokenRowContent} onClick={() => selectToken(data)}>
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

        <div style={{ width: "70%", display: "flex", justifyContent: "space-between" }}>
          {/* token name container. */}
          <div style={{ minWidth: "20%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{data.name}</div>

          {/* token balance container. */}
          <div hidden={hideBalance} style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{constBal ? constBal : balance}</div>
        </div>
      </div>

      {/* star button for user to set token as favourite. */}
      {/* star jsx is retrieved from heroicons.com. */}
      <div hidden={!showActionButton} className={styles.favButtonContainer} onClick={showActionButton ? clickCallback : null}>
        {actionIcon ? <Icon type={actionIcon} />
          :
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ height: '1.25rem' }}
            className={styles.favButton}
            viewBox="0 0 20 20"
            fill={isFav ? "#EB5C20" : "currentColor"}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        }

      </div>
    </div>
  );
};
export default AcyCoinItem;