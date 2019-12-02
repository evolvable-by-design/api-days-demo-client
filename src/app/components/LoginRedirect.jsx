import React from 'react'
import { Redirect } from 'react-router-dom'

const LoginRedirect = () => 
  <Redirect to={`/login?redirectTo=${window.location.pathname}${window.location.search}`} />

export default LoginRedirect