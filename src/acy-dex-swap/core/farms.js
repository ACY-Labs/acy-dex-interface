import { getFarmsContract } from '@/acy-dex-swap/utils';

const getAllPools = async (library, account) => {
  const contract = getFarmsContract(library, account)
  const numPoolHex = await contract.numPools()
  const numPool = numPoolHex.toNumber()
  const pools = []

  for (let i = 0; i < numPool; i++) {
    await contract.poolInfo(i).address
  }
}

export { getAllPools }
