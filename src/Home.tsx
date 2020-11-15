import { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'

import qrcode from 'qrcode'
import { About } from './About'

const StyledContainer = styled.div`
  margin: 2px auto;
  text-align: center;
`

const StyledInput = styled.input`
  padding: 7px;
  width: 100%;
`

const StyledInputContainer = styled.div`
  padding: 6px 20px 5px 3px;
`

const DEFAULT_URL = 'https://github.com/ReeganExE/qrcode-extension'

function Home(): JSX.Element {
  const [url, setUrl] = useState(DEFAULT_URL)
  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      (tabs) => setUrl(tabs[0].url)
    )
  }, [])

  const onFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.setSelectionRange(0, e.target.value.length)
  }, [])

  const onLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value)
  }, [])

  if (!url) {
    return <>...</>
  }

  return (
    <>
      <StyledContainer>
        <About />
        <QRCode text={url} />
      </StyledContainer>
      <StyledInputContainer>
        <StyledInput autoFocus onFocus={onFocus} type="text" value={url} onChange={onLinkChange} />
      </StyledInputContainer>
    </>
  )
}

const QRCode: React.FC<{ text: string }> = ({ text }) => {
  const [dataUrl, setDataUrl] = useState(text)
  useEffect(() => {
    qrcode
      .toDataURL(text || DEFAULT_URL, { width: 200, margin: 2 })
      .then((url) => {
        setDataUrl(url)
      })
      .catch((err: Error) => {
        setDataUrl(err.message)
      })
  }, [text])
  return <img src={dataUrl} alt={text} />
}

export default Home
