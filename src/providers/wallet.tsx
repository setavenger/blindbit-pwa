import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { useStorage } from '../lib/storage'
import { NavigationContext, Pages } from './navigation'
import { NetworkName } from '../lib/network'
import { Mnemonic, Transactions, Utxos, PublicKeys, Transaction, Utxo } from '../lib/types'
import { ExplorerName, getExplorerNames, getRestApiExplorerURL } from '../lib/explorers'
import { defaultExplorer, defaultNetwork } from '../lib/constants'
import { getSilentPaymentScanPrivateKey, isInitialized } from '../lib/wallet'
import { EsploraChainSource } from '../lib/chainsource'
import { Updater, applyUpdate } from '../lib/updater'
import { notify } from '../components/Toast'
import { NWCService } from '../lib/nwc'

export interface Wallet {
  explorer: ExplorerName
  network: NetworkName
  mempoolTransactions: Transactions
  transactions: Transactions
  utxos: Utxos
  publicKeys: PublicKeys
  scannedBlockHeight: Record<NetworkName, number>
  nwcURL: string
}

const defaultWallet: Wallet = {
  explorer: defaultExplorer,
  network: defaultNetwork,
  nwcURL: '',
  mempoolTransactions: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
  },
  transactions: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
  },
  utxos: {
    [NetworkName.Mainnet]: [],
    [NetworkName.Regtest]: [],
    [NetworkName.Testnet]: [],
  },
  publicKeys: {
    [NetworkName.Mainnet]: { scanPublicKey: '', spendPublicKey: '' },
    [NetworkName.Regtest]: { scanPublicKey: '', spendPublicKey: '' },
    [NetworkName.Testnet]: { scanPublicKey: '', spendPublicKey: '' },
  },
  scannedBlockHeight: {
    [NetworkName.Mainnet]: -1,
    [NetworkName.Regtest]: -1,
    [NetworkName.Testnet]: -1,
  },
}

interface WalletContextProps {
  changeExplorer: (e: ExplorerName) => void
  changeNWCURL: (url: string) => void
  changeNetwork: (n: NetworkName) => void
  reloadWallet: (mnemonic: Mnemonic, wallet: Wallet) => void
  resetWallet: () => void
  initWallet: (publicKeys: PublicKeys, restoreFrom?: number, network?: NetworkName) => Promise<Wallet>
  pushMempoolTransaction: (spentCoins: { txid: string; vout: number }[], newUtxos: Utxo[], txid: string) => void
  wallet: Wallet
  scanning: boolean
}

export const WalletContext = createContext<WalletContextProps>({
  changeExplorer: () => {},
  changeNWCURL: () => {},
  changeNetwork: () => {},
  reloadWallet: () => {},
  pushMempoolTransaction: () => {},
  resetWallet: () => {},
  initWallet: () => Promise.resolve(defaultWallet),
  wallet: defaultWallet,
  scanning: false,
})

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { navigate } = useContext(NavigationContext)

  const [scanning, setScanning] = useState(false)
  const [scanningProgress, setScanningProgress] = useState<number>()
  const [wallet, setWallet] = useStorage<Wallet>('wallet', defaultWallet)

  const changeExplorer = async (explorer: ExplorerName) => {
    const clone = { ...wallet, explorer }
    setWallet(clone)
  }

  const changeNetwork = async (networkName: NetworkName) => {
    const clone = { ...wallet, network: networkName }
    const explorersFromNetwork = getExplorerNames(networkName)
    if (!explorersFromNetwork.includes(clone.explorer)) {
      clone.explorer = explorersFromNetwork[0]
    }

    if (wallet.scannedBlockHeight[networkName] === -1) {
      try {
        const explorer = new EsploraChainSource(getRestApiExplorerURL(clone))
        const height = await explorer.getChainTipHeight()
        clone.scannedBlockHeight[networkName] = height
      } catch (e) {
        notify(extractErrorMessage(e))
        clone.scannedBlockHeight[networkName] = 0
      }
    }

    setWallet(clone)
  }

  const changeNWCURL = async (url: string) => {
    const clone = {
      ...wallet,
      nwcURL: url
    }
    setWallet(clone)
  }

  const reloadWallet = async (mnemonic: string, wallet: Wallet) => {
    if (!mnemonic || scanning) return
    if (wallet.nwcURL === '') {
      notify('set nostr wallet connect in explorer settings')
      return
    }
    try {
      setScanning(true)
      setScanningProgress(0)

      const scanPrivKey = await getSilentPaymentScanPrivateKey(mnemonic, wallet.network)

      const nwc = new NWCService(scanPrivKey.toString('hex'), wallet.nwcURL)
      await nwc.enable()

      const info = await nwc.getInfo()
      const utxos = await nwc.getUtxos()

      const updatedWallet = {
        ...wallet,
        utxos: {
          ...wallet.utxos,
          [wallet.network]: utxos
        },
        scannedBlockHeight: {
          ...wallet.scannedBlockHeight,
          [wallet.network]: info.blockHeight
        }
      }

      setWallet(updatedWallet)
    } catch (e) {
      console.error(e)
      notify(extractErrorMessage(e))
    } finally {
      setScanning(false)
      setScanningProgress(undefined)
    }
  }

  const pushMempoolTransaction = (spentCoins: { txid: string; vout: number }[], newUtxos: Utxo[], txid: string) => {
    const tx: Transaction = {
      amount: 0,
      txid,
      unixdate: Math.floor(Date.now() / 1000),
    }

    for (const coin of spentCoins) {
      const utxo = wallet.utxos[wallet.network].find((u) => u.txid === coin.txid && u.vout === coin.vout)
      if (utxo) tx.amount -= utxo.value
    }

    for (const coin of newUtxos) {
      tx.amount += coin.value
    }

    const w: Wallet = {
      ...applyUpdate(wallet, {
        newUtxos: newUtxos,
        spentUtxos: spentCoins,
        transactions: [],
      }),
      mempoolTransactions: {
        ...wallet.mempoolTransactions,
        [wallet.network]: [...wallet.mempoolTransactions[wallet.network], tx],
      },
    }

    setWallet(w)
  }

  const resetWallet = () => {
    setWallet(defaultWallet)
    navigate(Pages.Init)
  }

  const initWallet = async (publicKeys: PublicKeys, restoreFrom?: number, network?: NetworkName) => {
    const explorer = new EsploraChainSource(getRestApiExplorerURL(wallet))
    const walletBirthHeight = restoreFrom ?? (await explorer.getChainTipHeight())
    const net = network ?? wallet.network

    const initWallet = {
      ...wallet,
      publicKeys,
      network: net,
      scannedBlockHeight: {
        ...defaultWallet.scannedBlockHeight,
        [net]: walletBirthHeight,
      },
      explorer: network ? getExplorerNames(net)[0] : wallet.explorer,
    }

    setWallet(initWallet)
    return initWallet
  }

  useEffect(() => {
    navigate(isInitialized(wallet) ? Pages.Wallet : Pages.Init)
  }, [])

  return (
    <WalletContext.Provider
      value={{
        changeExplorer,
        changeNWCURL,
        changeNetwork,
        reloadWallet,
        resetWallet,
        wallet,
        initWallet,
        scanning,
        pushMempoolTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

function extractErrorMessage(e: any): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'An error occurred'
}
