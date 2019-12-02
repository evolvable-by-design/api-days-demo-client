import React from 'react';

import { majorScale, Pane, Switch, Label, minorScale } from "evergreen-ui";

const SwitchInputField = ({label, onChange, checked}) => (
  <Pane display="flex" flexDirection="column" flexWrap="wrap" >
    <Label marginBottom={minorScale(1)}>{label}</Label>
    <Pane height={majorScale(4)} marginBottom={majorScale(3)} display="flex" alignItems="center">
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} height={majorScale(3)}/>
    </Pane>
  </Pane>)

export default SwitchInputField;