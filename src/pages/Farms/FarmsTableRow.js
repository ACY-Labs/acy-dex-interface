import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const FarmsTableRow = (
  { token1, token1Logo, token1Reward, token2, token2Logo, token2Reward, totalApr, tvl, hidden, rowClickHandler }
) => {
  return (
    <div className={styles.tableBodyRowContainer}>

      {/* Table Content */}

      <div className={styles.tableBodyRowContentContainer} onClick={rowClickHandler}>

        {/* Token Title Row */}

        <div className={styles.tableBodyTitleColContainer}>
          <div className={styles.token1LogoContainer}>
            <img src={token1Logo} alt={token1} />
          </div>
          <div className={styles.token2LogoContainer}>
            <img src={token2Logo} alt={token2} />
          </div>
          <div className={styles.tokenTitleContainer}>
            {`${token1}-${token2} LP`}
          </div>
        </div>

        {/* Pending Reward Column */}

        <div className={styles.tableBodyRewardColContainer}>
          <div className={styles.pendingRewardTitleContainer}>Pending Reward</div>
          {token1Reward !== null && (
            <div className={styles.pendingReward1ContentContainer}>
              {`${token1Reward} ${token1}`}
            </div>
          )}
          {token2Reward !== null && (
            <div className={styles.pendingReward2ContentContainer}>
              {`${token2Reward} ${token2}`}
            </div>
          )}
        </div>

        {/* Total APR Column */}

        <div className={styles.tableBodyAprColContainer}>
          <div className={styles.totalAprTitleContainer}>Total APR</div>
          <div className={styles.totalAprContentContainer}>{totalApr}%</div>
        </div>

        {/* TVL Column */}

        <div className={styles.tableBodyTvlColContainer}>
          <div className={styles.tvlTitleContainer}>TVL</div>
          <div className={styles.tvlContentContainer}>${tvl}</div>
        </div>

        {/* Arrow Icon Column */}

        <div className={styles.tableBodyArrowColContainer}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.arrowIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Table Drawer */}

      <div className={styles.tableBodyDrawerContainer} hidden={hidden}>
        Hello
      </div>
    </div>
  )
}

export default FarmsTableRow
