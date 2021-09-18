import { GET_TOP_TOKEN } from './query';
import {convertToken} from './util'

// fetch general token info
// top 10, etc
export async function fetchGeneralTokenInfo(client){
    const { loading, error, data } = await client.query({
        query: GET_TOP_TOKEN
    });

    if (loading) return null;
    if (error) return `Error! ${error}`;

    let rawTopToken = data.tokens

    return rawTopToken.map(item => convertToken(item))
}


// fetch individual token from string (search)

// fetch individual token info from id

// fetch individual token history




