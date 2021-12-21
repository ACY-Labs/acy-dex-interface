/* eslint-disable no-loop-func */
import { formatUnits, parseUnits } from '@ethersproject/units';
import {
  getFarmsContract,
  getTokenContract,
  getPairContract,
  getContract,
  checkUserHasSufficientLPBalance,
  checkTokenIsApprovedWithSpender,
  calculateGasMargin,
  approveTokenWithSpender,
  FARMS_ADDRESS,
  CustomError,
  getTokenTotalSupply,
  getAllSuportedTokensPrice,
  BLOCK_TIME,
  BLOCKS_PER_YEAR,
  BLOCKS_PER_MONTH,
  RPC_URL,
  API_URL
} from '@/acy-dex-swap/utils';
import { Fetcher, Token, TokenAmount, Pair} from '@acyswap/sdk';
import { abi as FarmsABI } from '../abis/ACYMultiFarm.json';
import Eth from "web3-eth";
import Utils from "web3-utils";
import { Icon } from 'antd';
import { Web3Provider } from "@ethersproject/providers";
import { injected } from '@/connectors';
import supportedTokens from '@/constants/TokenList';
import axios from 'axios';


const ACY_TOKEN  = "0x0100000000000000000000000000000000000000000000000000000000000000";
const USDC_TOKEN = "0x0200000000000000000000000000000000000000000000000000000000000000";
const USDT_TOKEN = "0x0300000000000000000000000000000000000000000000000000000000000000";
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

  // retrieve decimals of all of the reward tokens in the same order.
  const rewardTokenDecimalPromises = rewardTokensAddresses.map(token =>
    getTokenDecimal(token, library, account)
  );
  const rewardTokenDecimals = await Promise.all(rewardTokenDecimalPromises);

  const poolPositons = await farmContract.getPoolPositions(poolIndex);

  const poolTokenRewardInfoPromise = []; 
  for(var i=0; i<rewardTokens.length ; i++){
    poolTokenRewardInfoPromise.push(farmContract.getPoolTokenRewardInfo(poolIndex,rewardTokens[i]));
  }
  //HERE
  const poolRewardsPerYear = await Promise.all(poolTokenRewardInfoPromise).then(result => {
    return result.map((info,index) => info[3]/(10**rewardTokenDecimals[index]) * BLOCKS_PER_YEAR);
  });

  if(poolPositons.length === 0 ){
    const totalPendingRewards = [];
    for (let tX = 0; tX < rewardTokens.length; tX++) {
      totalPendingRewards.push(0);
    }
    return [totalPendingRewards, totalPendingRewards, totalPendingRewards];
  }


  const amountCol = [];
  for(var i=0; i<rewardTokens.length ; i++){
    const amountRow = [];
    for(var j=0; j<poolPositons.length; j++){
      amountRow.push(farmContract.getTotalRewards(poolIndex, poolPositons[j], rewardTokens[i]));
    }
    amountCol.push(amountRow)
  }

  
    
  
  

  let allTokenAmount = [];
  for(var i=0; i<rewardTokens.length ; i++){
    const amountHex = await Promise.all(amountCol[i]).then(re => re);
    allTokenAmount.push(
      amountHex.reduce((total, currentAmount) => total.add(currentAmount))
    );
  }
  allTokenAmount = allTokenAmount.map((reward, index) =>
    formatUnits(reward, rewardTokenDecimals[index])
  );
  // if user does not have any positions (does not deposit any lp tokens into this pool),
  // returns 0 to all pending reward tokens.
  if (userPositions.length === 0) {
    const totalPendingRewards = [];
    for (let tX = 0; tX < rewardTokens.length; tX++) {
      totalPendingRewards.push(0);
    }
    return [allTokenAmount, totalPendingRewards, poolRewardsPerYear];
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

  

  allTokenRewardAmountHex.forEach(rewardList => {
    allTokenTotalRewardAmount.push(
      rewardList.reduce((total, currentAmount) => total.add(currentAmount))
    );
  });

  // add decimals points to the pending rewards,
  // according to each token decimals points.
  allTokenTotalRewardAmount = allTokenTotalRewardAmount.map((reward, index) =>
    formatUnits(reward, rewardTokenDecimals[index])
  );

   // Tan
  const rewards = [];
  allTokenRewardAmountHex.forEach((rewardList,index) => {
    rewardList.forEach((reward,id)=> {
      if(index == 0) {
        rewards.push([formatUnits(reward, rewardTokenDecimals[index])]);
      } else {
        rewards[id].push(formatUnits(reward, rewardTokenDecimals[index]));
      }
    });
  });
  
   //
  

  // return [allTokenTotalRewardAmount, rewards];
  return [allTokenAmount, rewards, poolRewardsPerYear];
};

