import {
  TOP_LPS_PER_PAIRS,
  USER_MINTS_BUNRS_PER_PAIR,
  USER_HISTORY,
  USER_POSITIONS,
  TOP_XCHANGE_VOL,
} from './query';
import { getMetricsForPositionWindow } from './util';
import { fetchEthPrice } from './eth';

// put the accounts query wrapper here

// this query requires the pair query, use those first

export async function fetchTopLP(client, pairId) {
  const { loading, error, data } = await client.query({
    query: TOP_LPS_PER_PAIRS,
    variables: {
      pair: pairId,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return data;
}

/**
 * Store all the snapshots of liquidity activity for this account.
 * Each snapshot is a moment when an LP position was created or updated.
 * @param {*} account
 */
export async function fetchUserSnapshots(client, account) {
  let skip = 0;
  let allResults = [];
  let found = false;
  while (!found) {
    let result = await client.query({
      query: USER_HISTORY,
      variables: {
        skip: skip,
        user: account,
      },
      fetchPolicy: 'cache-first',
    });
    allResults = allResults.concat(result.data.liquidityPositionSnapshots);
    if (result.data.liquidityPositionSnapshots.length < 1000) {
      found = true;
    } else {
      skip += 1000;
    }
  }
  return allResults;
}

export async function fetchPrincipalForUserPerPair(client, user, pairAddress) {
  let usd = 0;
  let amount0 = 0;
  let amount1 = 0;
  // get all minst and burns to get principal amounts
  const results = await client.query({
    query: USER_MINTS_BUNRS_PER_PAIR,
    variables: {
      user,
      pair: pairAddress,
    },
  });
  for (const index in results.data.mints) {
    const mint = results.data.mints[index];
    const mintToken0 = mint.pair.token0.id;
    const mintToken1 = mint.pair.token1.id;

    // if trackign before prices were discovered (pre-launch days), hardcode stablecoins
    if (priceOverrides.includes(mintToken0) && mint.timestamp < PRICE_DISCOVERY_START_TIMESTAMP) {
      usd += parseFloat(mint.amount0) * 2;
    } else if (
      priceOverrides.includes(mintToken1) &&
      mint.timestamp < PRICE_DISCOVERY_START_TIMESTAMP
    ) {
      usd += parseFloat(mint.amount1) * 2;
    } else {
      usd += parseFloat(mint.amountUSD);
    }
    amount0 += parseFloat(mint.amount0);
    amount1 += parseFloat(mint.amount1);
  }

  for (const index in results.data.burns) {
    const burn = results.data.burns[index];
    const burnToken0 = burn.pair.token0.id;
    const burnToken1 = burn.pair.token1.id;

    // if trackign before prices were discovered (pre-launch days), hardcode stablecoins
    if (priceOverrides.includes(burnToken0) && burn.timestamp < PRICE_DISCOVERY_START_TIMESTAMP) {
      usd += parseFloat(burn.amount0) * 2;
    } else if (
      priceOverrides.includes(burnToken1) &&
      burn.timestamp < PRICE_DISCOVERY_START_TIMESTAMP
    ) {
      usd += parseFloat(burn.amount1) * 2;
    } else {
      usd -= parseFloat(burn.amountUSD);
    }

    amount0 -= parseFloat(burn.amount0);
    amount1 -= parseFloat(burn.amount1);
  }

  return { usd, amount0, amount1 };
}

export async function fetchLPReturnsOnPair(client, user, pair, ethPrice, snapshots) {
  // initialize values
  const principal = await fetchPrincipalForUserPerPair(client, user, pair.id);
  let hodlReturn = 0;
  let netReturn = 0;
  let uniswapReturn = 0;
  let fees = 0;

  snapshots = snapshots.filter(entry => {
    return entry.pair.id === pair.id;
  });

  // get data about the current position
  const currentPosition = {
    pair,
    liquidityTokenBalance: snapshots[snapshots.length - 1]?.liquidityTokenBalance,
    liquidityTokenTotalSupply: pair.totalSupply,
    reserve0: pair.reserve0,
    reserve1: pair.reserve1,
    reserveUSD: pair.reserveUSD,
    token0PriceUSD: pair.token0.derivedETH * ethPrice,
    token1PriceUSD: pair.token1.derivedETH * ethPrice,
  };

  for (const index in snapshots) {
    // get positions at both bounds of the window
    const positionT0 = snapshots[index];
    const positionT1 =
      parseInt(index) === snapshots.length - 1 ? currentPosition : snapshots[parseInt(index) + 1];

    const results = getMetricsForPositionWindow(positionT0, positionT1);
    hodlReturn = hodlReturn + results.hodleReturn;
    netReturn = netReturn + results.netReturn;
    uniswapReturn = uniswapReturn + results.uniswapReturn;
    fees = fees + results.fees;
  }

  return {
    principal,
    net: {
      return: netReturn,
    },
    uniswap: {
      return: uniswapReturn,
    },
    fees: {
      sum: fees,
    },
  };
}

// get user pool positions
export async function fetchPoolsFromAccount(client, account) {
  const { loading, error, data } = await client.query({
    query: USER_POSITIONS,
    variables: {
      user: account,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  // add some extra info to positions.
  if (data.liquidityPositions) {
    const snapshots = await fetchUserSnapshots(client, account);
    const [ethPrice] = await fetchEthPrice(client);
    const formattedPositions = await Promise.all(
      data.liquidityPositions.map(async positionData => {
        const returnData = await fetchLPReturnsOnPair(
          client,
          account,
          positionData.pair,
          ethPrice,
          snapshots
        );
        return {
          ...positionData,
          ...returnData,
        };
      })
    );

    console.log('formattedPositions');
    console.log(formattedPositions);
    return formattedPositions;
  }

  return data;
}

// NOTE: CURRENTLY ORDERED USING TIMESTAMP,
// NEED TO FIND WAY TO MAKE IT WORK WHEN ORDERING BASED ON VALUE
export async function fetchTopExchangeVolumes(client) {
  let resultsData = [];
  for (let i = 0; i < 20; i++) {
    const { loading, error, data } = await client.query({
      query: TOP_XCHANGE_VOL,
      variables: {
        offset: i * 5,
      },
    });
    // if (loading) return null;
    // if (error) return `Error! ${error}`;

    resultsData = [...resultsData, ...data.swaps];
  }

  return resultsData;
}
