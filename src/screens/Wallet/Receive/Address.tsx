import { useContext, useEffect, useState } from 'react'
import Button from '../../../components/Button'
import { WalletContext } from '../../../providers/wallet'
import { getSilentPaymentAddress } from '../../../lib/wallet'
import QrCode from '../../../components/QrCode'
import { MdOutlineQuestionMark } from 'react-icons/md'
import Modal from '../../../components/Modal'
import { Mnemonic } from '../../../lib/types'
import NeedsPassword from '../../../components/NeedsPassword'

export default function Address() {
  const { wallet } = useContext(WalletContext)
  const [mnemonic, setMnemonic] = useState<Mnemonic>('')

  const [address, setAddress] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const loadAddress = async () => {
      if (!mnemonic) return
      const silentAddress = await getSilentPaymentAddress(mnemonic, wallet.network)
      setAddress(silentAddress)
    }
    loadAddress()
  }, [mnemonic, wallet.network])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold'>Receive</h1>
        <button
          onClick={() => setShowHelp(true)}
          className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          <MdOutlineQuestionMark size={24} />
        </button>
      </div>

      <div className='flex flex-col mt-2 overflow-auto'>
        <div className='m-auto'>
          {address ? (
            <QrCode value={address} />
          ) : (
            <div className='w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg'>
              <p className='text-gray-500 dark:text-gray-400'>Loading address...</p>
            </div>
          )}
        </div>
        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Your Silent Payment address</p>
          <p className='mt-2 font-mono break-all'>{address}</p>
          <div className='mt-4'>
            <Button
              onClick={copyAddress}
              label={copied ? 'Copied!' : 'Copy'}
              disabled={!address}
            />
          </div>
        </div>
      </div>

      <Modal title='About Silent Payments' open={showHelp} onClose={() => setShowHelp(false)}>
        <div className='space-y-4'>
          <p>
            Silent Payments are a new type of Bitcoin address that provides enhanced privacy by making it impossible to link payments to your wallet.
          </p>
          <p>
            Each time you receive a payment, a new address is generated automatically, but all payments are received to the same wallet.
          </p>
          <p>
            You can share this address publicly - it's safe to post on social media or include in invoices.
          </p>
        </div>
      </Modal>

      <NeedsPassword title='Show Address' onMnemonic={setMnemonic} />
    </div>
  )
}
