import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { ApolloProvider } from '@apollo/client/react'
import { apolloClient } from './apollo/client.ts'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={apolloClient}>
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  </ApolloProvider>
)
