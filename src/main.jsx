import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './styles/legacy.css'
import App from './App.jsx'

// basename должен совпадать с base в vite.config.js и именем репозитория
const basename = '/bugbounty-ru-react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
