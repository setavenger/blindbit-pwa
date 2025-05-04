export type NetworkName = 'mainnet' | 'testnet' | 'regtest' | 'signet'
export type Mnemonic = string
export type Satoshis = number

export type DecodedAddress = { script: Buffer }

export type NextIndex = number

export type Transaction = {
  txid: string
  amount: number
  unixdate: number
}

export type Transactions = Record<NetworkName, Transaction[]>

export type utxoState = 'unconfirmed' | 'unspent' | 'spent' | 'unconfirmed_spent'

export interface Label {
  pub_key: string
  tweak: string
  address: string
  m: number
}

export type Utxo = {
  txid: string
  vout: number
  value: number
  script: string
  silentPayment: {
    tweak: string
    label: Label | null
  }
}

export type Utxos = Record<NetworkName, Utxo[]>

export type PublicKeys = Record<NetworkName, { scanPublicKey: string; spendPublicKey: string }>

export type ScanOnlyKeySet = {
  scan_priv_key: string
  spend_pub_key: string
}
