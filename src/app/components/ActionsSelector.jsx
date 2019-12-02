import React from 'react'
import { Button, Menu, Popover, Position, majorScale } from 'evergreen-ui'

import { firstLetterUppercase, spaceCamelCaseWord } from '../utils/javascriptUtils'

const ActionsSelector = ({ actions, onSelect }) =>
  <Popover
    position={Position.BOTTOM_LEFT}
    content={
      <Menu>
        <Menu.Group>
          { actions.map(([key, schema]) => 
            <Menu.Item key={key} onSelect={() => onSelect(key)}>
              {firstLetterUppercase(spaceCamelCaseWord(key))}
            </Menu.Item>)
          }
        </Menu.Group>
      </Menu>
  }>
    <Button marginRight={majorScale(2)} marginBottom={majorScale(1)} iconAfter="caret-down">Actions</Button>
  </Popover>

export default ActionsSelector