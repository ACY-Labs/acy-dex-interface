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
} from '@/acy-dex-swap/utils';
import { Fetcher} from '@acyswap/sdk';
import { abi as FarmsABI } from '../abis/ACYMultiFarm.json';
import Eth from "web3-eth";
import Utils from "web3-utils";
import { Icon } from 'antd';
import { Web3Provider } from "@ethersproject/providers";
import { injected } from '@/connectors';
import supportedTokens from '@/constants/TokenList';

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

  if(poolPositons.length === 0 ){
    const totalPendingRewards = [];
    for (let tX = 0; tX < rewardTokens.length; tX++) {
      totalPendingRewards.push(0);
    }
    return [totalPendingRewards, totalPendingRewards];
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
    // const amountHex = [];
    // for(var j=0; j<poolPositons.length; j++){
    //   const amount = await farmContract.getTotalRewards(poolIndex, poolPositons[j], rewardTokens[i]);
    //   amountHex.push(amount);
    // }
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
    return [allTokenAmount, totalPendingRewards];
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
  return [allTokenAmount, rewards];
};

const getPoolAccmulateReward = async (library, account, poolId) => {
  const contract     = getFarmsContract(library, account);
  const poolPositons = await contract.getPoolPositions(poolId);
  const poolInfo     = await contract.poolInfo(poolId);
  const rewardTokens = await contract.getPoolRewardTokens(poolId);
  const rewardTokensAddresses = await contract.getPoolRewardTokenAddresses(poolId);
  // retrieve reward tokens symbol.
  const rewardTokensSymbolsRequests = [];
  rewardTokensAddresses.forEach(address => {
    rewardTokensSymbolsRequests.push(getTokenSymbol(address, library, account));
  });
  const rewardTokensSymbols = await Promise.all(rewardTokensSymbolsRequests).then(
    symbols => symbols
  );
  const acRewards = [];
  // console.log('rewardTokensSymbols:',rewardTokensSymbols);
  // const amount = await contract.getTotalRewards(poolId, poolPositons[0], rewardTokens[0]);
  // console.log(amount);
  for(var i=0; i<rewardTokens.length ; i++){
    var sum = 0;
    const decimal = getTokenDecimal(rewardTokensAddresses[i], library, account)
    for(var j=0; j<poolPositons.length; j++){
      const amount = await contract.getTotalRewards(poolId, poolPositons[j], rewardTokens[i]);
      sum += parseInt(amount);
    }
    acRewards.push({token:rewardTokensSymbols[i], amount:formatUnits(sum, )});
  }
  return acRewards;
};

const getPool = async (library, account, poolId)=> {
  const contract = getFarmsContract(library, account);
  const poolInfo = await contract.poolInfo(poolId);
  const rewardTokens = await contract.getPoolRewardTokens(poolId);
  const rewardTokensAddresses = await contract.getPoolRewardTokenAddresses(poolId);

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

  const token0Symbol = await getTokenSymbol(token0, library, account);
  const token1Symbol = token1 === null ? '' : await getTokenSymbol(token1, library, account);

  // account data
  var allTokenTotalRewardAmount = null;
  var userPositions= null;
  var rewards = null;
  var stakeData = null;
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
    endBlock: poolInfo[5]
  };
}

// const getAllPools = async () => {
//   var Contract = require('web3-eth-contract');
//   Contract.setProvider('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
//   var eth = new Eth('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
//   const farmContract = new Contract(FarmsABI,FARMS_ADDRESS);
//   const numPoolHex = await farmContract.methods.numPools().call();
//   const numPool = numPoolHex.toNumber();
//   const poolInfoRequests = [];
//   for (let i = 0; i < numPool; i++) {
//     poolInfoRequests.push(
//       (async () => {
//         const poolInfo = await contract.poolInfo(i).call();
//         const rewardTokens = await contract.getPoolRewardTokens(i).call();
//         const rewardTokensAddresses = await contract.getPoolRewardTokenAddresses(i).get();


//       })()
//     );
//   }

