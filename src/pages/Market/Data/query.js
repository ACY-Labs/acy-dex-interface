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
      volumeUSD
      tvlUSD
    }
  }
`;
// get general token list
export const GET_TOP_TOKEN = gql`
  query topPools {
    tokens(first: 50, orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
      id
      symbol
      name
      tokenDayData(first: 2, orderBy: date, orderDirection: desc) {
        priceUSD
        volumeUSD
        totalValueLockedUSD
      }
    }
  }
`;

// get general pool list 
// export const GET_TOP_POOL = gql`ss`;


// get individual token history data
export const GET_TOKEN_HISTORY_DATA = undefined;

// get main transactions
export const GET_GLOBAL_TRANSACTIONS = gql`
  query transactions($txAmount: Int!) {
    transactions(first: $txAmount, orderBy: timestamp, orderDirection: desc, subgraphError: allow) {
      id
      timestamp
      mints {
        pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        owner
        sender
        origin
        amount0
        amount1
        amountUSD
      }
      swaps {
        pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        origin
        amount0
        amount1
        amountUSD
      }
      burns {
        pool {
          token0 {
            id
            symbol
          }
          token1 {
            id
            symbol
          }
        }
        owner
        origin
        amount0
        amount1
        amountUSD
      }
    }
  }
`;
