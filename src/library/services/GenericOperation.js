import { NotFoundOperation, AuthenticationRequiredError } from '../../app/utils/Errors'
import { buildRequest} from '../utils/requestBuilder'
import DocumentationBrowser from './DocumentationBrowser'

export class GenericOperation {

  constructor(operation, apiDocumentation, httpCaller) {
    if (operation === undefined || apiDocumentation === undefined) {
      throw new Error('GenericOperationResolver requires both operation and apiDocumentation')
    }

    this.operation = operation
    this.userShouldAuthenticate = operation.userShouldAuthenticate
    this.apiDocumentation = apiDocumentation
    this.httpCaller = httpCaller
  }

  async call(values, parameters) {
    if (this.userShouldAuthenticate) {
      throw new AuthenticationRequiredError()
    }

    return this.httpCaller.semanticCall(
      this.buildRequest(values, parameters),
      this.operation
    )
  }

  buildRequest(parameters) {
    // TODO: return details about missing params
    const [params, body] = this.computeParamsAndBody(parameters)
    return buildRequest(
      this.apiDocumentation,
      this.operation,
      params,
      body
    )
  }

  computeParamsAndBody(parameters) {
    const parametersWithDefault =
      { ...this.getDefaultParametersValue(), ...parameters }

    const params = (this.getParametersSchema() || [])
      .map(s => s.name)
      .map(name => [name, parametersWithDefault[name]])
      .reduce((acc, [name, value]) => { acc[name] = value; return acc; }, {})

    const body = Object.keys(this.getRequestBodySchema()?.properties || {})
      .map(key => [key, parametersWithDefault[key]])
      .reduce((acc, [name, value]) => { acc[name] = value; return acc; }, {})
    
    return [params, body]
  }

  buildDefaultRequest() {
    return this.operation.verb === 'get' ? this.buildRequest({}, {}) : undefined
  }

  getParameters() {
    return [ ...this.getParametersSchema(), ...schemaToParameters(this.getRequestBodySchema()) ]
  }

  getDefaultParametersValue() {
    return { ...this.getDefaultBodyValue(), ...this.getDefaultParameters() }
  }

  getRequestBodySchema() {
    if (this.requestBodySchema === undefined && this.operation.requestBody) {
      this.requestBodySchema = DocumentationBrowser.requestBodySchema(this.operation)
    }
    return this.requestBodySchema
  }

  getDefaultBodyValue() {
    if (!this.operation.requestBody) return {}

    return Object.entries(this.getRequestBodySchema().properties)
      .filter(([name, value]) => value.default !== undefined)
      .reduce((acc, [name, value]) => {
        acc[name] = value.default
        return acc
      }, {})
  }

  getParametersSchema() {
    return this.operation.parameters || []
  }

  getDefaultParameters() {
    const defaultParameters = (this.getParametersSchema() || [])
      .filter(param => param.schema.default !== undefined)
      .reduce((acc, param) => { acc[param.name] = param.schema.default; return acc; }, {})

    return defaultParameters || {}
  }

}

function schemaToParameters(schema) {
  const properties = schema ? schema.properties : {}
  return Object.entries(properties).map(([key, s]) => {
    return {
      name: key,
      description: s.description,
      required: schema.required?.includes(key),
      schema: s
    }
  })
}

export class GenericOperationBuilder {

  constructor(apiDocumentation, httpCaller) {
    this.apiDocumentation = apiDocumentation
    this.httpCaller = httpCaller
  }

  fromKey(actionKey) {
    const maybeOperation = this.apiDocumentation.findOperation(actionKey)

    if (maybeOperation === undefined) 
      return undefined
      // throw new NotFoundOperation()
    
    return this.fromOperation(maybeOperation)
  }

  fromOperation(operation) {
    return new GenericOperation(operation, this.apiDocumentation, this.httpCaller)
  }

}

export default GenericOperation