// };
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
        
        const token0Symbol = await getTokenSymbol(token0, library, account);
        const token1Symbol = token1 === null ? '' : await getTokenSymbol(token1, library, account);

        // account data
        var allTokenTotalRewardAmount = null;
        var userPositions= null;
        var rewards = null;
        var stakeData = null;
        // first store all the positions that the user staked in the pool in this iteration.
        // positions returned from getUserPositions are in the base of hex,
        // hence it has to be converted to decimals for use.
        if(account) {
          userPositions = (await contract.getUserPositions(account, i)).map(positionHex =>
            positionHex.toNumber()
          );
          
          const PendingReward = await getPoolTotalPendingReward(
            rewardTokens,
            rewardTokensAddresses,
            userPositions,
            contract,
            i,
            library,
            account
          );
          allTokenTotalRewardAmount = PendingReward[0];
          rewards = PendingReward[1];
          
          
          if(userPositions.length > 0)
          {
            const stakingPromise = [];
            for(var j=0; j != userPositions.length; j++)
            {
              stakingPromise.push(contract.stakingPosition(i,userPositions[j]));
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
        return {
          poolId: i,
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
          endBlock: poolInfo[5]
        };
      })()
    );
  }

  return Promise.all(poolInfoRequests).then(res => {
    return res;
  });
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
    const contract = getFarmsContract(library, account);
    const depositTokenContract = getTokenContract(lpTokenAddr, library, account);
    // const hasBalance = checkUserHasSufficientLPBalance(lpTokenAddr, amount, library, account);

    // if (!hasBalance) return new CustomErrveor(`Insufficient balance`);

    const tokenDecimals = await depositTokenContract.decimals();
    const depositAmount = parseUnits(amount.toFixed(tokenDecimals).toString(), tokenDecimals).toString();
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
    // setButtonStatus(false);
    // withdrawCallback(status);
  }
  // const farmContract = getFarmsContract(library, account);
  // const response = await farmContract.harvest(poolId, positionId, false, false);
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

