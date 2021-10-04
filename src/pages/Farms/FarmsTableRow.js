import React, { forwardRef, useState, useEffect } from 'react';
import styles from '@/pages/Farms/Farms.less';
import { isMobile } from 'react-device-detect';
import { harvestAll } from '@/acy-dex-swap/core/farms';
import { getUserTokenBalanceWithAddress } from '@/acy-dex-swap/utils';
import StakeModal from './StakeModal';

const FarmsTableRow = ({
  index,
  lpTokens,
  poolId,
  stakedTokenAddr,
  token1,
  token1Logo,
  token2,
  token2Logo,
  totalApr,
  tvl,
  hidden,
  rowClickHandler,
  pendingReward,
  walletConnected,
  connectWallet,
  hideArrow = false,
  chainId,
  account,
  library,
}) => {
  const [balance, setBalance] = useState(12345);
  const [isHarvestDisabled, setIsHarvestDisabled] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const hideModal = () => setIsModalVisible(false);
  const showModal = () => setIsModalVisible(true);

  useEffect(
    () => {
      if (!stakedTokenAddr || !chainId || !account || !library) return;
      async function getFarmTokenUserBalance() {
        const bal = await getUserTokenBalanceWithAddress(
          stakedTokenAddr,
          chainId,
          account,
          library
        );
        console.log(bal);
        setBalance(bal);
      }
      getFarmTokenUserBalance();
    },
    [stakedTokenAddr]
  );

  return (
    <div className={styles.tableBodyRowContainer}>
      {/* Table Content */}
      <div className={styles.tableBodyRowContentContainer} onClick={rowClickHandler}>
        {/* Token Title Row */}
        <div className={styles.tableBodyTitleColContainer}>
          {token1Logo && (
            <div className={styles.token1LogoContainer}>
              <img src={token1Logo} alt={token1} />
            </div>
          )}

          {/* conditionally hide and show token 2 logo. */}
          {/* if token 2 is undefined or null, hide token 2 logo. */}
          {token2Logo && (
            <div className={styles.token2LogoContainer}>
              <img src={token2Logo} alt={token2} />
            </div>
          )}

          {/* conditionally hide and show token 2 symbol */}
          {/* only display token 1 symbol if token 2 is undefined or null. */}
          <div className={styles.tokenTitleContainer}>
            {token1 && token2 && `${token1}-${token2}`}
            {token1 && !token2 && `${token1}`}
            {token2 && !token1 && `${token2}`}
            {!isMobile ? token1 && token2 && <span style={{ opacity: '0.5' }}> LP</span> : ''}
          </div>
        </div>

        {/* Pending Reward Column */}
        <div className={styles.tableBodyRewardColContainer}>
          <div className={styles.pendingRewardTitleContainer}>
            {isMobile ? 'Reward' : 'My Reward'}
          </div>
          {pendingReward.map(reward => (
            <div className={styles.pendingReward1ContentContainer}>
              {`${reward.amount} ${reward.token}`}
            </div>
          ))}
        </div>

        {/* Total APR Column */}
        <div className={styles.tableBodyAprColContainer}>
          <div className={styles.totalAprTitleContainer}>APR</div>
          <div className={styles.totalAprContentContainer}>{totalApr}%</div>
        </div>

        {/* TVL Column */}
        {!isMobile && (
          <div className={styles.tableBodyTvlColContainer}>
            <div className={styles.tvlTitleContainer}>TVL</div>
            <div className={styles.tvlContentContainer}>${tvl}</div>
          </div>
        )}

        {/* Arrow Icon Column */}
        {!hideArrow && (
          <div className={styles.tableBodyArrowColContainer}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.arrowIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Table Drawer */}
      <div className={styles.tableBodyDrawerContainer} hidden={hidden}>
        {/* Add Liquidity Column */}
        <div className={styles.tableBodyDrawerLiquidityContainer}>
          <div>Add Liquidity:</div>
          <div>
            <a className={styles.tableCodyDrawerLiquidityLink}>
              {token2 ? `${token1}-${token2}` : `${token1}`} {!isMobile ? 'LP' : ''}
            </a>
          </div>
        </div>

        {/* Harvest Reward Column */}
        <div className={styles.tableBodyDrawerRewardContainer}>
          <div className={styles.tableBodyDrawerRewardTitle}>Pending Reward</div>
          <div className={styles.tableBodyDrawerRewardContent}>
            <div className={styles.tableBodyDrawerRewardTokenContainer}>
              {pendingReward.map(reward => (
                <div className={styles.pendingReward1ContentContainer}>
                  {`${reward.amount} ${reward.token}`}
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.tableBodyDrawerRewardHarvestButton}
              style={isHarvestDisabled ? { cursor: 'not-allowed' } : {}}
              onClick={() => harvestAll(index, library, account, setIsHarvestDisabled)}
              disabled={isHarvestDisabled}
            >
              Harvest
            </button>
          </div>
        </div>

        {/* Farm Column */}
        <div className={styles.tableBodyDrawerFarmContainer}>
          <div className={styles.tableBodyDrawerWalletTitle}>Start Farming</div>
          <div>
            {walletConnected ? (
              <button
                type="button"
                className={styles.tableBodyDrawerWalletButton}
                onClick={showModal}
              >
                Stake LP
              </button>
            ) : (
              <button
                type="button"
                className={styles.tableBodyDrawerWalletButton}
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      <StakeModal
        onCancel={hideModal}
        isModalVisible={isModalVisible}
        token1={token1}
        token2={token2}
        balance={balance}
        poolId={poolId}
        stakedTokenAddr={stakedTokenAddr}
      />
    </div>
  );
};

export default FarmsTableRow;
