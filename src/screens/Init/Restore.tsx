import { useContext, useEffect, useState } from 'react'
import { validateMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english';
import Button from '../../components/Button'
import Title from '../../components/Title'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import ErrorBox from '../../components/Error'
import { NavigationContext, Pages } from '../../providers/navigation'
import Content from '../../components/Content'
import { FlowContext } from '../../providers/flow'
import Container from '../../components/Container'
import Textarea from '../../components/Textarea'

enum ButtonLabel {
  Incomplete = 'Incomplete mnemonic',
  Invalid = 'Invalid mnemonic',
  Ok = 'Continue',
}

enum Step {
  Passphrase,
  BirthHeight,
}

export default function InitOld() {
  const { navigate } = useContext(NavigationContext)
  const { setInitInfo } = useContext(FlowContext)

  const [label, setLabel] = useState(ButtonLabel.Incomplete)
  const [mnemonic, setMnemonic] = useState('')
  const [birthHeight, setBirthHeight] = useState(-1)
  const [step, setStep] = useState(Step.Passphrase)

  useEffect(() => {
    const words = mnemonic.trim().split(/\s+/)
    const wordCount = words.length
    if (wordCount !== 24 && wordCount !== 12) return setLabel(ButtonLabel.Incomplete)
    const valid = validateMnemonic(words.join(' '), wordlist)
    setLabel(valid ? ButtonLabel.Ok : ButtonLabel.Invalid)
  }, [mnemonic])

  const handleBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const birth = parseInt(value, 10)
    if (Number.isNaN(birth) || birth < 0) setLabel(ButtonLabel.Invalid)
    setBirthHeight(parseInt(value, 10))
    setLabel(ButtonLabel.Ok)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMnemonic(e.target.value)
  }

  const handleCancel = () => navigate(Pages.Init)

  const handleProceed = () => {
    if (step === Step.Passphrase) {
      setStep(Step.BirthHeight)
      return
    }

    setInitInfo({ mnemonic: mnemonic.trim(), restoreFrom: birthHeight })
    navigate(Pages.InitPassword)
  }

  const disabled = label !== ButtonLabel.Ok

  return (
    <Container>
      <Content>
        <Title text='Restore wallet' subtext='Enter your 24-word mnemonic' />
        <p className='p-2' />
        <Textarea
          label='Mnemonic'
          value={mnemonic}
          onChange={handleChange}
        />
        <p className='p-2' />
        <ErrorBox error={label === ButtonLabel.Invalid} text='Invalid mnemonic' />
      </Content>
      <ButtonsOnBottom>
        <Button onClick={handleProceed} label={label} disabled={disabled} />
        <Button onClick={handleCancel} label='Cancel' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
