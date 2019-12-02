import React, { useEffect, useState } from 'react'

import { useAppContextState } from '../../app/context/AppContext'
import { useOperation } from '../services/ReactGenericOperation'

const GenericAction = ({ Loading, Success, MainComponent, ErrorComponent, actionKey, operation, onSuccessCallback, onErrorCallback }) => {
  const { genericOperationBuilder } = useAppContextState()
  
  const operationWithSemantics = operation
    ? genericOperationBuilder.fromOperation(operation)
    : genericOperationBuilder.fromKey(actionKey)

  const { apiDocumentation } = useAppContextState()
  const { form, filters, makeCall, isLoading, success, data, error, parameters, values } = useOperation(operationWithSemantics)
  const [ callAlreadyTriggered, setCallAlreadyTriggered ] = useState(false)

  useEffect(() => {
    if (operationWithSemantics.verb === 'get' && apiDocumentation.noRequiredParametersWithoutValue(operation, parameters, values)) {
      makeCall()
      setCallAlreadyTriggered(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (Loading && isLoading === true) {
    return Loading
  } else if (Success && success) {
    return <Success data={data} />
  } else if (ErrorComponent && error) {
    return <ErrorComponent error={error} />
  } else if (MainComponent) {
    return <MainComponent isLoading={isLoading} success={success} data={data} error={error} triggerCall={() => { setCallAlreadyTriggered(true); makeCall(); }} filtersToDisplay={filters} formToDisplay={form} operation={operation} />
  } else {
    if (!callAlreadyTriggered) {
      makeCall();
      setCallAlreadyTriggered(true);
    }
    
    return null;
  }
}

export default GenericAction;
