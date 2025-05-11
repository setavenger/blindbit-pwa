import { webln } from '@getalby/sdk'
import { Utxo } from './types'
import { BlindBitInfo, BlindBitUtxo } from './blindbit-types'


export class NWCService {
  private nwc: webln.NostrWebLNProvider

  constructor(nwcUrl: string) {
    this.nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: nwcUrl
    })
  }

  async enable() {
    await this.nwc.enable()
  }

  async getUtxos(): Promise<Utxo[]> {
    const response = await this.nwc.listUtxos()
    return response.utxos.filter((utxo: BlindBitUtxo) => utxo.utxo_state === 'unspent').map((utxo: BlindBitUtxo) => ({
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

  async getInfo(): Promise<BlindBitInfo> {
    const info = await this.nwc.getInfo()
    return {
      blockHeight: info.blockHeight
    }
  }
} 
