import { getFarmsContract, getTokenContract } from '@/acy-dex-swap/utils';

const getAllPools = async (library, account) => {
  const contract = getFarmsContract(library, account);
  const numPoolHex = await contract.numPools();
  const numPool = numPoolHex.toNumber();
  const poolInfoRequests = [];
  const getTokenSymbol = async addr => {
    const tokenContract = getTokenContract(addr, library, account);
    return tokenContract.symbol();
  };
  for (let i = 0; i < numPool; i++) {
    poolInfoRequests.push(
      (async () => {
        const poolInfo = await contract.poolInfo(i);
        const rewardTokens = await contract.getPoolRewardTokens(i);
        const rewardTokensAddresses = await contract.getPoolRewardTokenAddresses(i);
        const rewardTokensSymbolsRequests = [];
        rewardTokensAddresses.forEach(addr => {
          rewardTokensSymbolsRequests.push(getTokenSymbol(addr));
        });
        const rewardTokensSymbols = await Promise.all(rewardTokensSymbolsRequests).then(
          symbols => symbols
        );

        return {
          lpTokenAddress: poolInfo[0],
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
