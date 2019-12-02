export const buildRequest = (apiDocumentation, operation, parameters, form) => {
  if (operation === undefined) {
    return undefined
  } else if (!apiDocumentation.noRequiredParametersWithoutValue(operation, parameters, form)) {
    throw new Error('Required parameters are missing')
  } else {
    return _buildRequest(operation, parameters, form)
  }
}

export function inputParamValueOrDefault(operation, inputValues) {
  const defaultValues = (operation.parameters || [])
    .filter(param => param.schema.default !== undefined)
    .reduce((acc, param) => { acc[param.name] = param.schema.default; return acc; }, {});
  return { ...defaultValues, ...inputValues};
}

export function inputBodyValueOrDefault(requestBodySchema, form) {
  if (requestBodySchema === undefined) return form || {}

  const defaultValues = Object.entries(requestBodySchema.properties)
    .filter(([name, value]) => value.default !== undefined)
    .reduce((acc, [name, value]) => {
      acc[name] = value.default;
      return acc;
    }, {});
  return { ...defaultValues, ...form };
}


function _buildRequest(operation, parameters, form) {
  if (operation.requestBody && !operation.requestBody.content['application/json']) {
    return {};
  }

  const requestBodySchema = operation.requestBody
    ? operation.requestBody.content['application/json'].schema
    : undefined;

  return {
    method: operation.verb,
    url: buildUrl(operation, parameters),
    data: buildBody(operation.operationId, requestBodySchema, form),
    headers: buildHeaders(operation, parameters)
  };
}

function buildUrl(operation, parameters) {
  let url = operation.url;

  if (operation.parameters) {
    operation.parameters
      .filter(param =>
        param.in === 'path'
        && (param.schema.default !== undefined || parameters[param.name] !== undefined)
      )
      .forEach(param => { url = url.replace(`{${param.name}}`, parameters[param.name] || param.schema.default)});

      operation.parameters
      .filter(param =>
        param.in === 'query'
        && (param.schema.default !== undefined || parameters[param.name] !== undefined)
      )
      .forEach((param, i) => {
        url += (i === 0 ? '?' : '&') + `${param.name}=${parameters[param.name] || param.schema.default}`;
      });
  }

  return url;
}

function buildBody(operationId, requestBodySchema, values) {
  if (!requestBodySchema) {
    return undefined;
  } else if (!['object', 'array'].includes(requestBodySchema.type)) {
    console.error('Impossible de build a valid json document for operation with id: ' + operationId);
    return undefined;
  }

  if (requestBodySchema.type === 'array') {
    return requestBodySchema.default;
  } else {
    const body = {};
    Object.keys(requestBodySchema.properties)
      .filter(key => values[key] !== undefined || requestBodySchema.properties[key].default !== undefined)
      .forEach(key => body[key] = values[key] || requestBodySchema.properties[key].default)

    return body;
  }
}

function buildHeaders(operation, values) {
  if (operation.parameters) {
    const headers = {};
    operation.parameters
      .filter(param => param.in === 'header' && (values[param.name] !== undefined || param.schema.default !== undefined))
      .forEach(param => headers[param.name] = values[param.name] || param.schema.default);
    return headers;
  } else {
    return undefined;
  }
}