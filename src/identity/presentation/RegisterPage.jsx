import { useRef, useState } from 'react';
import { ACCOUNT_TYPES } from '../domain/registration.js';
import { AuthLayout } from '../../shared/presentation/AuthLayout.jsx';
import { FormField } from '../../shared/presentation/FormField.jsx';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './registration.css';
import { PrivacyPolicyDialog } from './PrivacyPolicyDialog.jsx';

const initialValues = {
  accountType: '',
  fullName: '',
  dni: '',
  email: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  ruc: '',
  privacyAccepted: false,
};
const options = [
  {
    value: ACCOUNT_TYPES.SELLER,
    title: 'Soy vendedor',
    icon: 'store',
    description: 'Administra tu negocio, registra ventas y lleva el control de tus créditos.',
    features: ['Gestiona clientes y productos', 'Organiza compras y cobranzas'],
  },
  {
    value: ACCOUNT_TYPES.CLIENT,
    title: 'Soy cliente',
    icon: 'user',
    description: 'Descubre tiendas y productos. Compra y consulta tus créditos desde tu cuenta.',
    features: ['Explora tiendas y productos', 'Regístrate sin códigos de tienda'],
  },
];

export function RegisterPage({ registerAccount, onRegistered, localMode }) {
  const [values, setValues] = useState(initialValues);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const busy = useRef(false);
  const form = useRef(null);
  const heading = useRef(null);
  const seller = values.accountType === ACCOUNT_TYPES.SELLER;

  function selectType(value) {
    setValues((old) => ({
      ...old,
      accountType: value,
      businessName: '',
      ruc: '',
      privacyAccepted: false,
    }));
    setErrors({});
  }
  function field(name) {
    return {
      value: values[name],
      error: errors[name],
      disabled: pending,
      onChange: (event) => {
        setValues((old) => ({ ...old, [name]: event.target.value }));
        setErrors((old) => ({ ...old, [name]: undefined }));
        setMessage('');
      },
    };
  }
  function next() {
    setStep(2);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setMessage('');
    try {
      const result = await registerAccount(values);
      if (!result.ok) {
        setErrors(result.errors);
        requestAnimationFrame(() =>
          form.current?.elements.namedItem(Object.keys(result.errors)[0])?.focus(),
        );
      } else {
        setValues((old) => ({ ...old, password: '', confirmPassword: '' }));
        onRegistered(values.email);
        setMessage(
          seller
            ? 'Solicitud recibida. El administrador revisará el alta de tu negocio.'
            : 'Cuenta creada. Ya puedes explorar tiendas y productos.',
        );
      }
    } catch (error) {
      setMessage(error.message || 'No pudimos completar el registro. Inténtalo nuevamente.');
    } finally {
      setPending(false);
      busy.current = false;
    }
  }

  return (
    <AuthLayout>
      <main id="main-content" className="registration-main">
        <a className="back-link" href="#/ingresar">
          ← Volver a iniciar sesión
        </a>
        <div className="registration-steps" aria-label="Progreso de registro">
          <span
            className={step === 1 ? 'current' : 'completed'}
            aria-current={step === 1 ? 'step' : undefined}
          >
            <b>1</b>Tipo de cuenta
          </span>
          <span className="step-line" />
          <span
            className={step === 2 ? 'current' : ''}
            aria-current={step === 2 ? 'step' : undefined}
          >
            <b>2</b>Tus datos
          </span>
        </div>
        <section
          className={`registration-card ${step === 2 ? 'registration-form-card' : ''}`}
          aria-labelledby="register-title"
        >
          <div className="registration-intro">
            <span className="eyebrow">EMPIEZA CON CREDIFLOW</span>
            <h1 ref={heading} tabIndex={-1} id="register-title">
              {step === 1 ? 'Una cuenta a tu medida' : 'Crea tu cuenta'}
            </h1>
            <p>
              {step === 1
                ? 'Elige cómo quieres usar CrediFlow. Te acompañamos en el siguiente paso.'
                : 'Completa tus datos para comenzar como ' + (seller ? 'vendedor.' : 'cliente.')}
            </p>
          </div>
          {step === 1 ? (
            <>
              <fieldset className="account-options">
                <legend className="sr-only">¿Qué tipo de cuenta quieres registrar?</legend>
                {options.map((option) => (
                  <label
                    key={option.value}
                    className={`account-option ${values.accountType === option.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="accountType"
                      value={option.value}
                      checked={values.accountType === option.value}
                      onChange={() => selectType(option.value)}
                    />
                    <span className="option-icon">
                      <Icon name={option.icon} size={29} />
                    </span>
                    <strong>{option.title}</strong>
                    <span className="option-description">{option.description}</span>
                    <span className="option-features">
                      {option.features.map((feature) => (
                        <span key={feature}>
                          <Icon name="check" size={16} />
                          {feature}
                        </span>
                      ))}
                    </span>
                  </label>
                ))}
              </fieldset>
              <button
                className="primary-button registration-next"
                disabled={!values.accountType}
                onClick={next}
              >
                Continuar
                <Icon name="arrow" size={18} />
              </button>
              <p className="registration-hint">Selecciona el perfil que mejor se adapte a ti.</p>
            </>
          ) : (
            <>
              <div className="selected-account">
                <span>
                  <Icon name={seller ? 'store' : 'user'} />
                  <strong>Cuenta de {seller ? 'vendedor' : 'cliente'}</strong>
                </span>
                <button
                  className="text-button"
                  disabled={pending}
                  onClick={() => {
                    setStep(1);
                    setErrors({});
                    setMessage('');
                  }}
                >
                  Cambiar
                </button>
              </div>
              <form ref={form} noValidate onSubmit={submit} aria-busy={pending}>
                <div className="registration-grid">
                  <FormField
                    name="fullName"
                    label="Nombre completo"
                    autoComplete="name"
                    maxLength={150}
                    placeholder="Ej. Juan Pérez Delgado"
                    {...field('fullName')}
                  />
                  <FormField
                    name="dni"
                    label="Número de DNI"
                    inputMode="numeric"
                    pattern="[0-9]{8}"
                    minLength={8}
                    maxLength={8}
                    placeholder="Ingresa 8 dígitos"
                    hint="Sin el dígito verificador."
                    {...field('dni')}
                  />
                </div>
                <FormField
                  name="email"
                  label="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  maxLength={100}
                  placeholder="tu@correo.com"
                  {...field('email')}
                />
                <div className="registration-grid">
                  <FormField
                    name="password"
                    label="Contraseña"
                    type="password"
                    autoComplete="new-password"
                    maxLength={72}
                    placeholder="Mínimo 8 caracteres"
                    {...field('password')}
                  />
                  <FormField
                    name="confirmPassword"
                    label="Confirmar contraseña"
                    type="password"
                    autoComplete="new-password"
                    maxLength={72}
                    placeholder="Repite tu contraseña"
                    {...field('confirmPassword')}
                  />
                </div>
                {seller ? (
                  <div className="business-fields">
                    <h2>Datos de tu negocio</h2>
                    <p>
                      {localMode
                        ? 'En este modo de prueba podrás acceder como vendedor local.'
                        : 'Tu solicitud de vendedor estará sujeta a la validación del administrador.'}
                    </p>
                    <div className="registration-grid">
                      <FormField
                        name="businessName"
                        label="Nombre del negocio"
                        autoComplete="organization"
                        maxLength={100}
                        placeholder="Ej. Bodega San Miguel"
                        {...field('businessName')}
                      />
                      <FormField
                        name="ruc"
                        label="RUC"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="11 dígitos"
                        {...field('ruc')}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="client-registration-note">
                    Tu cuenta es independiente de las tiendas. No necesitas un código para
                    registrarte y explorar sus productos.
                  </p>
                )}
                <div className={`registration-consent ${errors.privacyAccepted ? 'invalid' : ''}`}>
                  <div className="registration-consent-row">
                    <input
                      id="privacy-accepted"
                      name="privacyAccepted"
                      type="checkbox"
                      required
                      checked={values.privacyAccepted}
                      disabled={pending}
                      aria-labelledby="privacy-consent-label"
                      aria-invalid={Boolean(errors.privacyAccepted)}
                      aria-describedby={
                        errors.privacyAccepted ? 'privacy-consent-error' : 'privacy-consent-hint'
                      }
                      onChange={(event) => {
                        setValues((old) => ({ ...old, privacyAccepted: event.target.checked }));
                        setErrors((old) => ({ ...old, privacyAccepted: undefined }));
                      }}
                    />
                    <span id="privacy-consent-label">
                      <label htmlFor="privacy-accepted">He leído la </label>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setShowPrivacy(true)}
                      >
                        Política de Privacidad
                      </button>
                      <label htmlFor="privacy-accepted">
                        {' '}
                        y acepto el tratamiento de mis datos personales para gestionar mi cuenta,
                        compras y financiamientos.
                      </label>
                    </span>
                  </div>
                  <p id="privacy-consent-hint">
                    Aceptación obligatoria para clientes y vendedores. Política provisional del
                    entorno de prueba.
                  </p>
                  {errors.privacyAccepted && (
                    <p id="privacy-consent-error" className="consent-error" role="alert">
                      {errors.privacyAccepted}
                    </p>
                  )}
                </div>
                {message && (
                  <div className="form-alert" role="alert">
                    {message}
                  </div>
                )}
                <button
                  className="primary-button"
                  disabled={pending || !values.privacyAccepted}
                  type="submit"
                >
                  {pending
                    ? 'Validando…'
                    : seller
                      ? 'Solicitar cuenta de vendedor'
                      : 'Crear cuenta de cliente'}
                  <Icon name="arrow" size={18} />
                </button>
                <p className="registration-hint">
                  {localMode
                    ? 'Modo local: tu cuenta se guardará solo en este navegador. Usa datos de prueba.'
                    : 'El registro aún no está conectado al servidor. No se enviarán tus datos.'}
                </p>
              </form>
            </>
          )}
          <div className="card-footer">
            <span>¿Ya tienes una cuenta?</span>
            <a className="text-button" href="#/ingresar">
              Iniciar sesión
            </a>
          </div>
        </section>
        <div className="access-note">
          <Icon name="shield" size={16} />
          <span>Tu negocio y tus cuentas, conectados.</span>
        </div>
      </main>
      {showPrivacy && <PrivacyPolicyDialog onClose={() => setShowPrivacy(false)} />}
    </AuthLayout>
  );
}
