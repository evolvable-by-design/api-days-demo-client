import React from 'react';

import GenericAction from './GenericAction';
import FullscreenCenterContainer from '../../app/components/FullscreenCenterContainer';

const GenericActionFullscreen = ({ Loading, Success, ErrorComponent, MainComponent, actionKey, operation, onSuccessCallback, onErrorCallback }) =>
  <FullscreenCenterContainer>
    <GenericAction
      actionKey={actionKey}
      operation={operation}
      Loading={Loading}
      Success={Success}
      ErrorComponent={ErrorComponent}
      MainComponent={MainComponent}
      onSuccessCallback={onSuccessCallback}
      onErrorCallback={onErrorCallback}
    />
  </FullscreenCenterContainer>

export default GenericActionFullscreen;
