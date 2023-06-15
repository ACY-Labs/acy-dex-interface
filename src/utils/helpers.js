import { useWeb3React } from "@web3-react/core";
import { helperToast } from "@/acy-dex-futures/utils";

const RPC_PROVIDERS = {};
const SELECTED_NETWORK_LOCAL_STORAGE_KEY = "chainId"
//////////////////////////////////// test only
// const DEFAULT_CHAIN_ID = 56
const DEFAULT_CHAIN_ID = 80001
////////////////////////////////////
const supportedChainIds = [56, 97, 137, 80001]

export function getProvider(library, chainId) {
    let provider;
    if (library) {
        return library.getSigner();
    }
    // otherwise use default RPC provider
    provider = _.sample(RPC_PROVIDERS[chainId]);
    return new ethers.providers.StaticJsonRpcProvider(provider, { chainId });
}

export const switchNetwork = async (chainId) => {
    const chainIdHex = "0x" + chainId.toString(16);

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
        });
        helperToast.success("Connected to " + chainId);
        return chainId;
    } catch (ex) {
        // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
        // This error code indicates that the chain has not been added to MetaMask.
        // 4001 error means user has denied the request
        // If the error code is not 4001, then we need to add the network
        if (ex.code !== 4001) {
            // return await addNetwork(NETWORK_METADATA[chainId]);
            const chainListUrl = `https://chainlist.org/?search=${chainId}&testnets=true`
            helperToast.success(
                <div>
                  Please add chain {chainId} to your wallet via <a href={chainListUrl} target="_blank" rel="noopener noreferrer">ChainList</a>
                </div>
              );
        }

        console.error("error", ex);
    }
};

export const useChainId = (defaultChainId = DEFAULT_CHAIN_ID) => {
    let { chainId } = useWeb3React();
    let isFallbackChainId = false

    if (chainId != defaultChainId) {
        chainId = defaultChainId
        isFallbackChainId = true
    }

    return { chainId, isFallbackChainId };
}