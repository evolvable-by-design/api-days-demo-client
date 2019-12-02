import React from 'react'

const AppStateContext = React.createContext()
const AppDispatchContext = React.createContext()

function appContextReducer(state, action) {
  switch (action.type) {
    case 'updateUserProfile': {
      return {
        ...state,
        userProfile: action.userProfile
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function AppContextProvider({children, defaultState}) {
  const [state, dispatch] = React.useReducer(appContextReducer, defaultState)
  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  )
}

function useAppContextState() {
  const context = React.useContext(AppStateContext)
  if (context === undefined) {
    throw new Error('useAppContextState must be used within a AppContextProvider')
  }
  return context
}

function useAppContextDispatch() {
  const context = React.useContext(AppDispatchContext)
  if (context === undefined) {
    throw new Error('useAppContextDispatch must be used within a AppContextProvider')
  }
  return context
}

export {AppContextProvider, useAppContextState, useAppContextDispatch}