const getHarvestHistory = async (library,account = null) => {
  
  //init date
  // var Contract = require('web3-eth-contract');
  // Contract.setProvider('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
  var eth = new Eth('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
  // const farmContract = new Contract(FarmsABI,FARMS_ADDRESS);
  // console.log(await farmContract.methods.numPools().call());

    //test 
  // const library = new Web3Provider(eth.givenProvider);
  const farmContract = getFarmsContract(library, account);
  // console.log('farmContract2:',await farmContract2.numPools());
  // farmContract2.queryFilter("Harvest", 0).then(function(events)  {console.log(events)});
  const currentBlock = await eth.getBlockNumber();
  const BLOCKS_PER_MONTH = 5760 * 31; // average 5760 per day
  const result = await farmContract.queryFilter(
    "Harvest", 
    currentBlock - BLOCKS_PER_MONTH, 
  // function(error, events){ console.log(events); }
  ).then(async function(events){
    var date = new Date();
    var today = new Date(date);
    const date_array = {};
    date.setMonth(date.getMonth() - 1);
    
    date_array[getDateYDM(date)] = 0;
    date.setDate(date.getDate() + 1);
    for(var i=0; i<40 ; i++){
      date_array[getDateYDM(date)] = 0;
      if(date.getDate() === today.getDate()) break;
      date.setDate(date.getDate() + 1);
    }

    const blockTimestamps = [];
    for(var i=0 ; i < events.length ; i++) {
      blockTimestamps.push(eth.getBlock(events[i]['blockNumber']));
    }
    const result2 = Promise.all(blockTimestamps).then(block => {
      const my_acy = {...date_array};
      const my_all = {...date_array};
      const total_acy = {...date_array};
      const total_all = {...date_array};
      for(var i=events.length-1; i >=0 ; i--) {
        const date = new Date(block[i].timestamp * 1000);
        const str_date = getDateYDM(date);
        if(date_array.hasOwnProperty(str_date)){
          var value = 0;
          if(events[i]['args']['token'] == USDC_TOKEN || events[i]['args']['token'] == USDT_TOKEN) {
            value =  events[i]['args']['amount']/1e6;
          } else if(events[i]['args']['token'] == ACY_TOKEN) {
            value =  events[i]['args']['amount']/1e18;
            total_acy[str_date] += value;
          }
          total_all[str_date] += value;
          if(events[i]['args']['user'] == account){
            my_all[str_date] += value;
            if(events[i]['args']['token'] == ACY_TOKEN) {
              my_acy[str_date] += value;
            }
          }
          date_array[str_date] += events[i]['args']['amount']/1e18;
        } else {
          break;
        }
      }
      return {
        myAcy: Object.entries(my_acy),
        myAll: Object.entries(my_all),
        totalAcy: Object.entries(total_acy),
        totalAll: Object.entries(total_all)
      };

    })
    return result2;
  });
  return result;
}
const getBalanceRecord = async (library,account = null) => {
  //init date
  // var Contract = require('web3-eth-contract');
  // Contract.setProvider('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
  var eth = new Eth('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
  // const farmContract = new Contract(FarmsABI,FARMS_ADDRESS);
  // console.log(await farmContract.methods.numPools().call());

    //test 
  // const library = new Web3Provider(eth.givenProvider);
  const ACY = supportedTokens.find(item => item.symbol === "ACY");
  const contract = getTokenContract(ACY.address, library, account);
  // console.log('farmContract2:',await farmContract2.numPools());
  // farmContract2.queryFilter("Harvest", 0).then(function(events)  {console.log(events)});
  
  const currentBlock = await eth.getBlockNumber();
  var myCurrentAcy = await contract.balanceOf(account)/1e18;
  const BLOCKS_PER_MONTH = 5760 * 31; // average 5760 per day
  const result = await contract.queryFilter(
    "Transfer", 
    currentBlock - BLOCKS_PER_MONTH, 
  // function(error, events){ console.log(events); }
  ).then(async function(events){
    var date = new Date();
    var today = new Date(date);
    const date_array = {};
    const dateArray = [];
    date.setMonth(date.getMonth() - 1);
    
    date_array[getDateYDM(date)] = 0;
    dateArray.push(getDateYDM(date));
    date.setDate(date.getDate() + 1);
    for(var i=0; i<40 ; i++){
      date_array[getDateYDM(date)] = 0;
      dateArray.push(getDateYDM(date));
      if(date.getDate() === today.getDate()) {
        date_array[getDateYDM(date)] = myCurrentAcy;
        break;
      }
      date.setDate(date.getDate() + 1);
    }

    const blockTimestamps = [];
    for(var i=0 ; i < events.length ; i++) {
      blockTimestamps.push(eth.getBlock(events[i]['blockNumber']));
    }
    const result2 = Promise.all(blockTimestamps).then(block => {
      const my_acy = {...date_array};
      const total_acy = {...date_array};
      var current_index = 0;
      var last_index = dateArray.length - 1;
      for(var i=events.length-1; i >=0 ; i--) {
        const date = new Date(block[i].timestamp * 1000);
        const str_date = getDateYDM(date);
        //
        current_index = dateArray.indexOf(str_date);
        if(last_index - current_index > 1) {
          for(var j = current_index + 1; j < last_index ; j++) {
            my_acy[dateArray[j]] = myCurrentAcy;
          }
        }
        last_index = current_index ;

        if(dateArray.includes(str_date)){
          var value = events[i]['args']['value']/1e18;
          if(my_acy[str_date] == 0) my_acy[str_date] = myCurrentAcy;
          if(events[i]['args']['from'] == account) {
            myCurrentAcy += value;
          } else if(events[i]['args']['to'] == account) {
            myCurrentAcy -=  value;
          }
        } else {
          break;
        }
      }
      const myAcy = Object.entries(my_acy);
      return {
        myAcy: myAcy,
        totalAcy: myAcy,
      };
    });
    return result2;
  });
  return result;
}

const getDepositRecord = async (library,account = null) => {
  //init date
  var eth = new Eth('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
  const farmContract = getFarmsContract(library, account);
  const currentBlock = await eth.getBlockNumber();
  const filter = farmContract.filters.Deposit(null,0);
  const BLOCKS_PER_MONTH = 5760 * 31; // average 5760 per day
  const result = await farmContract.queryFilter(
    filter, 
    currentBlock - BLOCKS_PER_MONTH, 
  ).then(async function(events){
    var date = new Date();
    var today = new Date(date);
    const date_array = {};
    const dateArray = [];
    date.setMonth(date.getMonth() - 1);
    
    date_array[getDateYDM(date)] = 0;
    dateArray.push(getDateYDM(date));
    date.setDate(date.getDate() + 1);
    for(var i=0; i<40 ; i++){
      date_array[getDateYDM(date)] = 0;
      dateArray.push(getDateYDM(date));
      if(date.getDate() === today.getDate()) {
        date_array[getDateYDM(date)] = 0;
        break;
      }
      date.setDate(date.getDate() + 1);
    }

    const blockTimestamps = [];
    for(var i=0 ; i < events.length ; i++) {
      blockTimestamps.push(eth.getBlock(events[i]['blockNumber']));
    }
    const result2 = Promise.all(blockTimestamps).then(block => {
      const my_acy = {...date_array};
      const total_acy = {...date_array};

      for(var i=events.length-1; i >=0 ; i--) {
        const date = new Date(block[i].timestamp * 1000);
        const str_date = getDateYDM(date);

        if(dateArray.includes(str_date)){
          if(events[i]['args']['user'] == account) {
            my_acy[str_date] -= events[i]['args']['amount']/1e18;
          }
          total_acy[str_date] -= events[i]['args']['amount']/1e18;
        } else {
          break;
        }
      }
      return {
        myAcy: Object.entries(my_acy),
        totalAcy: Object.entries(total_acy),
      };
    });
    return result2;
  });
  return result;
}
const getWithdrawRecord = async (library,account = null) => {
  //init date
  var eth = new Eth('https://rinkeby.infura.io/v3/1e70bbd1ae254ca4a7d583bc92a067a2');
  const farmContract = getFarmsContract(library, account);
  const currentBlock = await eth.getBlockNumber();
  const filter = farmContract.filters.Withdraw(null,0);
  const BLOCKS_PER_MONTH = 5760 * 31; // average 5760 per day
  const result = await farmContract.queryFilter(
    filter, 
    currentBlock - BLOCKS_PER_MONTH, 
  ).then(async function(events){
    var date = new Date();
    var today = new Date(date);
    const date_array = {};
    const dateArray = [];
    date.setMonth(date.getMonth() - 1);
    
    date_array[getDateYDM(date)] = 0;
    dateArray.push(getDateYDM(date));
    date.setDate(date.getDate() + 1);
    for(var i=0; i<40 ; i++){
      date_array[getDateYDM(date)] = 0;
      dateArray.push(getDateYDM(date));
      if(date.getDate() === today.getDate()) {
        date_array[getDateYDM(date)] = 0;
        break;
      }
      date.setDate(date.getDate() + 1);
    }

    const blockTimestamps = [];
    for(var i=0 ; i < events.length ; i++) {
      blockTimestamps.push(eth.getBlock(events[i]['blockNumber']));
    }
    const result2 = Promise.all(blockTimestamps).then(block => {
      const my_acy = {...date_array};
      const total_acy = {...date_array};
      var current_index = 0;
      var last_index = dateArray.length - 1;
      for(var i=events.length-1; i >=0 ; i--) {
        const date = new Date(block[i].timestamp * 1000);
        const str_date = getDateYDM(date);

        if(dateArray.includes(str_date)){
          if(events[i]['args']['user'] == account) {
            my_acy[str_date] += events[i]['args']['amount']/1e18;
          }
          total_acy[str_date] += events[i]['args']['amount']/1e18;
        } else {
          break;
        }
      }
      return {
        myAcy: Object.entries(my_acy),
        totalAcy: Object.entries(total_acy),
      };
    });
    return result2;
  });
  return result;
}
const getDaoStakeRecord = async (library, account) =>{
  const withdraw = getWithdrawRecord(library, account);
  const deposit = getDepositRecord(library, account);
  const proimse = await Promise.all([withdraw,deposit]).then( array => {
    const withdrawMy = array[0].myAcy;
    const withdrawTotal = array[0].totalAcy;
    let len = withdrawMy.length;
    var resultMy = [...array[1].myAcy];
    var resultTotal = [...array[1].totalAcy];
    for(var i=0; i < len ; i++) 
    {
      resultMy[i][1] += withdrawMy[i][1];
      resultTotal[i][1] += withdrawTotal[i][1];
    }
    return {
      myAcy: resultMy,
      totalAcy: resultTotal
    };
  });
  return proimse;
}

const getUserStakeInfo = async (poolId, account) =>{
  userPositions = (await contract.getUserPositions(account, poolId)).map(positionHex =>
    positionHex.toNumber()
  );
  const PendingReward = await getPoolTotalPendingReward(
    rewardTokens,
    rewardTokensAddresses,
    userPositions,
    contract,
    i,
    library,
    account
  );
  rewards = PendingReward[1];
  stakeData = [];

  if(userPositions.length > 0)
  {
    for(var j=0; j != userPositions.length; j++)
    {
      const result = await contract.stakingPosition(i,userPositions[j])
        .then(x => {
          // [ parseInt(x.stakeTimestamp), parseInt(x.lockDuration)]
          const expiredTime = parseInt(x.stakeTimestamp)+parseInt(x.lockDuration);
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
          return {
            lpAmount: formatUnits(x.lpAmount,18),
            dueDate: dueDate,
            positionId: userPositions[j],
            reward: rewards[j],
            remaining: days.toString() + 'd:' + hrs.toString() + 'h:' + min.toString() +'m',
            locked: diff>0
          }
        }
      );
      if(result.reward !=0 || result.lpAmount != 0 ){
        stakeData.push(result);
      }
    } 
  }
}


export { 
  getAllPools, 
  deposit, 
  harvestAll, 
  harvest, 
  withdraw, 
  getHarvestHistory, 
  approveLpToken, 
  getPool, 
  getPoolAccmulateReward, 
  checkTokenIsApproved,
  getBalanceRecord,
  getDaoStakeRecord
};
