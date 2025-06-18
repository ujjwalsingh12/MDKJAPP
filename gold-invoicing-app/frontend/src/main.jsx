import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes';
import App from './App';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <AppRoutes />
    {/* <AppRoutes DarkMode={DarkMode} setDarkMode={setDarkMode} /> */}
  </React.StrictMode>
);