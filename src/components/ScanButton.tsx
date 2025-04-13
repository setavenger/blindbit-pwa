import { useContext, useState } from 'react'
import SearchIcon from '../icons/Search'
import Button from './Button'
import { WalletContext } from '../providers/wallet'
import NeedsPassword from './NeedsPassword'

export default function ScanButton() {
  const { wallet, reloadWallet, scanning } = useContext(WalletContext)

  const [askPassword, setAskPassword] = useState(false)
  const [mnemonic, setMnemonic] = useState<string>()

  const handleScan = () => {
    if (!mnemonic) setAskPassword(true)
    else reloadWallet(mnemonic, wallet)
  }

  const handleMnemonicUnlock = (mnemonic: string) => {
    setMnemonic(mnemonic)
    reloadWallet(mnemonic, wallet)
  }

  return (
    <>
      {askPassword ? <NeedsPassword title='Sync' onMnemonic={handleMnemonicUnlock} onClose={() => setAskPassword(false)} /> : null}
      {scanning ? <p className='animate-bounce' > Syncing with Scan Server</p> : null}
      <Button icon={<SearchIcon />} label='Sync' onClick={() => handleScan()} disabled={scanning} /> </>
  )
}
