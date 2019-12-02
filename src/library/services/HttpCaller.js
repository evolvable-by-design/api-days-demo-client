import axios from 'axios'

import AuthService from './AuthenticationService'
import SemanticData from './SemanticData'
import { AuthenticationRequiredError } from '../../app/utils/Errors'

class HttpCaller {

  constructor(baseUrl, history, apiDocumentation) {
    this.baseUrl = baseUrl
    this.history = history
    this.apiDocumentation = apiDocumentation
  }

  async call(options) {
    if (options !== undefined && Object.keys(options).length !== 0) {
      try {
        const result = await this._callerInstance()(options)
        return result
      } catch (error) {
        if (error.response && error.response.status === 401) {
          AuthService.currentTokenWasRefusedByApi()
          if (this.history !== undefined) {
            this.history.push('/login')
            throw error
          } else {
            throw new AuthenticationRequiredError()
          }
        } else {
          throw error
        }
      }
    } else {
      return null;
    }
  }

  async semanticCall(options, operation, resultMapper) {
    const result = await this.call(options)

    return [200, 201].includes(result.status)
      ? this._getDataAndItsDescription(result, operation, resultMapper)
      : undefined
  }

  _getDataAndItsDescription(result, operation, resultMapper) {
    const responseSchema = operation ? operation.responses[result.status] : undefined
    const resourceSchema =
      result.data !== '' && result.headers['content-type'] && responseSchema
        ? responseSchema.content[result.headers['content-type'].split(';')[0]].schema
        : undefined
    const data = resultMapper ? resultMapper(result) : result.data
    return new SemanticData(data, resourceSchema, responseSchema, this.apiDocumentation)
  }

  _callerInstance() {
    return axios.create(this._defaultOptions())
  }

  _defaultOptions() {
    return {
      baseURL: this.baseUrl,
      headers: { 'Authorization':  AuthService.getToken() }
    }
  }

}

export default HttpCaller
