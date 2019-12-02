import React from 'react';

import { Spinner } from 'evergreen-ui';

import FullscreenCenterContainer from './FullscreenCenterContainer';

const FullscreenLoader = () => (
  <FullscreenCenterContainer>
    <Spinner />
  </FullscreenCenterContainer>) 

export default FullscreenLoader;
