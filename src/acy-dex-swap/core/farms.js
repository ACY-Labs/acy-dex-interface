/* eslint-disable no-loop-func */
import { formatUnits, parseUnits } from '@ethersproject/units';
import {
  getFarmsContract,
  getTokenContract,
  getPairContract,
  checkUserHasSufficientLPBalance,
  checkTokenIsApprovedWithSpender,
  calculateGasMargin,
  approveTokenWithSpender,
  FARMS_ADDRESS,
  CustomError,
} from '@/acy-dex-swap/utils';

// method to retrieve token symbol based on the given token address.
const getTokenSymbol = async (address, library, account) => {
  const tokenContract = getTokenContract(address, library, account);
  return tokenContract.symbol();
};

const getTokenDecimal = async (address, library, account) => {
  const tokenContract = getTokenContract(address, library, account);
  return tokenContract.decimals();
};

const getPoolTotalPendingReward = async (
  rewardTokens,
  rewardTokensAddresses,
  userPositions,
  farmContract,
  poolIndex,
  library,
  account
) => {
  // if user does not have any positions (does not deposit any lp tokens into this pool),
  // returns 0 to all pending reward tokens.
  if (userPositions.length === 0) {
    const totalPendingRewards = [];
    for (let tX = 0; tX < rewardTokens.length; tX++) {
      totalPendingRewards.push(0);
    }
    return totalPendingRewards;
  }

  // collect and gather user pending reward of the tokens in the pool of this iteration.
  // gather the returned promises after invoking the pending method into a multi-array.
  // first level of array includes an array of pending promises of the reward tokens.
  // second level of array includes the individual pending promises of the reward token.
  const allTokenRewardPromises = [];
  for (let rewardIndex = 0; rewardIndex < rewardTokens.length; rewardIndex++) {
    const tokenRewardPromise = [];
    for (let positionIndex = 0; positionIndex < userPositions.length; positionIndex++) {
      tokenRewardPromise.push(
        farmContract.pending(poolIndex, userPositions[positionIndex], rewardTokens[rewardIndex])
      );
    }
    allTokenRewardPromises.push(tokenRewardPromise);
  }

  const allTokenRewardList = [];
  for (let promiseIndex = 0; promiseIndex < allTokenRewardPromises.length; promiseIndex++) {
    allTokenRewardList.push(Promise.all(allTokenRewardPromises[promiseIndex]));
  }

  const allTokenRewardAmountHex = await Promise.all(allTokenRewardList);
  let allTokenTotalRewardAmount = [];

  // retrieve decimals of all of the reward tokens in the same order.
  const rewardTokenDecimalPromises = rewardTokensAddresses.map(token =>
    getTokenDecimal(token, library, account)
  );
  const rewardTokenDecimals = await Promise.all(rewardTokenDecimalPromises);

  allTokenRewardAmountHex.forEach(rewardList => {
    allTokenTotalRewardAmount.push(
      rewardList.reduce((total, currentAmount) => total.add(currentAmount))
    );
  });

  // add decimal points to the pending rewards,
  // according to each token decimal points.
  allTokenTotalRewardAmount = allTokenTotalRewardAmount.map((reward, index) =>
    formatUnits(reward, rewardTokenDecimals[index])
  );

  return allTokenTotalRewardAmount;
};

const getAllPools = async (library, account) => {
  const contract = getFarmsContract(library, account);
  const numPoolHex = await contract.numPools();
  const numPool = numPoolHex.toNumber();
  const poolInfoRequests = [];

  for (let i = 0; i < numPool; i++) {
    poolInfoRequests.push(
      (async () => {
        const poolInfo = await contract.poolInfo(i);
        const rewardTokens = await contract.getPoolRewardTokens(i);
        const rewardTokensAddresses = await contract.getPoolRewardTokenAddresses(i);

        // retrieve reward tokens symbol.
        const rewardTokensSymbolsRequests = [];
        rewardTokensAddresses.forEach(address => {
          rewardTokensSymbolsRequests.push(getTokenSymbol(address, library, account));
        });
        const rewardTokensSymbols = await Promise.all(rewardTokensSymbolsRequests).then(
          symbols => symbols
        );

        // retrieve lp tokens symbol.

        let token0;
        let token1;

        try {
          const lpTokenContract = await getPairContract(poolInfo[0], library, account);
          token0 = await lpTokenContract.token0();
          token1 = await lpTokenContract.token1();
        } catch (e) {
          // not a lp token, maybe a single token?
          token0 = poolInfo[0];
          token1 = null;
        }

        console.log(`lp tokens symbol OK`);
        const token0Symbol = await getTokenSymbol(token0, library, account);
        const token1Symbol = token1 === null ? '' : await getTokenSymbol(token1, library, account);

        // first store all the positions that the user staked in the pool in this iteration.
        // positions returned from getUserPositions are in the base of hex,
        // hence it has to be converted to decimal for use.
        const userPositions = (await contract.getUserPositions(account, i)).map(positionHex =>
          positionHex.toNumber()
        );
        const allTokenTotalRewardAmount = await getPoolTotalPendingReward(
          rewardTokens,
          rewardTokensAddresses,
          userPositions,
          contract,
          i,
          library,
          account
        );

        return {
          poolId: i,
          lpTokenAddress: poolInfo[0],
          token0Symbol,
          token1Symbol,
          lockDuration: poolInfo[1].toNumber(),
          lpBalance: poolInfo[2],
          lastUpdateBlock: poolInfo[3].toNumber(),
          rewardTokens,
          rewardTokensAddresses,
          rewardTokensSymbols,
          rewardTokensAmount: allTokenTotalRewardAmount,
          hasUserPosition: userPositions.length !== 0,
        };
      })()
    );
  }

  return Promise.all(poolInfoRequests).then(res => {
    return res;
  });
};

const deposit = async (lpTokenAddr, amount, poolId, library, account, setButtonText) => {
  console.log('--------- deposit arguments -------------');
  console.log(lpTokenAddr, amount, poolId);
  let status = await (async () => {
    const contract = getFarmsContract(library, account);
    const depositTokenContract = getTokenContract(lpTokenAddr, library, account);
    // const hasBalance = checkUserHasSufficientLPBalance(lpTokenAddr, amount, library, account);

    // if (!hasBalance) return new CustomError(`Insufficient balance`);

    const tokenDecimals = await depositTokenContract.decimals();
    const depositAmount = parseUnits(amount.toString(), tokenDecimals).toString();
    const approved = await checkTokenIsApprovedWithSpender(
      lpTokenAddr,
      FARMS_ADDRESS,
      depositAmount,
      library,
      account
    );

    console.log(`Approval: ${approved}`);

    if (!approved) {
      setButtonText('Approval required');
      approveTokenWithSpender(lpTokenAddr, FARMS_ADDRESS, library, account);
      return new CustomError(`Try again`);
    }

    let args = [poolId, depositAmount];

    console.log(args);
    const options = {};
    let result = await contract.estimateGas['deposit'](...args, options)
      .then(gasEstimate => {
        return contract['deposit'](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...options,
        });
      })
      .catch(e => {
        return new CustomError(`Farms deposit failed with error ${e}`);
      });
    return result;
  })();

  if (status instanceof CustomError) {
    console.log(status.getErrorText());
    setButtonText(status.getErrorText());
  } else {
    console.log(status);
  }
};

const harvestAll = async (poolId, library, account) => {
  const farmContract = getFarmsContract(library, account);
  const response = await farmContract.harvestAll(poolId, false, false);
};

export { getAllPools, deposit, harvestAll };
