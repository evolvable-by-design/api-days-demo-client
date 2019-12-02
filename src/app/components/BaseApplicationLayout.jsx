import React from 'react'
import { Pane, majorScale } from 'evergreen-ui';

import Header from './Header';

const BaseApplicationLayout = ({children}) => {
  return (
  <Pane display="flex" flexDirection="row" height="100vh" width="100vw" overflow="hidden">
    <Header/>
    <Pane width="100%" height="100%" overflow="scroll"
      elevation={4}
      paddingX={majorScale(10)}
      paddingY={majorScale(5)}
    >
      {children}
    </Pane>
  </Pane>)
}

export default BaseApplicationLayout