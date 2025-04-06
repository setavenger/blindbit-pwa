import { Transaction } from '@scure/btc-signer'
import { Wallet } from '../providers/wallet'
import { Utxo } from './types'
import { CoinsSelected } from './coinSelection'
import { getNetwork } from './network'
import { getCoinPrivKey } from './wallet'
import * as silentpay from './silentpayment/core'

export type UtxoWithoutId = Pick<Utxo, 'script' | 'silentPayment' | 'value' | 'vout'>

function bufferToUint8Array(buffer: Buffer): Uint8Array {
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

export async function buildPsbt(
  coinSelection: CoinsSelected, 
  destinationAddress: string, 
  wallet: Wallet, 
  mnemonic: string
): Promise<{ psbt: Transaction, walletOutputs: UtxoWithoutId[] }> {
  const network = getNetwork(wallet.network)
  const { amount, changeAmount, coins } = coinSelection

  const outputs = []
  const silentPayRecipients: silentpay.RecipientAddress[] = []
  const walletOutputs: UtxoWithoutId[] = []

  if (silentpay.isSilentPaymentAddress(destinationAddress, network)) {
    silentPayRecipients.push({
      address: destinationAddress,
      amount,
    })
  } else {
    outputs.push({
      address: destinationAddress,
      value: amount,
    })
  }

  if (changeAmount) {
    const changeAddress = silentpay.encodeSilentPaymentAddress(
      bufferToUint8Array(Buffer.from(wallet.publicKeys[wallet.network].scanPublicKey, 'hex')),
      bufferToUint8Array(Buffer.from(wallet.publicKeys[wallet.network].spendPublicKey, 'hex')),
      network
    )
    silentPayRecipients.push({
      address: changeAddress,
      amount: changeAmount,
    })
  }

  const inputPrivKeys: silentpay.PrivateKey[] = await Promise.all(
    coins.map((coin: Utxo) => getCoinPrivKey(coin, wallet.network, mnemonic).then((key) => ({ key, isXOnly: true }))),
  )

  const smallestOutpointCoin = coins.slice(1).reduce((acc, coin) => {
    const comp = Buffer.from(coin.txid, 'hex').reverse().compare(Buffer.from(acc.txid, 'hex').reverse())
    if (comp < 0 || (comp === 0 && coin.vout < acc.vout)) return coin
    return acc
  }, coins[0])

  const [silentPayOutputs, tweaks] = silentpay.createOutputs(inputPrivKeys, smallestOutpointCoin, silentPayRecipients, network)

  if (silentpay.isSilentPaymentAddress(destinationAddress, network)) {
    walletOutputs.push({
      script: silentPayOutputs[0].script.toString('hex'),
      value: amount,
      vout: 0,
      silentPayment: {
        tweak: tweaks[0],
        label: {
          pub_key: wallet.publicKeys[wallet.network].spendPublicKey,
          tweak: tweaks[0],
          address: destinationAddress,
          m: 0,
        },
      },
    })
  }

  if (changeAmount) {
    walletOutputs.push({
      script: silentPayOutputs[silentPayOutputs.length-1].script.toString('hex'),
      value: changeAmount,
      vout: 1,
      silentPayment: {
        tweak: tweaks[tweaks.length-1],
        label: {
          pub_key: wallet.publicKeys[wallet.network].spendPublicKey,
          tweak: tweaks[tweaks.length-1],
          address: silentpay.encodeSilentPaymentAddress(
            bufferToUint8Array(Buffer.from(wallet.publicKeys[wallet.network].scanPublicKey, 'hex')),
            bufferToUint8Array(Buffer.from(wallet.publicKeys[wallet.network].spendPublicKey, 'hex')),
            network
          ),
          m: 0,
        },
      },
    })
  }

  outputs.push(...silentPayOutputs)

  const psbt = new Transaction()

  for (const coin of coins) {
    psbt.addInput({
      txid: coin.txid,
      index: coin.vout,
      sighashType: 0,
      witnessUtxo: {
        amount: BigInt(coin.value),
        script: bufferToUint8Array(Buffer.from(coin.script, 'hex')),
      },
      tapInternalKey: coin.silentPayment
        ? bufferToUint8Array(Buffer.from(coin.script, 'hex').subarray(2))
        : bufferToUint8Array(Buffer.from(wallet.publicKeys[wallet.network].spendPublicKey, 'hex').subarray(1)),
    })
  }

  for (const output of outputs) {
    if ('address' in output) {
      psbt.addOutputAddress(output.address, BigInt(output.value), network)
    } else {
      psbt.addOutput({
        script: output.script,
        amount: BigInt(output.value),
      })
    }
  }
  
  return { psbt, walletOutputs }
}
