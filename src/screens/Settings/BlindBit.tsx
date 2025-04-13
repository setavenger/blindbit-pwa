import { useContext, useEffect, useState } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import Container from '../../components/Container'
import Content from '../../components/Content'
import { WalletContext } from '../../providers/wallet'
import Input from '../../components/Input'
import NeedsPassword from '../../components/NeedsPassword'
import { Mnemonic } from '../../lib/types'
import { getScanOnlyKeys } from '../../lib/wallet'

export default function Explorer() {
  const { toggleShowConfig } = useContext(ConfigContext)
  const { changeNWCURL, wallet } = useContext(WalletContext)

  const [mnemonic, setMnemonic] = useState<Mnemonic>('')

  const [nwcURL, setNWCURL] = useState('')
  const [scanPrivKey, setScanPrivKey] = useState('')
  const [spendPubKey, setSpendPubKey] = useState('')

  const [scanCopied, setScanCopied] = useState(false)
  const [spendCopied, setSpendCopied] = useState(false)

  const handleChangeNWCURL = (e: any) => {
    setNWCURL(e.target.value)
  }

  const save = () => {
    if (nwcURL) changeNWCURL(nwcURL)
    toggleShowConfig()
  }

  const copyScanPriv = () => {
    navigator.clipboard.writeText(scanPrivKey)
    setScanCopied(true)
    setTimeout(() => setScanCopied(false), 3000)
  }

  const copySpendPub = () => {
    navigator.clipboard.writeText(spendPubKey)
    setSpendCopied(true)
    setTimeout(() => setSpendCopied(false), 3000)
  }

  useEffect(() => {
    const loadAddress = async () => {
      if (!mnemonic) return
      const keys = await getScanOnlyKeys(mnemonic, wallet.network)
      setScanPrivKey(keys.scan_priv_key);
      setSpendPubKey(keys.spend_pub_key);
    }
    loadAddress()
  }, [mnemonic, wallet.network])

  return (
    <Container>
      <Content>
        <Title text='BlindBit' subtext='Setup BlindBit Scan' />
        <Input label='NWC' placeholder={wallet.nwcURL} onChange={handleChangeNWCURL} type="text" />
        <br/>
        <div>
          <div className='grid justify-items-center'>
            <p className='font-bold'>Scan Private Key</p>
            <p className='mt-2 font-mono break-all'>{scanPrivKey}</p>
            <div className='w-1/2 mt-2'>
              <Button 
                onClick={copyScanPriv} 
                label={scanCopied ? 'Copied!' : 'Copy'}
                secondary
              />
            </div>
          </div>
          <br/>
          <div className='grid justify-items-center'>
            <p className='font-bold'>Scan Public Key</p>
            <p className='mt-2 font-mono break-all'>{spendPubKey}</p>
            <div className='w-1/2 mt-2'>
            <Button 
              onClick={copySpendPub} 
              label={spendCopied ? 'Copied!' : 'Copy'}
              secondary
            />
            </div>
          </div>
        </div>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={save} label='Save' />
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
      <NeedsPassword title='Show Scan only Keys' onMnemonic={setMnemonic} />
    </Container>
  )
}
