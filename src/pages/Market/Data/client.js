import { ApolloClient, InMemoryCache } from '@apollo/client'

export const marketClient = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    cache: new InMemoryCache()
})

export const ethBlocks = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
    cache: new InMemoryCache()
})