import { BlindBitUtxo, BlindBitInfo } from './blindbit-types'
import { Utxo } from './types'


interface BlindBitHeight {
  height: number
}

export class BlindBitScanAPI {
  private baseUrl: string
  private user: string
  private pass: string

  constructor(baseUrl: string, user: string, pass: string) {
    this.baseUrl = baseUrl
    this.user = user
    this.pass = pass
  }

  private getHeaders(): Headers {
    const headers = new Headers()
    headers.set('Authorization', `Basic ${btoa(`${this.user}:${this.pass}`)}`)
    return headers
  }

  async getUtxos(): Promise<Utxo[]> {
    const response = await fetch(`${this.baseUrl}/utxos`, { headers: this.getHeaders() })
    const data = await response.json()
    
    return data.filter((utxo: BlindBitUtxo) => utxo.utxo_state === 'unspent')
      .map((utxo: BlindBitUtxo) => ({
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
    const response = await fetch(`${this.baseUrl}/height`, { headers: this.getHeaders() })
    const data: BlindBitHeight = await response.json()
    
    return {
      blockHeight: data.height
    }
  }
}
