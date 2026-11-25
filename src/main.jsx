import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { EventProvider } from './context/EventContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EventProvider>
      <App />
    </EventProvider>
  </StrictMode>,
);
