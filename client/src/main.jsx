import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // እዚ ኣገዳሲ እዩ

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* ብምሉኡ እቲ App ኣብ ውሽጢ BrowserRouter ክኸውን ኣለዎ */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)