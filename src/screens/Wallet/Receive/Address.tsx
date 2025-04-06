import { useContext, useEffect, useState } from 'react'
import { NavigationContext } from '../../../providers/navigation'
import Button from '../../../components/Button'
import { WalletContext } from '../../../providers/wallet'
import { getSilentPaymentAddress } from '../../../lib/wallet'
import QrCode from '../../../components/QrCode'
import { MdOutlineQuestionMark } from 'react-icons/md'
import Modal from '../../../components/Modal'
import { NetworkName } from '../../../lib/network'
import { Mnemonic } from '../../../lib/types'
import { useStorage } from '../../../lib/storage'

export default function Address() {
  const { navigate } = useContext(NavigationContext)
  const { wallet } = useContext(WalletContext)
  const [mnemonic] = useStorage<Mnemonic>('mnemonic', '')

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
          <QrCode value={address} />
        </div>
        <p
          className='text-md sm:text-sm text-gray-500 dark:text-gray-200 mt-2'
          style={{ maxWidth: '90vw', wordWrap: 'break-word' }}
        >
          {address.substring(0, 5)}
          <b>{address.substring(5, 13)}</b>
          {address.substring(13, address.length - 8)}
          <b>{address.substring(address.length - 8)}</b>
        </p>
      </div>

      <div className='mt-4'>
        <Button
          label={copied ? 'Copied!' : 'Copy Address'}
          onClick={copyAddress}
          disabled={!address}
        />
      </div>

      <Modal
        title='Help'
        open={showHelp}
        onClose={() => setShowHelp(false)}
      >
        <div className='p-4'>
          <p className='mb-4'>
            Silent Payment addresses are a new type of Bitcoin address that provides enhanced privacy.
            Each time you receive funds, a new unique address is generated while maintaining the same
            public address for the sender.
          </p>
          <p>
            This technology helps protect your privacy by making it harder to link your transactions
            together on the blockchain.
          </p>
        </div>
      </Modal>
    </div>
  )
}
