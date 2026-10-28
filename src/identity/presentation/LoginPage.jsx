import { useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import { AuthLayout } from '../../shared/presentation/AuthLayout.jsx';
import { HelpDialog } from '../../shared/presentation/HelpDialog.jsx';

export function LoginPage({ signIn, onSignedIn, notice }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [session, setSession] = useState(null);
  const [help, setHelp] = useState(null);
  const emailRef = useRef(null);
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
      const result = await signIn({ email, password });
      if (!result.ok) {
        setErrors(result.errors);
        (result.errors.email ? emailRef : passwordRef).current?.focus();
      } else {
        setPassword('');
        setSession(result.session);
        onSignedIn(result.session);
      }
    } catch (error) {
      setMessage(error.message || 'Ocurrió un error. Vuelve a intentar.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <AuthLayout>
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
                ? `Bienvenido, ${session.user.email || 'usuario'}.`
                : 'Ingresa con tu correo y contraseña para acceder a tu cuenta.'}
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
              {notice && (
                <div className="form-alert" role="status">
                  {notice}
                </div>
              )}
              <div className="form-field">
                <div className="label-row">
                  <label htmlFor="email">Correo electrónico</label>
                  <span>Requerido</span>
                </div>
                <div className={`input-wrap ${errors.email ? 'invalid' : ''}`}>
                  <Icon name="user" />
                  <input
                    ref={emailRef}
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    autoCapitalize="none"
                    spellCheck="false"
                    maxLength={100}
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    disabled={pending}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((old) => ({ ...old, email: undefined }));
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="field-error" id="email-error">
                    {errors.email}
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
            <a className="text-button" href="#/registro">
              Solicitar una cuenta
              <Icon name="arrow" size={14} />
            </a>
          </div>
        </section>
        <div className="access-note">
          <Icon name="shield" size={16} />
          <span>Un acceso para administradores y clientes.</span>
        </div>
      </main>
      <HelpDialog topic={help} onClose={() => setHelp(null)} />
    </AuthLayout>
  );
}
