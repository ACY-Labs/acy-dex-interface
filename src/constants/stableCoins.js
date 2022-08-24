const CONTRACTS = {
    56: { // bsc mainnet
      Reader: "0x087A618fD25c92B61254DBe37b09E5E8065FeaE7",
    },
    137: {
      // TODO: this is placeholder
      Reader: '0x6EadCd226bAEAe09016D4954A43845eD9b6046AA',
    },
    97: {
      Reader: '0x6EadCd226bAEAe09016D4954A43845eD9b6046AA',
    },
    80001: {
      Reader: '0x4768083Eb19E78E9ECD39aCdc25C6CaE96699dF2',
    },
  }

export const getContract = (chainId, contractName) => {
    return CONTRACTS[chainId][contractName];
}