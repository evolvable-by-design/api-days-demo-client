import React, { useState } from 'react';
import { Icon, Pane, Paragraph, SelectField, Text, TextInputField, Tooltip, majorScale } from 'evergreen-ui';

import ajv from '../../library/services/Ajv';
import SwitchInputField from './SwitchInputField';
import { stateSetter } from '../utils/javascriptUtils';

export function GenericFilters({values, setter, documentation}) {
  const [errors, setErrors] = useState({})
  return documentation.length === 0
    ? <></>
    : <Pane width="100%" display="flex" flexDirection="row" flexWrap="wrap" alignItems="flex-start" justifyContent="flex-start">
        {
          documentation.map(param =>
            <Pane display="flex" height="100%" key={param.name} marginRight={majorScale(3)} >
              <SelectInput
                parameter={param}
                value={values[param.name]}
                setValue={stateSetter(setter, param.name)}
                error={errors[param.name]}
                setError={stateSetter(setErrors, param.name)}
              />
            </Pane>)
        }
      </Pane>
};

function SelectInput({parameter, value, setValue, error, setError}) {
  // TODO: resolve and use type from the semantic description
  const labelText = parameter.name.charAt(0).toUpperCase() + parameter.name.slice(1);
  const labelContent = <Paragraph width="100%"><Icon size={11} icon="info-sign" /> {labelText} <Text color="red">{parameter.required ? '*' : ''}</Text></Paragraph>
  const label = parameter.description
    ? <Tooltip content={parameter.description}>{labelContent}</Tooltip>
    : labelContent
    
  const onChange = (val) => {
    const [value, error] = _validateValue(val, parameter.schema);
    setError(error);
    setValue(value);
  }

  if (parameter.schema.type === 'boolean') {
    return <SwitchInputField label={label} checked={value} onChange={onChange}/>
  } else if (parameter.schema.type === 'string' && parameter.schema.enum !== undefined) {
    return <Pane width={majorScale(24)}>
      <SelectField 
        label={label}
        isInvalid={error !== undefined}
        value={value}
        placeholder={'Please select an option...'}
        validationMessage={error}
        width="100%"
        onChange={e => onChange(e.target.value)}
      >
        { parameter.schema.enum.map(option => <option value="option" selected={parameter.schema.default === option} >{option}</option>) }
      </SelectField>
    </Pane>
  } else {
    return <Pane width={majorScale(24)}>
      <TextInputField 
        label={label}
        isInvalid={error !== undefined}
        value={value}
        placeholder={parameter.schema.format}
        validationMessage={error}
        width="100%"
        onChange={e => onChange(e.target.value)}
      />
    </Pane>
  }
}

function _validateValue(value, schema) {
  const val = schema.type === 'number' ? parseFloat(value, 10) || ''
    : schema.type === 'integer' ? parseInt(value, 10) || ''
    : value;
  const validate = ajv.compile(schema);
  const valid = validate(val);
  
  return [val, valid ? undefined : ajv.errorsText(validate.errors)];
}

export default GenericFilters