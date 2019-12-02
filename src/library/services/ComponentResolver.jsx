import React from 'react';
import SomethingWrongHappened from "../../components/SomethingWrongHappened";

import { ProjectSemanticBuilder } from '../../components/Project';

const components = [ProjectSemanticBuilder];

function ComponentResolver(semanticData) {
  const maybeComponent = components
    .find(semanticComponent => semanticComponent.canDisplay(semanticData.type));
  const Component = maybeComponent ? maybeComponent.build() : undefined;
  
  if (!Component) {
    // Temporary - TODO: build a generic component for this purpose.
    return <SomethingWrongHappened text={`Unable to display data of type: ${semanticData.type}`} />
  } else {
    return <Component value={semanticData} />
  }
}

export default ComponentResolver;