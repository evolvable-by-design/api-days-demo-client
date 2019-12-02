# Talk_v1 -> Talk_v2

TODO

```jsx
// after line 12
const [ category, setCategory ] = useState()

// in imports, add Select to evergreen-ui
Select
// after line 31
<Select value={category} onChange={event => setCategory(event.target.value)}>
  <option value="API Design">API Design</option>
  <option value="API Maintenance">API Maintenance</option>
  <option value="API Management">API Management</option>
</Select>

'API Design', 'API Maintenance', 'API Management'
```