import React from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './identity/presentation/LoginPage.jsx';
import { signIn } from './app/dependencies.js';
import './shared/presentation/styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoginPage signIn={signIn} />
  </React.StrictMode>,
);
