import React, { useMemo, useState } from 'react'
import { Alert, Button, Card, Icon, Pane, Heading, TextInputField, Spinner, Paragraph, majorScale } from 'evergreen-ui'
import axios from 'axios'

function TalkCreator () {
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState()
  const [ name, setName ] = useState()
  const isNameValid = useMemo(() => validateName(name), [name])
  const [ speaker, setSpeaker ] = useState()
  const isSpeakerValid = useMemo(() => validateSpeaker(speaker), [speaker])
  const [ startTime, setStartTime ] = useState(new Date(Date.now()))
  const [ createdTalk, setCreatedTalk ] = useState()

  return <Pane width='80%'>
    <Heading size={700}>Create a talk</Heading>
    <Pane id="createTalkForm" marginBottom="40px">
      <TextInputField
        required label="Name" value={name || ''}
        onChange={e => setName(e.target.value)}
        validationMessage={ isNameValid ? undefined : "Must be 10 to 80 characters long" }
      />
      <TextInputField
        isInvalid={!isSpeakerValid} required label="Speaker" value={speaker || ''}
        onChange={e => setSpeaker(e.target.value)}
      />
      <TextInputField type="datetime-local"
        required label="Start time" value={startTime || ''}
        onChange={e => setStartTime(e.target.value)}
      />

      <Button appearance="primary"
        disabled={!isNameValid || !isSpeakerValid}
        onClick={() => { setIsLoading(true);  setError(); invokeCreateCallApi(name, speaker, startTime)
          .then(result => setCreatedTalk(result.data))
          .catch(setError)
          .finally(() => setIsLoading(false))
        }}
      >
        Create talk
      </Button>
    </Pane>
    <Pane id="resultingTalk" marginBottom="40px">
      {
        isLoading ? <Pane width="100%" marginY="30px"><Spinner/></Pane>
        : error ? <Alert intent="danger" title={error.message}/>
        : createdTalk ? <Talk name={createdTalk.name} speaker={createdTalk.speaker} startTime={createdTalk.startTime} deleteOperation={createdTalk?._links?.find(l => l.relation === 'delete')} onDelete={() => setCreatedTalk()}/>
        : null
      }
    </Pane>
  </Pane>
}

function Talk({name, speaker, startTime, deleteOperation, onDelete}) {
  const [ error, setError ] = useState()
  return <div>
    <Heading size={700} marginBottom="16px">
      Created talk <Icon icon="tick-circle" color="success"/>
    </Heading>
    <Card display="flex" flexDirection="column" elevation={2} width={majorScale(60)} padding={majorScale(2)} minHeight="100px" >
      <Heading size={700}>{name}</Heading>
      <Heading size={400} marginBottom="8px">by {speaker}</Heading>
      <Paragraph marginBottom="8px" size={400}><Icon icon="time" /> {new Date(startTime).toGMTString()}</Paragraph>
      <Pane marginBottom="8px">
        { deleteOperation && <Button appearance="primary" intent="danger" onClick={() => deleteTalk(name).then(onDelete).catch(setError)}  marginRight="16px">Delete</Button>}
      </Pane>
      { error && <Alert intent="danger" title={error.message}/> }
    </Card>
  </div>
}

const validateName = (value) => typeof value === 'string'
  && value.length >= 10 && value.length <= 80

const validateSpeaker = (value) =>
  typeof value === 'string' && value.length > 0

function invokeCreateCallApi(name, speaker, startTime) {
  return axios.post('http://localhost:8080/talk', {name, speaker, startTime})
}

function deleteTalk(name) {
  return axios.delete(`http://localhost:8080/talk/${name}`)
}

export default TalkCreator