import { useCallback,useMemo } from 'react'
import useSWR from 'swr'
import { Token as UniToken } from '@uniswap/sdk-core'
import { Pool } from '@uniswap/v3-sdk'
import Vault from '../abis/Vault.json'
import UniPool from '../abis/UniPool.json'
import { fetcher,parseValue,expandDecimals } from '../utils/index'
import * as defaultToken from '../samples/TokenList'

const ARBITRUM = 42161

export async function callContract(chainID, method, params, opts) {
  try {
    if (!Array.isArray(params) && typeof params === 'object' && opts === undefined) {
      opts = params;
      params = [];
    }
    if (!opts) {
      opts = {};
    }

    if (!opts.gasLimit) {
      opts.gasLimit = await getGasLimit(contract, method, params, opts.value);
    }

    const res = await contract[method](...params, { gasLimit: opts.gasLimit, value: opts.value });
    const txUrl = getExplorerUrl(chainID) + 'tx/' + res.hash;
    const sentMsg = opts.sentMsg || 'Transaction sent.';
    helperToast.success(
      <div>
        {sentMsg}{' '}
        <a href={txUrl} target="_blank" rel="noopener noreferrer">
          View status.
        </a>
        <br />
      </div>
    );
    if (opts.setPendingTxns) {
      const pendingTxn = {
        hash: res.hash,
        message: opts.successMsg || 'Transaction completed.',
      };
      opts.setPendingTxns(pendingTxns => [...pendingTxns, pendingTxn]);
    }
    return res;
  } catch (e) {
    let failMsg;
    const [message, type] = extractError(e);
    switch (type) {
      case NOT_ENOUGH_FUNDS:
        failMsg = (
          <div>
            There is not enough ETH in your account on Arbitrum to send this transaction.
            <br />
            <br />
            <a
              href={'https://arbitrum.io/bridge-tutorial/'}
              target="_blank"
              rel="noopener noreferrer"
            >
              Bridge ETH to Arbitrum
            </a>
          </div>
        );
        break;
      case USER_DENIED:
        failMsg = 'Transaction was cancelled.';
        break;
      case SLIPPAGE:
        failMsg =
          'The mark price has changed, consider increasing your Slippage Tolerance by clicking on the "..." icon next to your address.';
        break;
      default:
        failMsg = (
          <div>
            {opts.failMsg || 'Transaction failed.'}
            <br />
            {message && <ToastifyDebug>{message}</ToastifyDebug>}
          </div>
        );
    }
    helperToast.error(failMsg);
    throw e;
  }
}

export function getTokenBySymbol(tokenlist, symbol) {
  for (let i = 0; i < tokenlist.length; i++) {
    if(tokenlist[i].symbol === symbol) {
      return tokenlist[i]
    }
  }
  return undefined
}

function useGmxPriceFromArbitrum(library, active) {
  const poolAddress = '0x80A9ae39310abf666A87C743d6ebBD0E8C42158E'
  const { data: uniPoolSlot0, mutate: updateUniPoolSlot0 } = useSWR([`StakeV2:uniPoolSlot0:${active}`, ARBITRUM, poolAddress, "slot0"], {
    fetcher: fetcher(library, UniPool),
  })

  const vaultAddress = "0x489ee077994B6658eAfA855C308275EAd8097C4A"
  const ethAddress = getTokenBySymbol(defaultToken.default, "WETH").address
  const { data: ethPrice, mutate: updateEthPrice } = useSWR([`StakeV2:ethPrice:${active}`, ARBITRUM, vaultAddress, "getMinPrice", ethAddress], {
    fetcher: fetcher(library, Vault),
  })

  const gmxPrice = useMemo(() => {
    if (uniPoolSlot0 && ethPrice) {
      const tokenA = new UniToken(ARBITRUM, ethAddress, 18, "SYMBOL", "NAME")

      const gmxAddress = "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a"
      const tokenB = new UniToken(ARBITRUM, gmxAddress, 18, "SYMBOL", "NAME")

      const pool = new Pool(
        tokenA, // tokenA
        tokenB, // tokenB
        10000, // fee
        uniPoolSlot0.sqrtPriceX96, // sqrtRatioX96
        1, // liquidity
        uniPoolSlot0.tick, // tickCurrent
        []
      )

      const poolTokenPrice = pool.priceOf(tokenB).toSignificant(6)
      const poolTokenPriceAmount = parseValue(poolTokenPrice, 18)
      return poolTokenPriceAmount.mul(ethPrice).div(expandDecimals(1, 18))
    }
  }, [ethPrice, uniPoolSlot0, ethAddress])

  const mutate = useCallback(() => {
    updateUniPoolSlot0(undefined, true)
    updateEthPrice(undefined, true)
  }, [updateEthPrice, updateUniPoolSlot0])

  return { data: gmxPrice, mutate }
}

export function useGmxPrice(chainId, libraries, active) {
  const arbitrumLibrary = libraries && libraries.arbitrum ? libraries.arbitrum : undefined
  const { data: gmxPriceFromArbitrum, mutate: mutateFromArbitrum } = useGmxPriceFromArbitrum(arbitrumLibrary, active)

  const gmxPrice = gmxPriceFromArbitrum
  const mutate = useCallback(() => {
    mutateFromArbitrum()
  }, [mutateFromArbitrum])

  return {
    gmxPrice,
    gmxPriceFromArbitrum,
    mutate
  }
}
