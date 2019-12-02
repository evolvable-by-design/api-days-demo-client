import React, { useMemo, useState } from 'react'
import { Alert, Button, Card, Icon, Pane, Heading, Select, FormField, TextInputField, Text, Spinner, Paragraph, majorScale, SelectMenu } from 'evergreen-ui'
import axios from 'axios'

function TalkCreator () {
  const [ role, setRole ] = useState('admin')
  const [ isLoading, setIsLoading ] = useState(false)
  const [ error, setError ] = useState()
  const [ title, setTitle ] = useState()
  const isTitleValid = useMemo(() => validateTitle(title), [title])
  const [ speaker, setSpeaker ] = useState()
  const isSpeakerValid = useMemo(() => nonEmptyString(speaker), [speaker])
  const [ startTime, setStartTime ] = useState(new Date(Date.now()))
  const [ category, setCategory ] = useState('')
  const isCategoryValid = useMemo(() => nonEmptyString(category), [category])
  const [ createdTalk, setCreatedTalk ] = useState()

  return <Pane width='80%'>
    <Heading size={700} marginBottom="16px">Create a talk</Heading>
    <RoleSelector role={role} setRole={setRole} />
    <Pane id="createTalkForm" marginBottom="40px">
      <TextInputField
        required label="Title" value={title || ''}
        onChange={e => setTitle(e.target.value)}
        validationMessage={ isTitleValid ? undefined : "Must be 10 to 40 characters long" }
      />
      <TextInputField
        isInvalid={!isSpeakerValid} required label="Speaker" value={speaker || ''}
        onChange={e => setSpeaker(e.target.value)}
      />
      <TextInputField type="datetime-local"
        required label="Start time" value={startTime || ''}
        onChange={e => setStartTime(e.target.value)}
      />

      <Pane marginBottom="32px">
        <FormField label="Category" />
        <Select value={category} onChange={event => setCategory(event.target.value)}>
          <option value="" disabled>Please select an option</option>
          <option value="API Design">API Design</option>
          <option value="API Maintenance">API Maintenance</option>
          <option value="API Management">API Management</option>
        </Select>
      </Pane>

      <Button appearance="primary"
        disabled={!isTitleValid || !isSpeakerValid || !isCategoryValid}
        onClick={() => { setIsLoading(true); setError(); invokeCreateCallApi(title, speaker, startTime, category, role)
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
        : createdTalk ? <Talk name={createdTalk.title} speaker={createdTalk.speaker} startTime={createdTalk.startTime} deleteOperation={createdTalk?._links?.find(l => l.relation === 'delete')} onDelete={() => setCreatedTalk()} attendOperation={createdTalk?._links?.find(l => l.relation === 'attend')} role={role}/>
        : null
      }
    </Pane>
  </Pane>
}

function Talk({role, name, speaker, startTime, category, deleteOperation, onDelete, attendOperation}) {
  const [ error, setError ] = useState()
  return <div>
    <Heading size={700} marginBottom="16px">
      Created talk <Icon icon="tick-circle" color="success"/>
    </Heading>
    <Card display="flex" flexDirection="column" elevation={2} width={majorScale(60)} padding={majorScale(2)} minHeight="100px" >
      <Heading size={700}>{name}</Heading>
      <Heading size={400} marginBottom="8px">by {speaker}</Heading>
      <Paragraph marginBottom="8px" size={400}><Icon icon="time" /> {new Date(startTime).toGMTString()}</Paragraph>
      <Paragraph marginBottom="8px" size={400}>Category: {category}</Paragraph>
      <Pane marginBottom="8px">
        { deleteOperation && role === 'admin' && <Button appearance="primary" intent="danger" onClick={() => deleteTalk(name).then(onDelete).catch(setError)} marginRight="16px">Delete</Button>}
        { attendOperation && <Button appearance="primary" onClick={() => attendTalk(name)}>Attend to the talk</Button>}
      </Pane>
      { error && <Alert intent="danger" title={error.message}/> }
    </Card>
  </div>
}

function RoleSelector({role, setRole}) {
  return <Pane marginBottom={majorScale(2)}>
    <Text marginRight={majorScale(2)}>Role: </Text>
    <SelectMenu
      height={70}
      width={180}
      hasTitle={false}
      hasFilter={false}
      options={[{ label: 'Administrator', value: 'admin' }, {label: 'User', value: 'user'}]}
      selected={role}
      onSelect={el => setRole(el.value)}
    >
      <Button>{role || 'Select role...'}</Button>
    </SelectMenu>
  </Pane>
}

const validateTitle = (value) => typeof value === 'string'
  && value.length >= 10 && value.length <= 40

const nonEmptyString = (value) =>
  typeof value === 'string' && value.length > 0

function invokeCreateCallApi(title, speaker, startTime, category, role) {
  return axios.post(`http://localhost:8080/talks?role=${role}`, {title, speaker, startTime, category})
}

function deleteTalk(title) {
  return axios.delete(`http://localhost:8080/talks/${title}`)
}

function attendTalk(title) {
  const email = prompt('What is your email address?')
  return axios.post(`http://localhost:8080/talks/${title}/attend`, { email })
}

export default TalkCreator