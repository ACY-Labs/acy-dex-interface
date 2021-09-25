import { BigNumber } from '@ethersproject/bignumber';
import { getFarmsContract, getTokenContract, getPairContract } from '@/acy-dex-swap/utils';


// method to retrieve token symbol based on the given token address.
const getTokenSymbol = async (address, library, account) => {
  const tokenContract = getTokenContract(address, library, account);
  return tokenContract.symbol();
};

const getTokenDecimal = async (address, library, account) => {
  const tokenContract = getTokenContract(address, library, account)
  return await tokenContract.decimals()
}

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
        rewardTokensAddresses.forEach((address) => {
          rewardTokensSymbolsRequests.push(getTokenSymbol(address, library, account));
        });
        const rewardTokensSymbols = await Promise.all(rewardTokensSymbolsRequests).then(
          (symbols) => symbols
        );

        // retrieve lp tokens symbol.
        const lpTokenContract = await getPairContract(poolInfo[0], library, account)
        const token0 = await lpTokenContract.token0()
        const token1 = await lpTokenContract.token1()
        const token0Symbol = await getTokenSymbol(token0, library, account)
        const token1Symbol = await getTokenSymbol(token1, library, account)

        // first store all the positions that the user staked in the pool in this iteration.
        // positions returned from getUserPositions are in the base of hex,
        // hence it has to be converted to decimal for use.
        const userPositions = (await contract.getUserPositions(account, i)).map((positionHex) => positionHex.toNumber())

        const allTokenRewardPromises = []
        for (let rewardIndex = 0; rewardIndex < rewardTokens.length; rewardIndex++) {
          const tokenRewardPromise = []
          for (let positionIndex = 0; positionIndex < userPositions.length; positionIndex++) {
            tokenRewardPromise.push(contract.pending(i, userPositions[positionIndex], rewardTokens[rewardIndex]))
          }
          allTokenRewardPromises.push(tokenRewardPromise)
        }

        const allTokenRewardList = []
        for (let promiseIndex = 0; promiseIndex < allTokenRewardPromises.length; promiseIndex++) {
          allTokenRewardList.push(Promise.all(allTokenRewardPromises[promiseIndex]))
        }

        const allTokenRewardAmountHex = await Promise.all(allTokenRewardList)
        const allTokenTotalRewardAmount = []

        // retrieve decimals of all of the reward tokens in the same order.
        const rewardTokenDecimalPromises = rewardTokensAddresses.map((token) => getTokenDecimal(token, library, account))
        const rewardTokenDecimals = await Promise.all(rewardTokenDecimalPromises)

        allTokenRewardAmountHex.forEach((rewardList, index) => {
          allTokenTotalRewardAmount.push(rewardList.reduce(
            (total, currentAmount) =>
              total.add(currentAmount)).div(BigNumber.from(10).pow(rewardTokenDecimals[index])).toString())
        })


        return {
          lpTokenAddress: poolInfo[0],
          token0Symbol,
          token1Symbol,
          lockDuration: poolInfo[1].toNumber(),
          lpBalance: poolInfo[2],
          lastUpdateBlock: poolInfo[3].toNumber(),
          rewardTokens,
          rewardTokensAddresses,
          rewardTokensSymbols,
          rewardTokensAmount: allTokenTotalRewardAmount
        };
      })()
    );
  }

  return Promise.all(poolInfoRequests).then(res => {
    return res;
  });
};

export { getAllPools };
