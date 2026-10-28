import { useEffect, useState } from 'react';
import { LoginPage } from '../identity/presentation/LoginPage.jsx';
import { RegisterPage } from '../identity/presentation/RegisterPage.jsx';
import { DashboardPage } from '../dashboard/presentation/DashboardPage.jsx';
import { signIn, registerAccount, identity, localMode } from './dependencies.js';

export function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [session, setSession] = useState(() => {
    try {
      return identity.getSession();
    } catch {
      return null;
    }
  });
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    const sync = () => {
      try {
        setSession(identity.getSession());
      } catch {
        setSession(null);
      }
    };
    window.addEventListener('hashchange', update);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const registration = hash === '#/registro' && !session;
  useEffect(() => {
    document.title = `${session ? 'Inicio' : registration ? 'Crear cuenta' : 'Iniciar sesión'} · CrediFlow`;
    window.scrollTo(0, 0);
  }, [registration, session]);
  if (session)
    return (
      <DashboardPage
        session={session}
        identity={identity}
        localMode={localMode}
        onSignOut={() => {
          try {
            identity.signOut();
          } finally {
            setSession(null);
            window.location.hash = '/ingresar';
            setNotice('Has cerrado sesión.');
          }
        }}
      />
    );
  return registration ? (
    <RegisterPage
      registerAccount={registerAccount}
      localMode={localMode}
      onRegistered={(email) => {
        setNotice(`Cuenta creada para ${email}. Ya puedes iniciar sesión.`);
        window.location.hash = '/ingresar';
      }}
    />
  ) : (
    <LoginPage
      signIn={signIn}
      notice={notice}
      onSignedIn={(result) => {
        setSession(result);
        setNotice('');
        window.location.hash = '/inicio';
      }}
    />
  );
}
