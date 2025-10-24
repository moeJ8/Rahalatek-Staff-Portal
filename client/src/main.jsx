import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import store from './redux/store'
import './index.css'
import './i18n/config' // Import i18n configuration
import App from './App.jsx'
import setupInterceptors from './utils/axiosInterceptor'


setupInterceptors();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </StrictMode>,
)
