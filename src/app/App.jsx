import { useEffect, useState } from 'react';
import { LoginPage } from '../identity/presentation/LoginPage.jsx';
import { RegisterPage } from '../identity/presentation/RegisterPage.jsx';
import { signIn, registerAccount } from './dependencies.js';

export function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const registration = hash === '#/registro';
  useEffect(() => {
    document.title = `${registration ? 'Crear cuenta' : 'Iniciar sesión'} · CrediFlow`;
    window.scrollTo(0, 0);
  }, [registration]);
  return registration ? (
    <RegisterPage registerAccount={registerAccount} />
  ) : (
    <LoginPage signIn={signIn} />
  );
}
