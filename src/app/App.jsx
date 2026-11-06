import { useEffect, useState } from 'react';
import { LoginPage } from '../identity/presentation/LoginPage.jsx';
import { AuthLayout } from '../shared/presentation/AuthLayout.jsx';
import { BackendDashboard } from './BackendDashboard.jsx';
import { signIn, signOut } from './backendSession.js';

export function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [session, setSession] = useState(null);
  const [notice, setNotice] = useState('');

  function endSession(message) {
    signOut();
    setSession(null);
    setNotice(message);
    window.location.hash = '/ingresar';
  }

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  useEffect(() => {
    if (!session?.expiresAt) return;
    const delay = Math.max(0, Date.parse(session.expiresAt) - Date.now());
    const timeout = setTimeout(() => endSession('Tu sesión venció. Ingresa nuevamente.'), delay);
    return () => clearTimeout(timeout);
  }, [session]);

  if (session) {
    return (
      <BackendDashboard user={session.user} onSignOut={() => endSession('Has cerrado sesión.')} />
    );
  }

  if (hash === '#/registro') {
    return (
      <AuthLayout>
        <main id="main-content" className="login-main">
          <section className="login-card">
            <h1>Solicitar una cuenta</h1>
            <p>Para abrir una tienda, solicita el alta al administrador de CrediFlow.</p>
            <p>Si eres cliente, solicita a tu tienda que habilite tu usuario.</p>
            <a className="text-button" href="#/ingresar">
              Volver a iniciar sesión
            </a>
          </section>
        </main>
      </AuthLayout>
    );
  }

  return (
    <LoginPage
      usernameLogin
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
