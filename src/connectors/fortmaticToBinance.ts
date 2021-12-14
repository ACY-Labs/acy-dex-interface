// 此处为自设定fortmatic--web3-react库不支持fortmatic对binance的连接
// 此代码基于web3-react编写

import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'


const BSCOptions_main = {
  /* Smart Chain mainnet RPC URL */
  rpcUrl: 'https://bsc-dataseed.binance.org/', 
  chainId: 56 // Smart Chain mainnet chain id
}
const BSCOptions_test = {
  /* Smart Chain - Testnet RPC URL */
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/', 
    chainId: 97 // Smart Chain - Testnet chain id
}

const chainIdToNetwork: { [network: number]: any } = {
  1: 'mainnet',
  3: 'ropsten',
  4: 'rinkeby',
  42: 'kovan',
  56: BSCOptions_main,
  97: BSCOptions_test,
}

interface FortmaticConnectorArguments_test {
  apiKey: string
  chainId: number
}

export class FortmaticConnector_test extends AbstractConnector {
  private readonly apiKey: string 
  private readonly chainId: number

  public fortmatic: any

  constructor({ apiKey, chainId }: FortmaticConnectorArguments_test) {
    invariant(Object.keys(chainIdToNetwork).includes(chainId.toString()), `Unsupported chainId ${chainId}`)
    super({ supportedChainIds: [chainId] })

    this.apiKey = apiKey
    this.chainId = chainId
  }

  public async activate(): Promise<ConnectorUpdate> {
    if (!this.fortmatic) {
      const Fortmatic = await import('fortmatic').then(m => m?.default ?? m)
      this.fortmatic = new Fortmatic(
        this.apiKey,
        this.chainId === 1 || this.chainId === 4 ? undefined : chainIdToNetwork[this.chainId]
      )
    }

    const account = await this.fortmatic
      .getProvider()
      .enable()
      .then((accounts: string[]): string => accounts[0])

    return { provider: this.fortmatic.getProvider(), chainId: this.chainId, account }
  }

  public async getProvider(): Promise<any> {
    return this.fortmatic.getProvider()
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.fortmatic
      .getProvider()
      .send('eth_accounts')
      .then((accounts: string[]): string => accounts[0])
  }

  public deactivate() {}

  public async close() {
    await this.fortmatic.user.logout()
    this.emitDeactivate()
  }
}