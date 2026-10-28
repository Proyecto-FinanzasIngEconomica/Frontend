import { useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import { HelpDialog } from '../../shared/presentation/HelpDialog.jsx';

export function LoginPage({ signIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [session, setSession] = useState(null);
  const [help, setHelp] = useState(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const busy = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setMessage('');
    setErrors({});
    try {
      const result = await signIn({ username, password });
      if (!result.ok) {
        setErrors(result.errors);
        (result.errors.username ? usernameRef : passwordRef).current?.focus();
      } else {
        setPassword('');
        setSession(result.session);
      }
    } catch (error) {
      setMessage(error.message || 'Ocurrió un error. Vuelve a intentar.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="CrediFlow, inicio">
          <span className="brand-symbol">
            <Icon name="store" size={25} />
          </span>
          <span>
            <span className="brand-name">CrediFlow</span>
            <span className="brand-caption">EL CRÉDITO DE TU NEGOCIO, EN ORDEN</span>
          </span>
        </a>
        <span className="header-note">
          <span className="status-dot" />
          Hecho para tu negocio
        </span>
      </header>

      <main id="main-content" className="login-main">
        <div className="welcome">
          <span className="eyebrow">BIENVENIDO A CREDIFLOW</span>
          <p>Tu negocio y tus cuentas, en un solo lugar.</p>
        </div>
        <section className="login-card" aria-labelledby="login-title">
          <div className="card-intro">
            <span className="entry-icon">
              <Icon name="lock" size={24} />
            </span>
            <h1 id="login-title">{session ? 'Acceso verificado' : 'Iniciar sesión'}</h1>
            <p>
              {session
                ? `Bienvenido, ${session.user.username || 'usuario'}.`
                : 'Ingresa con tu usuario y contraseña para acceder a tu cuenta.'}
            </p>
          </div>

          {session ? (
            <div className="session-result" role="status">
              <Icon name="check" />
              <p>
                Tu sesión ha sido validada. El panel de tu perfil se incorporará en el siguiente
                avance.
              </p>
              <button className="secondary-button" onClick={() => setSession(null)}>
                Volver al acceso
              </button>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} aria-busy={pending}>
              <div className="form-field">
                <div className="label-row">
                  <label htmlFor="username">Nombre de usuario</label>
                  <span>Requerido</span>
                </div>
                <div className={`input-wrap ${errors.username ? 'invalid' : ''}`}>
                  <Icon name="user" />
                  <input
                    ref={usernameRef}
                    id="username"
                    name="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck="false"
                    maxLength={50}
                    required
                    placeholder="Ej. juan.perez"
                    value={username}
                    disabled={pending}
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrors((old) => ({ ...old, username: undefined }));
                    }}
                  />
                </div>
                {errors.username && (
                  <p className="field-error" id="username-error">
                    {errors.username}
                  </p>
                )}
              </div>
              <div className="form-field">
                <div className="label-row">
                  <label htmlFor="password">Contraseña</label>
                  <span>Requerido</span>
                </div>
                <div className={`input-wrap ${errors.password ? 'invalid' : ''}`}>
                  <Icon name="lock" />
                  <input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type={visible ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    disabled={pending}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((old) => ({ ...old, password: undefined }));
                    }}
                  />
                  <button
                    type="button"
                    className="icon-button password-toggle"
                    aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    <Icon name={visible ? 'eyeOff' : 'eye'} />
                  </button>
                </div>
                {errors.password && (
                  <p className="field-error" id="password-error">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="form-options">
                <span className="credential-note">
                  <Icon name="shield" size={14} /> Tus datos, protegidos
                </span>
                <button className="text-button" type="button" onClick={() => setHelp('password')}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              {message && (
                <div className="form-alert" role="alert">
                  {message}
                </div>
              )}
              <button className="primary-button" type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <span className="spinner" />
                    Conectando…
                  </>
                ) : (
                  <>
                    Iniciar sesión
                    <Icon name="arrow" size={18} />
                  </>
                )}
              </button>
            </form>
          )}
          <div className="card-footer">
            <span>¿Aún no tienes acceso?</span>
            <button className="text-button" onClick={() => setHelp('account')}>
              Solicitar una cuenta
              <Icon name="arrow" size={14} />
            </button>
          </div>
        </section>
        <div className="access-note">
          <Icon name="shield" size={16} />
          <span>Un acceso para administradores y clientes.</span>
        </div>
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} CrediFlow</span>
        <span>Más claridad. Mejores cuentas.</span>
      </footer>
      <HelpDialog topic={help} onClose={() => setHelp(null)} />
    </div>
  );
}
