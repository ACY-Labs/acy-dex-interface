import { getFarmsContract } from '@/acy-dex-swap/utils';

const getAllPools = async (library, account) => {
  const contract = getFarmsContract(library, account);
  const numPoolHex = await contract.numPools();
  const numPool = numPoolHex.toNumber();
  const poolInfoRequests = [];
  const parsedPoolsInfo = [];

  for (let i = 0; i < numPool; i++) {
    poolInfoRequests.push(
      (async () => {
        let poolInfo = await contract.poolInfo(i);
        let rewardTokens = await contract.getPoolRewardTokens(i);
        let rewardTokensAddresses = await contract.getPoolRewardTokenAddresses(i);

        console.log(poolInfo);

        return {
          lpTokenAddress: poolInfo[0],
          lockDuration: poolInfo[1].toNumber(),
          lpBalance: poolInfo[2],
          lastUpdateBlock: poolInfo[3].toNumber(),
          rewardTokens,
          rewardTokensAddresses,
        };
      })()
    );
  }

  Promise.all(poolInfoRequests).then(res => {
    return res;
  });
};

export { getAllPools };
