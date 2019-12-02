import React from 'react'
import { Alert } from 'evergreen-ui'

export const defaultSemanticComponentErrorHandler = (forType) => (e) => {
  console.error(e);
  if (e.missingData) {
    return <Alert
      intent="danger"
      title={`Unable to display ${forType}, required data are missing: ${e.missingData}`}
    />
  }
}

export class AuthenticationRequiredError extends Error {}
export class NotFoundOperation extends Error {}