const getPool = async (library, account, poolId)=> {
  const contract = getFarmsContract(library, account);
  const poolInfo = await contract.poolInfo(poolId);
  const rewardTokens = await contract.getPoolRewardTokens(poolId);
  const rewardTokensAddresses = await contract.getPoolRewardTokenAddresses(poolId);
  const tokenPrice = await getAllSuportedTokensPrice(library);

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
  let lpDecimals = 18;
  try {
    const lpTokenContract = await getPairContract(poolInfo[0], library, account);
    token0 = await lpTokenContract.token0();
    token1 = await lpTokenContract.token1();
    lpDecimals = await lpTokenContract.decimals();
  } catch (e) {
    // not a lp token, maybe a single token?
    token0 = poolInfo[0];
    token1 = null;
  }

  const token0Symbol = await getTokenSymbol(token0, library, account);
  const token1Symbol = token1 === null ? '' : await getTokenSymbol(token1, library, account);

  var token0Amount = 0;
  var token1Amount = 0;
  if(token1) {
    //get pool token amount 
    const pair_contract = await getPairContract(poolInfo[0], library, account);
    const reserves = await pair_contract.getReserves();
    const token0Address = await pair_contract.token0();
    const token0Contract =  getTokenContract(token0Address, library, account);
    // const token0Symbol = await token0Contract.symbol();
    const token0Decimal = await token0Contract.decimals()
    const token_0 = new Token(null, token0Address,token0Decimal, token0Symbol);

    const token1Address = await pair_contract.token1();
    const token1Contract =  getTokenContract(token1Address, library, account);
    // const token1Symbol = await token1Contract.symbol();
    const token1Decimal = await token1Contract.decimals()
    const token_1 = new Token(null, token1Address,token1Decimal, token1Symbol);

    const pair = await Fetcher.fetchPairData(token_0, token_1, library);
    const totalSupply = await getTokenTotalSupply(pair.liquidityToken, library, account);

    const token0Deposited = pair.getLiquidityValue(
      pair.token0,
      totalSupply,
      new TokenAmount(pair.liquidityToken, poolInfo[1]),
      false
    );
    const token1Deposited = pair.getLiquidityValue(
      pair.token1,
      totalSupply,
      new TokenAmount(pair.liquidityToken, poolInfo[1]),
      false
    );
    token0Amount = token0Deposited.toSignificant(4);
    token1Amount = token1Deposited.toSignificant(4);
  }
  // account data
  var allTokenTotalRewardAmount = null;
  var userPositions= null;
  var rewards = null;
  var stakeData = null;
  var rewardsPerYear = null;
  var totalRewardPerYear = 1;
  // first store all the positions that the user staked in the pool in this iteration.
  // positions returned from getUserPositions are in the base of hex,
  // hence it has to be converted to decimals for use.
  if(account) {
    userPositions = (await contract.getUserPositions(account, poolId)).map(positionHex =>
      positionHex.toNumber()
    );
    
    const PendingReward = await getPoolTotalPendingReward(
      rewardTokens,
      rewardTokensAddresses,
      userPositions,
      contract,
      poolId,
      library,
      account
    );
    allTokenTotalRewardAmount = PendingReward[0];
    rewards = PendingReward[1];
    stakeData = [];
    rewardsPerYear = PendingReward[2];
      
    totalRewardPerYear = rewardsPerYear.reduce((total,reward,index) =>
      total += tokenPrice[rewardTokensSymbols[index]] * reward
    );

    if(userPositions.length > 0)
    {
      const stakingPromise = [];
      for(var j=0; j != userPositions.length; j++)
      {
        stakingPromise.push(contract.stakingPosition(poolId,userPositions[j]));
      }
      stakeData = await Promise.all(stakingPromise).then(x =>{
        const stakeDataPromise = [];
        for(var j=0; j != userPositions.length; j++){
          // [ parseInt(x.stakeTimestamp), parseInt(x.lockDuration)]
          const expiredTime = parseInt(x[j].stakeTimestamp)+parseInt(x[j].lockDuration);
          const dueDate = new Date(expiredTime * 1000).toLocaleDateString("en-US")
          const nowDate = Date.now()/1000;
          var diff = expiredTime - nowDate;
          var days = 0, hrs = 0, min = 0, leftSec = 0;

          if(diff>0) {
            diff = Math.floor(diff);
            days = Math.floor(diff/(24*60*60));
            leftSec = diff - days * 24*60*60;
            hrs = Math.floor(leftSec/(60*60));
            leftSec = leftSec - hrs * 60*60;
            min = Math.floor(leftSec/(60));
          }
          const result = {
            lpAmount: formatUnits(x[j].lpAmount,18),
            dueDate: dueDate,
            positionId: userPositions[j],
            reward: rewardTokensSymbols.map((token, index) => ({
              token,
              amount: rewards[j][index],
            })),
            remaining: days.toString() + 'd:' + hrs.toString() + 'h:' + min.toString() +'m',
            locked: diff>0
          }
          const total = rewards[j].reduce((total, currentAmount) => total.add(parseInt(currentAmount)));
          if(total != 0 || result.lpAmount != 0 ){
            stakeDataPromise.push(result);
          }
        }
        return stakeDataPromise;
      });
          
    } 
  }
  const tvl = token1 ? token0Amount * tokenPrice[token0Symbol] + token1Amount * tokenPrice[token1Symbol]
          : poolInfo[1]/lpDecimals * tokenPrice[token0Symbol];
  return {
    poolId: poolId,
    lpTokenAddress: poolInfo[0],
    token0Symbol,
    token1Symbol,
    lpScore: poolInfo[2],
    lpBalance: poolInfo[1]/1e18,
    lastUpdateBlock: poolInfo[3].toNumber(),
    rewardTokens,
    rewardTokensAddresses,
    rewardTokensSymbols,
    rewardTokensAmount: allTokenTotalRewardAmount,
    hasUserPosition: userPositions.length !== 0,
    rewards: rewards,
    stakeData: stakeData,
    startBlock: poolInfo[4],
    endBlock: poolInfo[5],
    tvl: tvl,
    apr: totalRewardPerYear/(tvl==0?1:tvl)*100,
  };
}
const getSupportedTokenSymbol = (address) => {
  return supportedTokens.find(token => token.address.toLowerCase() == address.toLowerCase()).symbol;
}
const newGetPoolByFarm = async (farm, tokenPrice, library, account) => {
  const poolId = farm.poolId;
  const poolPositons = farm.positions;
  const rewardTokens = farm.rewardTokens;
  const farmContract = getFarmsContract(library, account);
  
  const poolTokenRewardInfoPromise = []; 
  const amountCol = [];
  for(var i=0; i< rewardTokens.length ; i++){
    const amountRow = [];
    for(var j=0; j< poolPositons.length; j++){
      amountRow.push(farmContract.getTotalRewards(poolId, poolPositons[j].positionId, rewardTokens[i].farmToken));
    }
    poolTokenRewardInfoPromise.push(farmContract.getPoolTokenRewardInfo(poolId,rewardTokens[i].farmToken));
    amountCol.push(amountRow)
  }
  const BLOCKS_PER_YEAR = 60*60*24*365/BLOCK_TIME;
  const poolRewardsPerYear = await Promise.all(poolTokenRewardInfoPromise).then(result => {
      return result.map((info,index) => info[3]/(10**rewardTokens[index].decimals) * BLOCKS_PER_YEAR);
  });
  const totalRewardPerYear = poolRewardsPerYear.reduce((total,reward,index) =>
      total += tokenPrice[rewardTokens[index].symbol] * reward
  );
  let allTokenAmount = [];
  for(var i=0; i<rewardTokens.length ; i++){
    const amountHex = await Promise.all(amountCol[i]).then(re => re);
    allTokenAmount.push(
    amountHex.reduce((total, currentAmount) => total += parseInt(currentAmount),0 )
  );
}
  const allTokenRewardPromises = [];
  const stakingPromise = [];
  for (let rewardIndex = 0; rewardIndex < rewardTokens.length; rewardIndex++) {
    const tokenRewardPromise = [];
    for (let positionIndex = 0; positionIndex < poolPositons.length; positionIndex++) {
      if(poolPositons[positionIndex].address.toLowerCase() == account.toLowerCase()){
        tokenRewardPromise.push(
          farmContract.pending(poolId, poolPositons[positionIndex].positionId, rewardTokens[rewardIndex].farmToken)
        );
        stakingPromise.push(
          farmContract.stakingPosition(poolId, poolPositons[positionIndex].positionId)
        );
      }  
    }
    allTokenRewardPromises.push(tokenRewardPromise);
  }
  const allTokenRewardList = [];
  for (let promiseIndex = 0; promiseIndex < allTokenRewardPromises.length; promiseIndex++) {
    allTokenRewardList.push(Promise.all(allTokenRewardPromises[promiseIndex]));
  }
  const allTokenRewardAmountHex = await Promise.all(allTokenRewardList);
  const rewards = [];
  allTokenRewardAmountHex.forEach((rewardList,index) => {
    rewardList.forEach((reward,id)=> {
    if(index == 0) {
      rewards.push([formatUnits(reward, rewardTokens[index].decimals)]);
    } else {
      rewards[id].push(formatUnits(reward, rewardTokens[index].decimals));
    }});
  });
  const stakeData = await Promise.all(stakingPromise).then(x =>{
  const stakeDataPromise = [];
  var counter = 0;
  for(var j=0; j != poolPositons.length; j++){
    if(poolPositons[j].address.toLowerCase() == account.toLowerCase() ) {
      const expiredTime = parseInt(x[counter].stakeTimestamp)+parseInt(x[counter].lockDuration);
      const dueDate = new Date(expiredTime * 1000).toLocaleDateString("en-US")
      const nowDate = Date.now()/1000;
      var diff = expiredTime - nowDate;
      var days = 0, hrs = 0, min = 0, leftSec = 0;
      if(diff>0) {
        diff = Math.floor(diff);
        days = Math.floor(diff/(24*60*60));
        leftSec = diff - days * 24*60*60;
        hrs = Math.floor(leftSec/(60*60));
        leftSec = leftSec - hrs * 60*60;
        min = Math.floor(leftSec/(60));
      }
      const result = {
        lpAmount: formatUnits(x[counter].lpAmount,18),
        dueDate: dueDate,
        positionId: poolPositons[j].positionId,
        reward: rewardTokens.map((token, index) => ({
          token: token.symbol,
          amount: rewards[counter][index],
        })),
        remaining: days.toString() + 'd:' + hrs.toString() + 'h:' + min.toString() +'m',
        locked: diff>0
      }
      const total = rewards[counter].reduce((total, currentAmount) => total.add(parseInt(currentAmount),0));
      if(total != 0 || parseInt(result.lpAmount) != 0 ){
        stakeDataPromise.push(result);
      }
      counter++;
    }
  }
  return stakeDataPromise;
  });
  const tokens = farm.tokens;
  let ratio = tokenPrice[tokens[0].symbol];
  let token1Ratio = 1, token2Ratio = 1;
  if(tokens.length > 1) {
    const token0 = new Token(null, tokens[0].address, tokens[0].decimals, tokens[0].symbol);
    const token1 = new Token(null, tokens[1].address, tokens[1].decimals, tokens[1].symbol);
    const pair = await Fetcher.fetchPairData(token0, token1, library);

    const pair_contract = getPairContract(pair.liquidityToken.address, library, account)
    const totalSupply = await pair_contract.totalSupply();
    
    const totalAmount = new TokenAmount(pair.liquidityToken, totalSupply.toString());

    // 
    const allToken0 = pair.getLiquidityValue(
        pair.token0,
        totalAmount,
        totalAmount,
        false
    );
    const allToken1 = pair.getLiquidityValue(
        pair.token1,
        totalAmount,
        totalAmount,
        false
    );
    const allToken0Amount = parseFloat(allToken0.toExact());
    const allToken1Amount = parseFloat(allToken1.toExact());
    const totallLP = parseFloat(totalAmount.toExact());
    token1Ratio = allToken0Amount/totallLP;
    token2Ratio = allToken1Amount/totallLP;
    ratio = (allToken0Amount * tokenPrice[tokens[0].symbol] + allToken1Amount * tokenPrice[tokens[1].symbol]) / parseFloat(totalAmount.toExact());
  }
  const tvl = ratio * farm.lpToken.lpBalance/10**farm.lpToken.decimals;
  return {
    poolId: poolId,
    lpTokenAddress: farm.lpToken.address,
    token0Symbol: tokens[0].symbol,
    token1Symbol: tokens[1]? tokens[1].symbol: "",
    lpScore: farm.lpToken.lpScore,
    lpBalance: farm.lpToken.lpBalance/10**farm.lpToken.decimals,
    lastUpdateBlock: 0,
    rewardTokens: rewardTokens.map(token => token.farmToken),
    rewardTokensAddresses: rewardTokens.map(token => token.address),
    rewardTokensSymbols: rewardTokens.map(token => token.symbol),
    rewardTokensAmount: allTokenAmount.map((reward,index) => reward / 10**rewardTokens[index].decimals),
    hasUserPosition: stakeData.length !== 0,
    rewards: rewards,
    stakeData: stakeData,
    startBlock: farm.startBlock,
    endBlock: farm.endBlock,
    tvl: tvl,
    apr: (totalRewardPerYear/(tvl==0?1:tvl))*100,
    ratio: ratio,
    token1Ratio: token1Ratio,
    token2Ratio: token2Ratio,
    poolRewardPerYear: totalRewardPerYear
  };
}

