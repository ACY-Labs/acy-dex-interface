import { getFarmsContract, getTokenContract, getPairContract } from '@/acy-dex-swap/utils';


// method to retrieve token symbol based on the given token address.
const getTokenSymbol = async (address, library, account) => {
  const tokenContract = getTokenContract(address, library, account);
  return tokenContract.symbol();
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
        const rewardTokensSymbolsRequests = [];
        rewardTokensAddresses.forEach((address) => {
          rewardTokensSymbolsRequests.push(getTokenSymbol(address, library, account));
        });
        const rewardTokensSymbols = await Promise.all(rewardTokensSymbolsRequests).then(
          symbols => symbols
        );
        const lpTokenContract = await getPairContract(poolInfo[0], library, account)
        const token0 = await lpTokenContract.token0()
        const token1 = await lpTokenContract.token1()
        const token0Symbol = await getTokenSymbol(token0, library, account)
        const token1Symbol = await getTokenSymbol(token1, library, account)

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
        };
      })()
    );
  }

  return Promise.all(poolInfoRequests).then(res => {
    return res;
  });
};

export { getAllPools };
