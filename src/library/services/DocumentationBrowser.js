import * as JsonLDParser from './JsonLdParser';
import AuthService from './AuthenticationService';
import { mapObject } from '../../app/utils/javascriptUtils';

class DocumentationBrowser {

  constructor(documentation) {
    // TODO: remove refinedDoc, already done in ApiDocumentationFetch
    const refinedDoc = JSON.parse(
      JSON.stringify(documentation)
        .replace(new RegExp('x-@id', 'g'), '@id')
        .replace(new RegExp('x-@type', 'g'), '@type')
        .replace(new RegExp('x-@context', 'g'), '@context')
        .replace(new RegExp('x-@relation', 'g'), '@relation')
    )
    this.documentation = JsonLDParser.replaceAllId(refinedDoc)
    this.semanticKeyMapping = JsonLDParser.findSemanticWithKeyMappings(refinedDoc)
  }

  getServerUrl() {
    return this.documentation.servers[0].url
  }

  hasOperation = (target) => this.findOperation(target) !== undefined

  findOperation(target) {
    if (target === undefined)
      return undefined

    const operationFromId = this._findOperationWithId(target);
    if (operationFromId) {
      return operationFromId;
    }

    const operationReturningTarget = this._findOperationThatReturns(target);
    return operationReturningTarget;
  }

  findOperationById(openApiId) {
    return this._findOperation(operation => operation.operationId === openApiId);
  }

  findTypeInOperationResponse(semanticKey, operation) {
    if (operation.responses['200']
      && operation.responses['200'].content['application/json']
      && operation.responses['200'].content['application/json'].schema
    ) {
      const rbs = operation.responses['200'].content['application/json'].schema
      const responseBodySchema = this._refine(rbs)
      return this._findTypeInSchema(semanticKey, responseBodySchema)
    }

    return undefined
  }

  _findTypeInSchema(semanticKey, schema) {
    if (schema === undefined) {
      return undefined
    } else if (schema['@id'] !== undefined && schema['@id'] === semanticKey) {
      return schema
    } else if (schema.oneOf) {
      return schema.oneOf
          .map(prop => this._findTypeInSchema(semanticKey, prop))
          .reduce((acc, b) => acc || b)
    } else if (schema.type === 'object') {
      if (!schema.properties) { return undefined }

      return Object.values(schema['properties'])
        .map(prop => this._findTypeInSchema(semanticKey, prop))
        .reduce((acc, b) => acc || b)
    } else if (schema.type === 'array') {
      if (!schema.items) { return undefined }
      
      return this._findTypeInSchema(semanticKey, schema.items)
    } else {
      return undefined
    }
  }

  static requestBodySchema(operation) {
    if (operation && operation.requestBody) {
      const contents = operation.requestBody.content;
      const content = contents['application/json'] || contents[Object.keys(contents)[0]]
      return content.schema;
    }

    return undefined;
  }

  static updateRequestBodySchema(operation, schema) {
    if (operation && operation.requestBody) {
      const contents = operation.requestBody.content;
      const content = contents['application/json'] || contents[Object.keys(contents)[0]]
      content.schema = schema
    }
  }

  responseBodySchema(operation) {
    const actualOperation = typeof operation === 'string'
      ? this.findOperation(operation)
      : operation
    
    const responses = actualOperation?.responses
    return responses?.['200'] || responses?.['201']
  }

  notContainsRequiredParametersWithoutDefaultValue(operation) {
    const foundRequiredParamWithoutDefaultValue = operation.parameters && operation.parameters
      .find(parameter => parameter.required && parameter.schema.default === undefined);

    const bodySchema = DocumentationBrowser.requestBodySchema(operation);
    const requiredArgs = bodySchema && bodySchema.required ? bodySchema.required : [];

    if (bodySchema === undefined || requiredArgs.length === 0) {
      return foundRequiredParamWithoutDefaultValue === undefined;
    }

    const foundRequiredBodyParamsWithoutDefaultValue =
      Object.entries(bodySchema.properties)
        .filter(([key, value]) => requiredArgs.includes(key))
        .find(([key, value]) => value.default === undefined);

    return foundRequiredParamWithoutDefaultValue === undefined
      && foundRequiredBodyParamsWithoutDefaultValue === undefined;
  }

