import React from 'react'
import { Route } from 'react-router-dom'

import Talk_v1 from './no-semantics-app/Talk_v1'
import Talk_v2 from './no-semantics-app/Talk_v2'
import TalkSemantics from './semantics-app/Talk'
 
const AppRouter = () =>
  <>
    <Route path="/" exact component={Talk_v1} />
    <Route path="/v1" exact component={Talk_v1} />
    <Route path="/v2" exact component={Talk_v2} />
    <Route path="/semantics" exact component={TalkSemantics} />
  </>

export default AppRouter