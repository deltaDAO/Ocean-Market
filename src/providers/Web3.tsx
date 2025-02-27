import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement,
  ReactNode,
  useCallback
} from 'react'
import Web3 from 'web3'
import Web3Modal, { getProviderInfo, IProviderInfo } from 'web3modal'
import { infuraProjectId as infuraId, portisId } from '../../app.config'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { Logger } from '@oceanprotocol/lib'
import { isBrowser } from '../utils'
import {
  EthereumListsChain,
  getNetworkDataById,
  getNetworkDisplayName
} from '../utils/web3'
import { graphql } from 'gatsby'
import { UserBalance } from '../@types/TokenBalance'
import { getOceanBalance } from '../utils/ocean'
import useNetworkMetadata from '../hooks/useNetworkMetadata'

interface Web3ProviderValue {
  web3: Web3
  web3Provider: any
  web3Modal: Web3Modal
  web3ProviderInfo: IProviderInfo
  accountId: string
  balance: UserBalance
  networkId: number
  chainId: number
  networkDisplayName: string
  networkData: EthereumListsChain
  block: number
  isTestnet: boolean
  web3Loading: boolean
  connect: () => Promise<void>
  logout: () => Promise<void>
}

const web3ModalTheme = {
  background: 'var(--background-body)',
  main: 'var(--font-color-heading)',
  secondary: 'var(--brand-grey-light)',
  border: 'var(--border-color)',
  hover: 'var(--background-highlight)'
}

// HEADS UP! We inline-require some packages so the Gatsby SSR build does not break.
// We only need them client-side.
const providerOptions = isBrowser
  ? {
      walletconnect: {
        package: WalletConnectProvider,
        options: { infuraId }
      },
      portis: {
        package: require('@portis/web3'),
        options: {
          id: portisId
        }
      }
      // torus: {
      //   package: require('@toruslabs/torus-embed')
      //   // options: {
      //   //   networkParams: {
      //   //     host: oceanConfig.url, // optional
      //   //     chainId: 1337, // optional
      //   //     networkId: 1337 // optional
      //   //   }
      //   // }
      // }
    }
  : {}

export const web3ModalOpts = {
  cacheProvider: true,
  providerOptions,
  theme: web3ModalTheme
}

const refreshInterval = 20000 // 20 sec.

const networksQuery = graphql`
  query {
    allNetworksMetadataJson {
      edges {
        node {
          chain
          network
          networkId
          chainId
          nativeCurrency {
            name
            symbol
            decimals
          }
        }
      }
    }
  }
`

const Web3Context = createContext({} as Web3ProviderValue)

