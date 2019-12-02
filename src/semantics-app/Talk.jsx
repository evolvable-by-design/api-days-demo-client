import React, { useState, useEffect } from 'react'
import { Alert, Button, Card, Icon, Pane, Heading, Spinner, Paragraph, majorScale } from 'evergreen-ui'

import { useOperation } from '../library/services/ReactGenericOperation'

import { useAppContextState } from '../app/context/AppContext';
import ActionDialog from '../app/components/ActionDialog';
import GenericForm from '../app/components/GenericForm';

function TalkCreator() {
  const { genericOperationBuilder } = useAppContextState()
  const createTalkOperation = genericOperationBuilder.fromKey('https://example.com/api_days_vocab#createTalk')
  
  return !createTalkOperation
    ? <Alert intent="danger" title="The API does not enable to create talks anymore"/>
    : <_TalkCreator createTalkOperation={createTalkOperation} />
}

function _TalkCreator({createTalkOperation}) {
  const { parametersDetail, makeCall, isLoading, data, success, error } = useOperation(createTalkOperation)
  const [ hasFormErrors, setHasFormErrors ] = useState(false)
  const deleteOperation = data?.getRelation('https://example.com/api_days_vocab#DeleteAction')
  const [ talk, setTalk ] = useState()

  useEffect(() => {
    if (success) { setTalk(data) }
    else { setTalk() }
  }, [ success, data ])

  return !createTalkOperation
    ? <Alert intent="danger" title="The API does not enable to create talks anymore"/>
    : <Pane width='80%'>
        <Pane marginBottom="40px">
          <Heading size={700} marginBottom="24px">Create a talk</Heading>
          <GenericForm setHasError={setHasFormErrors}  {...parametersDetail}/>
          <Button appearance="primary" onClick={makeCall} disabled={hasFormErrors}>
            {createTalkOperation.operation.summary}
          </Button>
        </Pane>
        <Pane id="resultingTalk" marginBottom="40px">
          {
            isLoading ? <Pane width="100%" marginY="30px"><Spinner/></Pane>
            : error ? <Alert intent="danger" title={error.message}/>
            : talk ? <Talk data={talk} name={talk.getValue('https://example.com/api_days_vocab#projectName')} speaker={talk.getValue('https://example.com/api_days_vocab#speaker')} startTime={talk.getValue('https://schema.org/startTime')} deleteOperation={deleteOperation} onDelete={() => setTalk()} />
            : null
          }
        </Pane>
      </Pane>
}

function Talk({name, speaker, startTime, deleteOperation, onDelete, data}) {
  const otherData = data.getOtherData()
  const otherOperations = data.getOtherRelations()
  const [ operationToShow, setOperationToShow ] = useState()

  return <div>
    <Heading size={700} marginBottom="16px">
      Created talk <Icon icon="tick-circle" color="success"/>
    </Heading>
    <Card display="flex" flexDirection="column" elevation={2} width={majorScale(60)} padding={majorScale(2)} minHeight="100px" >
      <Heading size={700}>{name}</Heading>
      <Heading size={400} marginBottom="8px">by {speaker}</Heading>
      <Paragraph marginBottom="8px" size={400}><Icon icon="time" /> {new Date(startTime).toGMTString()}</Paragraph>
      { Object.entries(otherData).map(([key, value]) => <Paragraph key={key} marginBottom="8px" size={400}>{key}: {value}</Paragraph>) }
      <Pane marginBottom="8px">
        { deleteOperation && deleteOperation[0] !== undefined && <Button appearance="primary" intent="danger" onClick={() => setOperationToShow(deleteOperation)}  marginRight="16px">Delete</Button>}
        { otherOperations.map(([key, schema]) => <Button key={key} onClick={() => setOperationToShow([key, schema])}>{key}</Button>)}
        { operationToShow && <ActionDialog title={operationToShow[1].summary} operationSchema={operationToShow[1]} onSuccessCallback={() => { if (operationToShow === deleteOperation) onDelete() }} onCloseComplete={() => setOperationToShow()} /> }
      </Pane>
    </Card>
  </div>
}

export default TalkCreator