const newGetAllPools = async (library, account) => {
  const tokenPrice = await getAllSuportedTokensPrice(library);
  const allFarm = await axios.get(
    `${API_URL}/farm/getAllPools`
  ).then(res => res.data).catch(e => console.log("error: ", e));
  if(allFarm.length) {
    const allPoolsPromise = [];
    for(var i=0 ; i< allFarm.length ; i++) {
      allPoolsPromise.push(newGetPoolByFarm(allFarm[i], tokenPrice, library, account));
    }
    const result = await Promise.all(allPoolsPromise);
    return result;
  }
  return null;
}

const newGetPool = async (poolId, library, account) => {
  const tokenPrice = await getAllSuportedTokensPrice(library);
  //bug, only get on pool not working, may fix this later
  const allFarm = await axios.get(
    `${API_URL}/farm/getAllPools`
  ).then(res => res.data).catch(e => console.log("error: ", e));
  if(allFarm.length) {
    const allPoolsPromise = [];
    for(var i=0 ; i< allFarm.length ; i++) {
      if(allFarm[i].poolId == poolId) { 
        return await newGetPoolByFarm(allFarm[i], tokenPrice, library, account);
      }
    }
    return result;
  }
  return null;
}

const getAllPools = async (library, account) => {
  console.log("KUY1",account);
  const allFarm = await axios.get(
    `${API_URL}/farm/getAllPools`
  ).then(res => res.data).catch(e => console.log("error: ", e));
  if(allFarm.length) {
    const allPoolsPromise = [];
    for(var i=0 ; i< allFarm.length ; i++) {
      allPoolsPromise.push(newGetPoolByFarm(allFarm[i], library, account));
    }
    const result = await Promise.all(allPoolsPromise);
    return result;
  }
  return null;
};


