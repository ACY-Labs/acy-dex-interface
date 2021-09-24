import { GET_TOKEN_DAY_DATA, GET_TOKEN_LIST, GET_TOKEN_DAY_SIMPLE, GET_TOKEN_INFO } from './query';
import { convertTokenForList } from './util';
import { getBlockFromTimestamp } from './blocks';

export async function fetchTokenInfo(client, tokenAddress, timestamp) {
  const block = await getBlockFromTimestamp(timestamp);

  console.log("TOKEN ADDRESS", tokenAddress)

  const { loading, error, data } = await client.query({
    query: GET_TOKEN_INFO,
    variables: {
      address: tokenAddress,
      block: parseInt(block.number),
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  console.log(data);

  return data.tokens[0];
}

export async function fetchTokenDayData(client, tokenId) {
  const { loading, error, data } = await client.query({
    query: GET_TOKEN_DAY_DATA,
    variables: {
      tokenId: tokenId,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  console.log(data);

  return [data.tokenDayDatas, data.pairs0, data.pairs1];
}

export async function fetchTokenDaySimple(client, tokenId) {
  const { loading, error, data } = await client.query({
    query: GET_TOKEN_DAY_SIMPLE,
    variables: {
      tokenId: tokenId,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return data;
}

// fetch general token info
// top 10, etc
export async function fetchGeneralTokenInfo(client) {
  let todayDateObj = new Date();
  let todayTime = Math.floor(todayDateObj.getTime() / 1000 / 86400) * 86400;

  const { loading, error, data } = await client.query({
    query: GET_TOKEN_LIST,
    variables: {
      date: todayTime,
      tokenAmount: 50,
    },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  let rawTopToken = data.tokenDayDatas;
  let rawTopTokenLength = rawTopToken.length;
  let topTokens = [];
  for (let i = 0; i < rawTopTokenLength; i++) {
    try {
      const tokenDayData = await fetchTokenDaySimple(client, rawTopToken[i].token.id);
      topTokens.push(convertTokenForList(rawTopToken[i], tokenDayData.tokenDayDatas[1]));
    } catch (err) {
      console.log(err);
    }
  }

  return topTokens;
}

// fetch individual token from string (search)

// fetch individual token info from id

// fetch individual token history