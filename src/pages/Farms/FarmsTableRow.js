import React from 'react';
import styles from '@/pages/Farms/Farms.less';

const FarmsTableRow = (
  { token1, token1Logo, token2, token2Logo, totalApr, tvl, hidden, rowClickHandler, pendingReward }
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
          {pendingReward.map((reward) => (
            <div className={styles.pendingReward1ContentContainer}>
              {`${reward.amount} ${reward.token}`}
            </div>
          ))}
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

        {/* Add Liquidity Column */}

        <div className={styles.tableBodyDrawerLiquidityContainer}>
          <div>Add Liquidity:</div>
          <div><a className={styles.tableCodyDrawerLiquidityLink}>{token1}-{token2} LP</a></div>
        </div>

        {/* Harvest Reward Column */}

        <div className={styles.tableBodyDrawerRewardContainer}>
          <div className={styles.tableBodyDrawerRewardTitle}>Pending Reward</div>
          <div className={styles.tableBodyDrawerRewardContent}>
            <div className={styles.tableBodyDrawerRewardTokenContainer}>
              {pendingReward.map((reward) => (
                <div className={styles.pendingReward1ContentContainer}>
                  {`${reward.amount} ${reward.token}`}
                </div>
              ))}
            </div>
            <button type="button" className={styles.tableBodyDrawerRewardHarvestButton}>Harvest</button>
          </div>
        </div>

        {/* Farm Column */}

        <div className={styles.tableBodyDrawerFarmContainer}>
          <div className={styles.tableBodyDrawerWalletTitle}>Start Farming</div>
          <div>
            <button type="button" className={styles.tableBodyDrawerWalletButton}>Connect Wallet</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmsTableRow
