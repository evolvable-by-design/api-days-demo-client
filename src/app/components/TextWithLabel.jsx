import React from 'react'
import { Pane, Heading, Paragraph, majorScale, minorScale } from 'evergreen-ui'

const TextWithLabel = ({label, children}) => 
  <Pane marginBottom={majorScale(1)}>
    <Heading size={400} marginBottom={minorScale(1)}>{label}</Heading>
    <Paragraph>{children}</Paragraph>
  </Pane>

export default TextWithLabel