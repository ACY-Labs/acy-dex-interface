import { gql } from '@apollo/client';

// get general market data
export const GET_MARKET_DATA = gql`
  query uniswapDayDatas($startTime: Int!, $skip: Int!) {
    uniswapDayDatas(
      first: 1000
      skip: $skip
      subgraphError: allow
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      dailyVolumeUSD
      totalLiquidityUSD
    }
  }
`;

// get general token list
// this is for the current day, use get token day data to fetch yesterday's and calculate the price
export const GET_TOKEN_LIST = gql`
  query tokenDayDatas($date: Int!, $tokenAmount: Int!) {
    tokenDayDatas(
      first: $tokenAmount
      orderBy: totalLiquidityUSD
      orderDirection: desc
      where: { date: $date }
    ) {
      token {
        id
        name
        symbol
      }
      dailyVolumeUSD
      totalLiquidityUSD
      priceUSD
    }
  }
`;

export const GET_TOKEN_DAY_SIMPLE = gql`
  query tokenDayDatas($tokenId: ID!) {
    tokenDayDatas(first: 2, orderBy: date, orderDirection: desc, where: { token: $tokenId }) {
      id
      date
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      totalLiquidityETH
      dailyVolumeETH
      dailyVolumeToken
      dailyVolumeUSD
    }
  }
`;

// get individual token history data
export const GET_TOKEN_DAY_DATA = gql`
  query tokenDayDatas($tokenId: ID!) {
    tokenDayDatas(orderBy: date, orderDirection: desc, where: { token: $tokenId }) {
      id
      date
      token {
        id
        symbol
        name
      }
      priceUSD
      totalLiquidityToken
      totalLiquidityUSD
      dailyVolumeToken
      dailyVolumeUSD
      mostLiquidPairs {
        id
        date
      }
    }
    pairs0: pairs(
      where: { token0: $tokenId }
      first: 50
      orderBy: reserveUSD
      orderDirection: desc
    ) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
    pairs1: pairs(
      where: { token1: $tokenId }
      first: 50
      orderBy: reserveUSD
      orderDirection: desc
    ) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
  }
`;

// get general pool list
export const GET_TOP_POOL = gql`
  query pairDayDatas($poolAmount: Int!, $date: Int!) {
    pairDayDatas(
      first: $poolAmount
      orderBy: reserveUSD
      orderDirection: desc
      where: { date: $date }
    ) {
      pairAddress
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      reserveUSD
      dailyVolumeUSD
    }
  }
`;

// get pool day data
// @params timespan, pairAddress
export const GET_POOL_DAY_DATA = gql`
  query pairDayData($timespan: Int!, $pairAddress: ID!) {
    pairDayDatas(
      first: $timespan
      orderBy: date
      orderDirection: desc
      where: { pairAddress: $pairAddress }
    ) {
      dailyVolumeUSD
      reserveUSD
    }
  }
`;

// get main transactions
export const GET_GLOBAL_TRANSACTIONS = gql`
query transactions($txAmount: Int!) {
  mints(
    first: $txAmount
    orderBy: timestamp
    orderDirection: desc
  ) {
    transaction{
      id
      timestamp
    }
    pair {
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
    sender
    liquidity
    amount0
    amount1
    amountUSD
  }
  burns(
    first: $txAmount
    orderBy: timestamp
    orderDirection: desc
  ) {
    transaction{
      id
      timestamp
    }
    pair {
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
    sender
    liquidity
    amount0
    amount1
    amountUSD
  }
  swaps(
    first: $txAmount
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    transaction{
      id
      timestamp
    }
    pair {
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
    sender
    amount0In
    amount0Out
    amount1In
    amount1Out
    amountUSD
  }
}
`;

export const FILTERED_TRANSACTIONS = gql`
  query transactions($txAmount: Int!, $allPairs: [Bytes]!) {
    mints(
      first: $txAmount
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction{
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    burns(
      first: $txAmount
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      transaction{
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      liquidity
      amount0
      amount1
      amountUSD
    }
    swaps(
      first: $txAmount
      where: { pair_in: $allPairs }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      transaction{
        id
        timestamp
      }
      pair {
        token0 {
          id
          symbol
        }
        token1 {
          id
          symbol
        }
      }
      sender
      amount0In
      amount0Out
      amount1In
      amount1Out
      amountUSD
    }
  }
`;
