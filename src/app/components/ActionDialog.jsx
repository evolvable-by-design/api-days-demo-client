import React, { useEffect } from 'react'
import { Alert, Dialog } from 'evergreen-ui' 

import { useOperation } from '../../library/services/ReactGenericOperation'

import GenericForm from './GenericForm'
import { capitalize, spaceCamelCaseWord } from '../utils/javascriptUtils'
import { useAppContextState } from '../context/AppContext'

const ActionDialog = ({ isShown, title, operationSchema, onSuccessCallback, onCloseComplete, setHasError }) => {
  const { genericOperationBuilder } = useAppContextState()
  const operation = genericOperationBuilder.fromOperation(operationSchema)
  const { parametersDetail, makeCall, isLoading, data, error, success } = useOperation(operation)

  useEffect(() => { if (success) { onSuccessCallback(data) } }, [success])

  return <Dialog
    isShown={isShown !== undefined ? isShown : true}
    title={capitalize(spaceCamelCaseWord(title))}
    confirmLabel="Confirm"
    isConfirmLoading={isLoading}
    onConfirm={makeCall}
    onCloseComplete={onCloseComplete}
  >
    <GenericForm {...parametersDetail} setHasError={setHasError} />
    { success && <Alert intent="success" title={'Success'} /> }
    { error && <Alert intent="danger" title={error.message || error} /> }
  </Dialog>
}

export default ActionDialog