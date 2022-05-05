import { getNativeToken, getToken, getTokenBySymbol, getTokens, getWhitelistedTokens, getWrappedToken, isValidToken } from "@/acy-dex-futures/samples/TokenList"
import { getContract } from "@/acy-dex-futures/utils/Addresses"

// getWrappedToken(chainId)
// getNativeToken(chainId)
// getTokens(chainId)
// isValidToken(chainId, address)
// getToken(chainId, address)
// getTokenBySymbol(chainId, symbol)
// getWhitelistedTokens(chainId)

const TokenListSelector = (arg: string) => {
    const chainId = parseInt(arg);
    return {
        wrappedToken: getWrappedToken(chainId),
        nativeToken: getNativeToken(chainId),
        tokenList: getTokens(chainId),
        isValidToken: (address) => isValidToken(chainId, address),
        getToken: (address) => getToken(chainId, address),
        getTokenBySymBol: (symbol) => getTokenBySymbol(chainId, symbol),
        whitelistedTokens: getWhitelistedTokens(chainId),

        getContract: (name) => getContract(chainId, name),
    };
  }
  
export default TokenListSelector;