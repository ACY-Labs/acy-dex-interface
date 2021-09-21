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
    tokenDayDatas(orderBy: date, orderDirection: asc, where: { token: $tokenId }) {
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
  query pairDayDatas($timespan: Int!, $pairAddress: ID!) {
    pairDayDatas(
      first: $timespan
      orderBy: date
      orderDirection: asc
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
    transactions(first: $txAmount, orderBy: timestamp, orderDirection: desc, subgraphError: allow) {
      id
      timestamp
      mints {
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
        amount0
        amount1
        amountUSD
      }
      swaps {
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
        amount1Out
        amountUSD
      }
      burns {
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
        amount0
        amount1
        amountUSD
      }
    }
  }
`;
