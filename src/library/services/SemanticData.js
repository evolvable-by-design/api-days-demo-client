/*
 * At the moment this class is only able to find elements in an object
 * with direct semantic match. It doesn't look at the OWL description
 * in order to leverage the "sameAs" property.
 * 
 * TODO: look deeper into the semantic 
 */
import ajv from './Ajv'
import DocumentationBrowser from './DocumentationBrowser';

class SemanticData {

  constructor(data, resourceSchema, responseSchema, apiDocumentation) {
    this.value = data;
    this.responseSchema = responseSchema
    this.apiDocumentation = apiDocumentation
    this.alreadyReadData = []
    this.alreadyReadRelations = []

    if (resourceSchema.oneOf) {
      const schema = resourceSchema.oneOf
        .sort((a, b) => (b.required ? b.required.length : 0) - (a.required ? a.required.length : 0))
        .find(schema => doesSchemaMatch(data, schema))
      this.type = schema ? schema['@id'] || schema.type || resourceSchema.type : undefined
      this.resourceSchema = schema
    } else {
      this.type = resourceSchema ? resourceSchema['@id'] || resourceSchema.type : undefined
      this.resourceSchema = resourceSchema
    }
  }

  isObject() { return this.resourceSchema.type === 'object'; }
  isArray() { return this.resourceSchema.type === 'array'; }
  isPrimitive() { return !this.isArray() && ! this.isObject(); }

  resetReadCounter() {  this.alreadyReadData = []; this.alreadyReadRelations = []; return this; }

  get(semanticKey) {
    if (this.value === undefined) return undefined;

    if (this.isObject()) {
      const result = Object.entries(this.resourceSchema.properties)
        .find(([key, value]) => value['@id'] !== undefined && value['@id'] === semanticKey);
      const [key, schema] = result || [undefined, undefined];
      if (key && schema) {
        if (!this.alreadyReadData.includes(key)) { this.alreadyReadData.push(key) }
        const value = this.value[key];
        if (schema.type === 'array') {
          const responseBodySchema = this.apiDocumentation?.responseBodySchema(schema.items['@id'])
          return value.map(v => new SemanticData(v, schema.items, responseBodySchema, this.apiDocumentation))
        } else {
          return new SemanticData(value, schema, this.apiDocumentation?.responseBodySchema(schema['@id']), this.apiDocumentation)
        }
      } else {
        return undefined;
      }
    } else if (this.isArray()) {
      // Not sure of this yet. This may be thought a bit more.
      return undefined;
    } else {
      return this.type === semanticKey ? this : undefined;
    }
  }

  getValue(semanticKey) {
    const semanticData = this.get(semanticKey);

    if (semanticData !== undefined && semanticData instanceof Array) {
      return semanticData.map(s => s.value);
    } else if (semanticData !== undefined) {
      return semanticData.value;
    } else {
      return undefined;
    }
  }

  getOtherData() {
    const toReturn = Object.assign({}, this.value)
    this.alreadyReadData.forEach(key => { delete toReturn[key] })
    delete toReturn['_links']
    return toReturn
  }

  isRelationAvailable(semanticRelation) {
    return this._findRelation(semanticRelation) !== [undefined, undefined];
  }

  getRelation(semanticRelation) {
    const hypermediaControl = this._findRelation(semanticRelation);
    const hypermediaControlKey = hypermediaControl[0];
    return this._getRelation(hypermediaControlKey, true)
  }

  _getRelation(hypermediaControlKey, addToReadList) {
    if (hypermediaControlKey !== undefined) {
      const linksSchema = this.responseSchema.links || {};
      const notResolvedOperation = linksSchema[hypermediaControlKey]

      const links = this.value._links || []
      const controlFromPayload = links[hypermediaControlKey]
        || links.find(control => control['relation'] === hypermediaControlKey)
      
      const operation = notResolvedOperation ? this.apiDocumentation.findOperationById(notResolvedOperation.operationId) : undefined

      if (operation === undefined) {
        console.warn(`Error found in the documentation: operation with id ${hypermediaControlKey} does not exist.`)
        return [undefined, undefined]
      }

      if (operation) {
        const requestBodySchema = DocumentationBrowser.requestBodySchema(operation)
        if (requestBodySchema && requestBodySchema.oneOf) {
          DocumentationBrowser.updateRequestBodySchema(
            operation,
            this._findClosestSchema(requestBodySchema.oneOf, controlFromPayload)
          )
        }
      }

      const operationWithDefaultValues = this._addDefaultValuesToOperationSchema(controlFromPayload, operation)

      if (addToReadList && !this.alreadyReadRelations.includes(hypermediaControlKey)) {
        this.alreadyReadRelations.push(hypermediaControlKey)
      }

      return [hypermediaControlKey, operationWithDefaultValues];
    } else {
      return [undefined, undefined];
    }
  }

  getOtherRelations() {
    const others = this.value._links.map(l => l instanceof Object ? l.relation : l)
      .filter(key => !this.alreadyReadRelations.includes(key))
    
    return others.map(key => this._getRelation(key, false)).filter(val => val[0] && val[1])
  }

  _findRelation(semanticRelation) {
    const schemaLinks = this.responseSchema.links || {};
    const hypermediaControl = Object.entries(schemaLinks)
      .find(([key, value]) => value['@relation'] === semanticRelation)

    if (hypermediaControl === undefined)
      return undefined;

    const hypermediaControlKey = hypermediaControl[0];

    const links = this.value._links || [];
    const isInPayload = links.includes(hypermediaControlKey)
      || links.find(control => control['relation'] === hypermediaControlKey)


    if (hypermediaControlKey !== undefined && isInPayload) {
      return hypermediaControl;
    } else {
      return [undefined, undefined];
    }
  }

  _addDefaultValuesToOperationSchema(hypermediaControl, operation) {
    if (hypermediaControl === undefined || hypermediaControl.parameters === undefined) return operation

    const op = Object.assign({}, operation)
    
    if (op.parameters) op.parameters.forEach(param => {
      if (hypermediaControl.parameters[param.name] !== undefined) {
        param.schema.default = hypermediaControl.parameters[param.name]
      }
    })
    const requestBodySchema = DocumentationBrowser.requestBodySchema(op)
    
    if (requestBodySchema && requestBodySchema.properties) {
      Object.entries(requestBodySchema.properties).forEach(([name, prop]) => {
        prop.default = hypermediaControl.parameters[name]
      })
    } 
    
    return op
  }

  _findClosestSchema(schemas, control) {
    // TODO look deeper into the schemas, don't limit to first level
    const controlProperties = Object.keys(control.parameters || {})
    const match = schemas
      .map(schema => {
        const matchingPropertiesCount = Object.keys(schema.properties || {})
          .filter(p => controlProperties.includes(p))
          .length
        return [schema, matchingPropertiesCount]
      })
      .sort((a, b) => b[1] - a[1])
      .map(([schema, matchingPropertiesCount]) => schema)

    if (match !== undefined && match.length > 0) return match[0]

    return schemas[0]
  }

}

// utility, file private functions
function doesSchemaMatch (value, schema) {
  const validate = ajv.compile(schema)
  return validate(value)
}

export default SemanticData;