const approveLpToken = async (lpTokenAddr, library, account, setButtonText, approveCallback) => {
  let status = await approveTokenWithSpender(lpTokenAddr, FARMS_ADDRESS, library, account);
  if (status instanceof CustomError) {
    setButtonText(status.getErrorText());
  } else {
    approveCallback(status);
  }
}

const checkTokenIsApproved = async (lpTokenAddr, amount, library, account) => {
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
  return approved;
};

const deposit = async (lpTokenAddr, amount, poolId, lockDuration, library, account, setButtonText, stakeCallback, setButtonStatus) => {
  let status = await (async () => {
    console.log("TEST DEPOSIT:",amount);
    const contract = getFarmsContract(library, account);
    const depositTokenContract = getTokenContract(lpTokenAddr, library, account);
    // const hasBalance = checkUserHasSufficientLPBalance(lpTokenAddr, amount, library, account);

    // if (!hasBalance) return new CustomErrveor(`Insufficient balance`);

    const tokenDecimals = await depositTokenContract.decimals();
    const depositAmount = parseUnits(amount, tokenDecimals).toString();
    const approved = await checkTokenIsApprovedWithSpender(
      lpTokenAddr,
      FARMS_ADDRESS,
      depositAmount,
      library,
      account
    );

    if (!approved) {
      setButtonText('Approval required');
      setButtonStatus(true);
      return new CustomError(`Approval required`);
    }

    let args = [poolId, depositAmount, lockDuration];

    const options = {};
    console.log("TEST DEPOSIT:",args);
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
    // setButtonText(status.getErrorText());
    setButtonText(status.getErrorText());
    // setButtonText("Error, Try again");
  } else {
    stakeCallback(status);
  }
};

const harvestAll = async (poolId, library, account) => {
  const farmContract = getFarmsContract(library, account);
  const response = await farmContract.harvestAll(poolId, false, false);
};

const harvest = async (poolId, positionId, setButtonText, harvestCallback, library, account) => {
  let status = await (async () => {
    const farmContract = getFarmsContract(library, account);
    let args = [poolId, positionId, false, false];
    const options = {};

    let result = await farmContract.estimateGas['harvest'](...args, options)
      .then(gasEstimate => {
        console.log('gasEstimate:',gasEstimate);
        return farmContract['harvest'](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...options,
        });
      })
      .catch(e => {
        return new CustomError(`Farms deposit failed with error ${e}`);
      });
    return result;
  })();
  // console.log('withdraw at:',poolId,positionId,amount);
  
  // const response = await farmContract.withdraw(poolId, positionId, parseUnits(amount,18));
  if (status instanceof CustomError) {
    console.log(status.getErrorText());
    // setButtonText(status.getErrorText());
    setButtonText("Error, Try again");
  } else {
    // setButtonText('Done');
    harvestCallback(status);
  }
};

