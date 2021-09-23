import { ethBlocks } from './client.js'
import { GET_BLOCK_FROM_TIMESTAMP } from './query.js'


export async function getBlockFromTimestamp(timestamp) {

    const { loading, error, data } = await ethBlocks.query({
        query: GET_BLOCK_FROM_TIMESTAMP,
        variables: {
            "timestamp": timestamp
        },
    });


    if (loading) return null;
    if (error) return `Error! ${error}`;

    console.log("BLOCKS", data)

    return data.blocks[0]
  }