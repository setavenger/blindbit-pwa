export interface BlindBitUtxo {
    txid: string
    vout: number
    amount: number
    priv_key_tweak: string
    pub_key: string
    timestamp: number
    utxo_state: string
    label?: {
      pub_key: string
      tweak: string
      address: string
      m: number
    }
  }
  
  export interface BlindBitInfo {
    blockHeight: number
  }
  