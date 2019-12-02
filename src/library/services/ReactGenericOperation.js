import { useCallback, useMemo, useState } from 'react'

export function useOperation(genericOperation, providedValues) {
  const parameters = genericOperation.getParameters()
  const parametersName = parameters.map(p => [p.name, p['@id'] || p.schema['@id']])
  const defaultParametersValues = {
    ...genericOperation.getDefaultParametersValue(),
    ...mapProvidedValueToOperationParameter(providedValues, parametersName)
  }
  const [parametersValue, setParametersValue] = useState(defaultParametersValues)
  const parametersDetail = {
    values: parametersValue,
    setter: setParametersValue,
    documentation: parameters
  }

  const { makeCall, isLoading, success, data, error } = useCaller(parametersValue, genericOperation.call.bind(genericOperation))

  const userShouldAuthenticate = genericOperation.userShouldAuthenticate
  return { parametersDetail, makeCall, isLoading, success, data, error, userShouldAuthenticate }
}

export function useCaller(parameters, callFct) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()
  const [data, setData] = useState()
  const [callAlreadyTriggered, setCallAlreadyTriggered] = useState(false)
  const success = useMemo(() => data !== undefined || (callAlreadyTriggered && !isLoading && error === undefined), [callAlreadyTriggered, isLoading, error, data])

  const makeCall = useCallback(() => {
    const call = async () => {
      setIsLoading(true)
      setCallAlreadyTriggered(true)
      setError()
      try {
        const data = await callFct(parameters)
        setData(data)
      } catch (error) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    call()
  }, [callFct, parameters])

  return { makeCall, isLoading, success, data, error }
}

function mapProvidedValueToOperationParameter(values, keys) {
  const valuesK = Object.keys(values || {})
  const res = {}
  keys.forEach(([key, semanticKey]) => {
    if (valuesK.includes(key)) {
      res[key] = values[key]
    } else if (valuesK.includes(semanticKey)) {
      res[key] = values[semanticKey]
    }
  })
  return res
}
