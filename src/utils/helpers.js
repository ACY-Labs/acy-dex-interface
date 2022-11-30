import { useWeb3React } from "@web3-react/core";

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

export const switchNetwork = async (chainId, active) => {
    if (!active) {
        // chainId in localStorage allows to switch network even if wallet is not connected
        // or there is no wallet at all
        localStorage.setItem(SELECTED_NETWORK_LOCAL_STORAGE_KEY, chainId);
        document.location.reload();
        return;
    }

    try {
        const chainIdHex = "0x" + chainId.toString(16);
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
        });
        helperToast.success("Connected to " + getChainName(chainId));
        return getChainName(chainId);
    } catch (ex) {
        // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
        // This error code indicates that the chain has not been added to MetaMask.
        // 4001 error means user has denied the request
        // If the error code is not 4001, then we need to add the network
        if (ex.code !== 4001) {
            return await addNetwork(NETWORK_METADATA[chainId]);
        }

        console.error("error", ex);
    }
};

export const useChainId = () => {
    let { chainId } = useWeb3React();

    if (!chainId) {
        const chainIdFromLocalStorage = localStorage.getItem(SELECTED_NETWORK_LOCAL_STORAGE_KEY);
        if (chainIdFromLocalStorage) {
            chainId = parseInt(chainIdFromLocalStorage);
            if (!chainId) {
                // localstorage value is invalid
                localStorage.removeItem(SELECTED_NETWORK_LOCAL_STORAGE_KEY);
            }
        }
    }

    if (!chainId || !supportedChainIds.includes(chainId)) {
        chainId = DEFAULT_CHAIN_ID;
    }
    return { chainId };
}