import { webln } from '@getalby/sdk'
import { Utxo, Label } from './types'

interface NWCUtxo {
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

interface NWCResponse {
  utxos: NWCUtxo[]
}

interface NWCInfo {
  blockHeight: number
}

export class NWCService {
  private nwc: webln.NostrWebLNProvider

  constructor(private scanPrivKey: string, private nwcUrl: string) {
    this.nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: nwcUrl
    })
  }

  async enable() {
    await this.nwc.enable()
  }

  async getUtxos(): Promise<Utxo[]> {
    const response = await this.nwc.listUtxos()
    return response.utxos.filter((utxo: NWCUtxo) => utxo.utxo_state === 'unspent').map((utxo: NWCUtxo) => ({
      txid: utxo.txid,
      vout: utxo.vout,
      value: utxo.amount,
      script: utxo.pub_key,
      silentPayment: {
        tweak: utxo.priv_key_tweak,
        label: utxo.label ? {
          pub_key: utxo.label.pub_key,
          tweak: utxo.label.tweak,
          address: utxo.label.address,
          m: utxo.label.m
        } : null
      }
    }))
  }

  async getInfo(): Promise<NWCInfo> {
    const info = await this.nwc.getInfo()
    return {
      blockHeight: info.blockHeight
    }
  }
} 