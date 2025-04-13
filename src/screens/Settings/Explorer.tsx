import { useContext, useState } from 'react'
import Button from '../../components/Button'
import ButtonsOnBottom from '../../components/ButtonsOnBottom'
import Title from '../../components/Title'
import { ConfigContext } from '../../providers/config'
import { getExplorerNames } from '../../lib/explorers'
import Select from '../../components/Select'
import Container from '../../components/Container'
import Content from '../../components/Content'
import { WalletContext } from '../../providers/wallet'
import Input from '../../components/Input'
import Option from '../../components/Option'

export default function Explorer() {
  const { toggleShowConfig } = useContext(ConfigContext)
  const { changeExplorer, changeNWCURL, wallet } = useContext(WalletContext)

  const explorerNames = getExplorerNames(wallet.network)
  const [explorer, setExplorer] = useState(explorerNames.includes(wallet.explorer) ? wallet.explorer : explorerNames[0])

  const handleChangeExplorer = (e: any) => {
    setExplorer(e.target.value)
  }

  const save = () => {
    if (explorer) changeExplorer(explorer)
    toggleShowConfig()
  }

  return (
    <Container>
      <Content>
        <Title text='Explorer' subtext='Choose your explorer' />
        <Select label='Explorer' onChange={handleChangeExplorer} value={explorer}>
          {getExplorerNames(wallet.network).map((e) => (
            <Option key={e} value={e}>{e}</Option>
          ))}
        </Select>
      </Content>
      <ButtonsOnBottom>
        <Button onClick={save} label='Save' />
        <Button onClick={toggleShowConfig} label='Back to wallet' secondary />
      </ButtonsOnBottom>
    </Container>
  )
}