function Web3Provider({ children }: { children: ReactNode }): ReactElement {
  const { networksList } = useNetworkMetadata()

  const [web3, setWeb3] = useState<Web3>()
  const [web3Provider, setWeb3Provider] = useState<any>()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [web3ProviderInfo, setWeb3ProviderInfo] = useState<IProviderInfo>()
  const [networkId, setNetworkId] = useState<number>()
  const [chainId, setChainId] = useState<number>()
  const [networkDisplayName, setNetworkDisplayName] = useState<string>()
  const [networkData, setNetworkData] = useState<EthereumListsChain>()
  const [block, setBlock] = useState<number>()
  const [isTestnet, setIsTestnet] = useState<boolean>()
  const [accountId, setAccountId] = useState<string>()
  const [web3Loading, setWeb3Loading] = useState<boolean>(true)
  const [balance, setBalance] = useState<UserBalance>({
    eth: '0',
    ocean: '0'
  })

  // -----------------------------------
  // Helper: connect to web3
  // -----------------------------------
  const connect = useCallback(async () => {
    if (!web3Modal) {
      setWeb3Loading(false)
      return
    }
    try {
      setWeb3Loading(true)
      Logger.log('[web3] Connecting Web3...')

      const provider = await web3Modal?.connect()
      setWeb3Provider(provider)

      const web3 = new Web3(provider)
      setWeb3(web3)
      Logger.log('[web3] Web3 created.', web3)

      const networkId = await web3.eth.net.getId()
      setNetworkId(networkId)
      Logger.log('[web3] network id ', networkId)

      const chainId = await web3.eth.getChainId()
      setChainId(chainId)
      Logger.log('[web3] chain id ', chainId)

      const accountId = (await web3.eth.getAccounts())[0]
      setAccountId(accountId)
      Logger.log('[web3] account id', accountId)
    } catch (error) {
      Logger.error('[web3] Error: ', error.message)
    } finally {
      setWeb3Loading(false)
    }
  }, [web3Modal])

  // -----------------------------------
  // Helper: Get user balance
  // -----------------------------------
  const getUserBalance = useCallback(async () => {
    if (!accountId || !networkId || !web3) return

    try {
      const balance = {
        eth: web3.utils.fromWei(await web3.eth.getBalance(accountId, 'latest')),
        ocean: await getOceanBalance(accountId, networkId, web3)
      }
      setBalance(balance)
      Logger.log('[web3] Balance: ', balance)
    } catch (error) {
      Logger.error('[web3] Error: ', error.message)
    }
  }, [accountId, networkId, web3])

  // -----------------------------------
  // Create initial Web3Modal instance
  // -----------------------------------
  useEffect(() => {
    if (web3Modal) {
      setWeb3Loading(false)
      return
    }

    async function init() {
      // note: needs artificial await here so the log message is reached and output
      const web3ModalInstance = await new Web3Modal(web3ModalOpts)
      setWeb3Modal(web3ModalInstance)
      Logger.log('[web3] Web3Modal instance created.', web3ModalInstance)
    }
    init()
  }, [connect, web3Modal])

  // -----------------------------------
  // Reconnect automatically for returning users
  // -----------------------------------
  useEffect(() => {
    if (!web3Modal?.cachedProvider) return

    async function connectCached() {
      Logger.log(
        '[web3] Connecting to cached provider: ',
        web3Modal.cachedProvider
      )
      await connect()
    }
    connectCached()
  }, [connect, web3Modal])

  // -----------------------------------
  // Get and set user balance
  // -----------------------------------
  useEffect(() => {
    getUserBalance()

    // init periodic refresh of wallet balance
    const balanceInterval = setInterval(() => getUserBalance(), refreshInterval)

    return () => {
      clearInterval(balanceInterval)
    }
  }, [getUserBalance])

  // -----------------------------------
  // Get and set network metadata
  // -----------------------------------
  useEffect(() => {
    if (!networkId) return
    const networkData = getNetworkDataById(networksList, networkId)
    setNetworkData(networkData)
    Logger.log(
      networkData
        ? `[web3] Network metadata found.`
        : `[web3] No network metadata found.`,
      networkData
    )

    // Construct network display name
    const networkDisplayName = getNetworkDisplayName(networkData, networkId)
    setNetworkDisplayName(networkDisplayName)

    // Figure out if we're on a chain's testnet, or not
    setIsTestnet(networkData?.network !== 'mainnet')

    Logger.log(`[web3] Network display name set to: ${networkDisplayName}`)
  }, [networkId, networksList])

  // -----------------------------------
  // Get and set latest head block
  // -----------------------------------
  useEffect(() => {
    if (!web3) return

    async function getBlock() {
      const block = await web3.eth.getBlockNumber()
      setBlock(block)
      Logger.log('[web3] Head block: ', block)
    }
    getBlock()
  }, [web3, networkId])

  // -----------------------------------
  // Get and set web3 provider info
  // -----------------------------------
  // Workaround cause getInjectedProviderName() always returns `MetaMask`
  // https://github.com/oceanprotocol/market/issues/332
  useEffect(() => {
    if (!web3Provider) return

    const providerInfo = getProviderInfo(web3Provider)
    setWeb3ProviderInfo(providerInfo)
  }, [web3Provider])

  // -----------------------------------
  // Logout helper
  // -----------------------------------
  async function logout() {
    if (web3 && web3.currentProvider && (web3.currentProvider as any).close) {
      await (web3.currentProvider as any).close()
    }
    await web3Modal.clearCachedProvider()
  }

  // -----------------------------------
  // Handle change events
  // -----------------------------------
  async function handleChainChanged(chainId: string) {
    Logger.log('[web3] Chain changed', chainId)
    const networkId = await web3.eth.net.getId()
    setChainId(Number(chainId))
    setNetworkId(Number(networkId))
  }

  async function handleNetworkChanged(networkId: string) {
    Logger.log('[web3] Network changed', networkId)
    const chainId = await web3.eth.getChainId()
    setNetworkId(Number(networkId))
    setChainId(Number(chainId))
  }

  async function handleAccountsChanged(accounts: string[]) {
    Logger.log('[web3] Account changed', accounts[0])
    setAccountId(accounts[0])
  }

  useEffect(() => {
    if (!web3Provider || !web3) return

    web3Provider.on('chainChanged', handleChainChanged)
    web3Provider.on('networkChanged', handleNetworkChanged)
    web3Provider.on('accountsChanged', handleAccountsChanged)

    return () => {
      web3Provider.removeListener('chainChanged', handleChainChanged)
      web3Provider.removeListener('networkChanged', handleNetworkChanged)
      web3Provider.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [web3Provider, web3])

  return (
    <Web3Context.Provider
      value={{
        web3,
        web3Provider,
        web3Modal,
        web3ProviderInfo,
        accountId,
        balance,
        networkId,
        chainId,
        networkDisplayName,
        networkData,
        block,
        isTestnet,
        web3Loading,
        connect,
        logout
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

// Helper hook to access the provider values
const useWeb3 = (): Web3ProviderValue => useContext(Web3Context)

export { Web3Provider, useWeb3, Web3ProviderValue, Web3Context }
export default Web3Provider
