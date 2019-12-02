import React from 'react';

import { Pane } from 'evergreen-ui';

const FullscreenCenterContainer = ({children}) =>
  <Pane width="100vw" minHeight="100vh" display="flex" flexDirection="column" justifyContent="center" paddingX="25%">
    {children}
  </Pane>

export default FullscreenCenterContainer