const withdraw = async (poolId, positionId, amount, setButtonText, setButtonStatus, withdrawCallback, library, account) => {
  let status = await (async () => {
    const farmContract = getFarmsContract(library, account);
    let args = [poolId, positionId, parseUnits(amount,18)];
    console.log(args);
    const options = {};

    let result = await farmContract.estimateGas['withdraw'](...args, options)
      .then(gasEstimate => {
        console.log('gasEstimate:',gasEstimate);
        return farmContract['withdraw'](...args, {
          gasLimit: calculateGasMargin(gasEstimate),
          ...options,
        });
      })
      .catch(e => {
        return new CustomError(`Farms deposit failed with error ${e}`);
      });
    return result;
  })();
  // console.log('withdraw at:',poolId,positionId,amount);
  
  // const response = await farmContract.withdraw(poolId, positionId, parseUnits(amount,18));
  if (status instanceof CustomError) {
    console.log(status.getErrorText());
    // setButtonText(status.getErrorText());
    setButtonText("Error, Try again");
  } else {
    // setButtonText('Done');
    withdrawCallback(status);
  }
};

const getDateYDM = (date) => {
  return date.getFullYear(date)  + "-" + ("0"+(date.getMonth(date)+1)).slice(-2) + "-" + ("0" + date.getDate(date)).slice(-2)
}

export { 
  getAllPools, 
  deposit, 
  harvestAll, 
  harvest, 
  withdraw, 
  approveLpToken, 
  getPool, 
  checkTokenIsApproved,
  newGetAllPools,
  newGetPool
};
