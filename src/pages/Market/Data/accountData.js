import {TOP_LPS_PER_PAIRS} from './query'

// put the accounts query wrapper here


// this query requires the pair query, use those first
export async function fetchTopLP(client, pairId){
    
    const { loading, error, data } = await client.query({
        query: TOP_LPS_PER_PAIRS,
        variables: {
          pair: pairId
        },
      });
    
    if (loading) return null;
    if (error) return `Error! ${error}`;

    return data
}