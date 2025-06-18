import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import { DarkModeProvider } from './DarkModeContext'; // Import the provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DarkModeProvider>
      <AppRoutes />
    </DarkModeProvider>
  </React.StrictMode>
);