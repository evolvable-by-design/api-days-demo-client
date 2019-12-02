import React, { useState } from 'react'
import { Heading, Pane, Select, Switch, TextInput, majorScale } from 'evergreen-ui';

import ajv from '../../library/services/Ajv';

import { capitalize, spaceCamelCaseWord, stateSetter } from '../utils/javascriptUtils';

// TODO: display an error message when required as TextInputField does
// TODO: show required fields close to the label

const GenericForm = ({values, setter, documentation}) => {
  const [ errors, setErrors ] = useState({}) 
  
  if (documentation === undefined || documentation === [])
    return null

  return <Pane width="100%">
    { documentation.map(parameter =>
      <WithLabel label={parameter.name} key={parameter.name} required={parameter.required}>
        <SelectInput 
          schema={parameter.schema}
          value={values[parameter.name]}
          error={errors[parameter.name]}
          setValue={stateSetter(setter, parameter.name)}
          setError={stateSetter(setErrors, parameter.name)}
        />
      </WithLabel>
    ) }
  </Pane>
}

const FormLabel = ({label, required}) => 
  <Pane width={majorScale(15)} marginRight={majorScale(3)}>
    <Heading size={400}>{spaceCamelCaseWord(capitalize(label))}{required ? '*' : ''}</Heading>
  </Pane>

const WithLabel = ({label, required, children}) => 
  <Pane width="100%" display="flex" flexDirection="row" marginBottom={majorScale(3)} alignItems="baseline">
    <FormLabel label={label} required={required} />
    <Pane width="100%" >
      {children}
    </Pane>
  </Pane>

function SelectInput({schema, value, setValue, error, setError}) {
  // TODO: resolve and use type from the semantic description

  const onChange = (val) => {
    const [value, error] = _validateValue(val, schema);
    setError(error);
    setValue(value);
  };

  if (schema.type === 'boolean') {
    return <Switch checked={value} onChange={(e) => onChange(e.target.checked)} height={majorScale(3)}/>
  } else if (schema.type === 'string' && schema.enum !== undefined) {
    let options = new Set(schema.enum)
    if (schema.default !== undefined && schema.default !== '')
      options.add(schema.default)
    options = Array.from(options)

    return <Select
        isInvalid={error !== undefined}
        value={value || schema.default}
        placeholder={'Please select an option...'}
        width="100%"
        onChange={(e) => onChange(e.target.value)}
      >
        { options.map(option => <option key={option} value={option}>{option}</option>) }
      </Select>
  } else {
    return <TextInput
        isInvalid={error !== undefined}
        value={value || ''}
        type={schema.format}
        width="100%"
        onChange={(e) => onChange(e.target.value)}
      />
  }
}

function _validateValue(value, schema) {
  const val = schema.type === 'number' ? parseFloat(value, 10)
    : schema.type === 'integer' ? parseInt(value, 10)
    : schema.type === 'boolean' ? value === true
    : value;
  const validate = ajv.compile(schema);
  const valid = validate(val);
  
  return [val, valid ? undefined : ajv.errorsText(validate.errors)];
}

export default GenericForm