  noRequiredParametersWithoutValue(operation, parameters, body) {
    // Check path, query and header params
    const requiredParams = operation.parameters ? operation.parameters
      .filter(parameter => parameter.required).map(param => param.name) : [];

    const parametersKey = Object.keys(parameters);
    const foundMissingParams = requiredParams
      .find(param => !parametersKey.includes(param)) !== undefined;

    if (foundMissingParams) return false;

    // Check body params
    const bodySchema = DocumentationBrowser.requestBodySchema(operation);
    const requiredArgs = bodySchema && bodySchema.required ? bodySchema.required : [];

    if (bodySchema === undefined || requiredArgs.length === 0) return true;

    const bodyKeys = Object.keys(body);
    const foundMissingBodyParams = requiredArgs.find(param => !bodyKeys.includes(param)) !== undefined;

    return !foundMissingBodyParams;
  }

  /**
   * Refine a given element of the documentation by resolving 
   * all references and semantics of the element and its children
   * 
   * @param {*} value an element of the documentation
   */
  _refine(value) {
    if (value instanceof Array) {
      return value.map(this._refine.bind(this))
    } else if (value instanceof Object) {
      if (value['$ref']) {
        return this._refine(this._resolveReference(value['$ref']))
      } else {
        return mapObject(value, (key, v) => {
          const refinedEl = this._refine(v);
          if ((key === 'parameters' || key === 'properties') && v instanceof Object && !(v instanceof Array)) {
            return [key, this._withSemanticsToProperties(refinedEl)];
          } else {
            return [key, refinedEl];
          }
        });
      }
    } else {
      return value;
    }
  }

  _findPath(operationId) {
    return Object.entries(this.documentation.paths)
      .find(([route, pathObject]) => Object.values(pathObject).find(operation => operation.id === operationId) !== undefined)
      .map(([route, pathObject]) => [ route, this._refine(pathObject) ]);
  }

  _withSemanticsToProperties(properties) {
    return mapObject(properties, (key, value) => {
      if (value instanceof Object && value['@id'] === undefined) {
        const semantic = this._findSemanticOfKeyword(key);
        if (semantic) { value['@id'] = semantic; } 
      }
      return [key, value]
    });
  }

  _findSemanticOfKeyword(keyword) {
    return Object.keys(this.semanticKeyMapping).find(key => {
      const keywordInMapping = this.semanticKeyMapping[key]
      return keywordInMapping instanceof Array
        ? keywordInMapping.includes(keyword)
        : keywordInMapping === keyword
    });
  }

  _findOperationWithId(target) {
    return this._findOperation(operation => operation['@id'] === target);   
  }

  _findOperation(predicate) {
    // should be optimized
    const pathFound = Object.entries(this.documentation.paths)
      .find(([path, operations]) => Object.values(operations)
        .find(predicate)
      );

    if (pathFound) {
      const [path, operations] = pathFound;
      const parametersOfPath = this._refine(operations['parameters']);
      const [verb, operation] = Object.entries(operations).find(([v, op]) => predicate(op))
      let parameters = this._mergeOptionalArrays(parametersOfPath, operation.parameters);
      const userShouldAuthenticate = operation.security !== undefined && !AuthService.isAuthenticated()

      return {
        ...this._refine(operation),
        verb,
        url: path,
        parameters: this._refine(parameters),
        userShouldAuthenticate
      }
    } else {
      return undefined;
    }
  }

  _findOperationThatReturns(target) {
    return this._findOperation(operation => {
      
      if (operation.responses) {
        const maybeKey = Object.keys(operation.responses).find(key => key === '200' || key === '201');
        if (maybeKey) {
          const refinedOperation = this._refine(operation);
          const schema = this._selectContent(refinedOperation.responses[maybeKey].content).schema;
          return schema['@id'] === target || (schema.oneOf && schema.oneOf.find(s => s['@id'] === target) !== undefined)
        }
        return false;
      }
      return false;
    });
  }

  _resolveComponent(component) {
    if (component instanceof Object && !(component instanceof Array)) {
      return component['$ref'] ? this._resolveReference(component['$ref']) : component;
    }

    return component;
  }

  _resolveReference(ref) {
    if (!ref.startsWith('#')) {
      throw new Error('Unhandled kind of reference:' + ref);
    }

    const fragments = ref.substring(2).split('/');
    const object = fragments.reduce((res, fragment) => res[fragment], this.documentation);
    if (!object['@id']) {
      object['@id'] = this._findSemanticOfKeyword(fragments[fragments.length - 1])
    }
    return object;
  }

  _resolveReferenceName(ref) {
    if (!ref.startsWith('#')) {
      throw new Error('Unhandled kind of reference:' + ref);
    }

    const fragments = ref.substring(1).split('/');
    return fragments[fragments.length-2];
  }

  _selectContent(contents) {
    return contents['application/json'] || contents[Object.keys(contents)[0]];
  }

  _mergeOptionalArrays(arr1, arr2) {
    return !arr1 && !arr2 ? arr1 : (arr1 || []).concat(arr2 || [])
  }

}

export default DocumentationBrowser;