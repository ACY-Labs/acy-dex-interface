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
`
// get general token list


// get individual token history data
export const GET_TOKEN_HISTORY_DATA = undefined

