import {
  getFarmsContract,
  getTokenContract,
  getPairContract,
  checkUserHasSufficientLPBalance,
  checkTokenIsApproved,
  calculateGasMargin,
  approve,
} from '@/acy-dex-swap/utils';

import { parseUnits } from '@ethersproject/units';

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
        rewardTokensAddresses.forEach(address => {
          rewardTokensSymbolsRequests.push(getTokenSymbol(address, library, account));
        });
        const rewardTokensSymbols = await Promise.all(rewardTokensSymbolsRequests).then(
          symbols => symbols
        );
        const lpTokenContract = await getPairContract(poolInfo[0], library, account);
        const token0 = await lpTokenContract.token0();
        const token1 = await lpTokenContract.token1();
        const token0Symbol = await getTokenSymbol(token0, library, account);
        const token1Symbol = await getTokenSymbol(token1, library, account);

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
        };
      })()
    );
  }

  return Promise.all(poolInfoRequests).then(res => {
    return res;
  });
};

const deposit = async (lpTokenAddr, amount, poolId, library, account) => {
  console.log('--------- deposit arguments -------------');
  console.log(lpTokenAddr, amount, poolId);
  let status = await (async () => {
    const contract = getFarmsContract(library, account);
    const depositTokenContract = getTokenContract(lpTokenAddr, library, account);
    const hasBalance = checkUserHasSufficientLPBalance(lpTokenAddr, amount, library, account);
    const approved = checkTokenIsApproved(lpTokenAddr, amount, library, account);
    if (!hasBalance) return new Error(`Insufficient balance`);

    const tokenDecimals = await depositTokenContract.decimals();
    const depositAmount = parseUnits(amount, tokenDecimals).toString();

    if (!approved) {
      approve(lpTokenAddr, depositAmount, library, account);
      return new Error(`Please approve your tokens first`);
    }

    let args = [poolId, depositAmount];
    const options = {};
    let result = await contract.estimateGas['deposit'](...args, options)
      .then(gasEstimate => {
        return contract[deposit](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...options,
        });
      })
      .catch(e => {
        return new Error(`Farms deposit failed with error ${e}`);
      });
    return result;
  })();

  if (status instanceof Error) {
    console.log(status.getErrorText());
  } else {
    console.log(status);
  }
};

export { getAllPools };
