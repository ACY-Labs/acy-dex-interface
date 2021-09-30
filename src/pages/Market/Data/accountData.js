import {TOP_LPS_PER_PAIRS,TOP_XCHANGE_VOL} from './query'

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

// NOTE: CURRENTLY ORDERED USING TIMESTAMP, 
// NEED TO FIND WAY TO MAKE IT WORK WHEN ORDERING BASED ON VALUE
export async function fetchTopExchangeVolumes(client){
  let resultsData = []
  for(let i = 0; i < 20; i++ ){
    const { loading, error, data } = await client.query({
      query: TOP_XCHANGE_VOL,
      variables: {
        offset: i * 5
      }
    });
    // if (loading) return null;
    // if (error) return `Error! ${error}`;

    resultsData = [...resultsData, ...data.swaps]
  }
  

  return resultsData
}