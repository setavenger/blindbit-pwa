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
  const { changeBlindbitConnection, wallet } = useContext(WalletContext)

  const [mnemonic, setMnemonic] = useState<Mnemonic>('')

  // BlindBit Connection options
  // NWC
  const [nwcURL, setNWCURL] = useState('')
  // API-REST
  const [apiRestURL, setApiRestURL] = useState('')
  const [apiUser, setApiUser] = useState('')
  const [apiPass, setApiPass] = useState('')
  
  const [scanPrivKey, setScanPrivKey] = useState('')
  const [spendPubKey, setSpendPubKey] = useState('')

  const [scanCopied, setScanCopied] = useState(false)
  const [spendCopied, setSpendCopied] = useState(false)

  useEffect(() => {
    console.log('wallet', wallet)
    setNWCURL(wallet.nwcURL)
    setApiRestURL(wallet.apiRestURL)
    setApiUser(wallet.apiUser)
    setApiPass(wallet.apiPass)
  }, [wallet])

  const handleChangeNWCURL = (e: any) => {
    setNWCURL(e.target.value)
  }
  const handleChangeApiRestURL = (e: any) => {
    setApiRestURL(e.target.value)
  }
  const handleChangeApiUser = (e: any) => {
    setApiUser(e.target.value)
  }
  const handleChangeApiPass = (e: any) => {
    setApiPass(e.target.value)
  }

  const save = () => {
    console.log('nwcURL', nwcURL)
    console.log('apiRestURL', apiRestURL)
    console.log('apiUser', apiUser)
    console.log('apiPass', apiPass)
    changeBlindbitConnection(nwcURL, apiRestURL, apiUser, apiPass)
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
        {/* BlindBit Connection options */}
        {/* Either NWC or API-REST */}
        <div className="text-sm text-gray-500 mb-2">Note: Only NWC or API-REST is required. API-REST takes precedence if both are provided.</div>
        <span className='font-bold'>API-REST</span>
        <Input label='API-REST (include http:// or https://)' value={apiRestURL} onChange={handleChangeApiRestURL} type="text" />
        <Input label='API-USER' value={apiUser} onChange={handleChangeApiUser} type="text" />
        <Input label='API-PASS' value={apiPass} onChange={handleChangeApiPass} type="password" />
        <br/>
        <span className='font-bold'>NWC</span>
        <Input label='NWC' value={nwcURL} onChange={handleChangeNWCURL} type="text" />
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
            <p className='font-bold'>Spend Public Key</p>
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
