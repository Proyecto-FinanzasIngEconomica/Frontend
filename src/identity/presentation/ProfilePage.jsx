import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../shared/presentation/Icon.jsx';
import './profile.css';

export function ProfilePage({ user, identity, onHome, onSignOut, onActivity }) {
  const [profile, setProfile] = useState(() => identity.getSession()?.user || user);
  const [phone, setPhone] = useState(profile.phone || '');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const heading = useRef(null);
  const phoneInput = useRef(null);
  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    if (editing) phoneInput.current?.focus();
  }, [editing]);
  const initials = (profile.fullName || profile.email)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  function save(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      const updated = identity.updateContact({ phone });
      setProfile(updated);
      setPhone(updated.phone || '');
      setEditing(false);
      setMessage('Teléfono actualizado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los datos.');
    }
  }
  return (
    <section className="profile-page" aria-labelledby="profile-heading">
      <nav className="purchase-breadcrumb" aria-label="Ruta de perfil">
        <Icon name="store" size={13} />
        <button onClick={onHome}>Inicio</button>
        <span>›</span>
        <strong aria-current="page">Mi perfil</strong>
      </nav>
      <h1 id="profile-heading" ref={heading} tabIndex={-1}>
        Mi perfil
      </h1>
      <p className="profile-intro">Gestiona tu información personal y datos de contacto.</p>
      <section className="profile-banner" aria-label="Resumen de tu cuenta">
        <span className="profile-initials">{initials}</span>
        <div>
          <h2>{profile.fullName || profile.email}</h2>
          <p>DNI: {profile.documentNumber || 'No registrado'}</p>
        </div>
        <div className="profile-credit">
          <Icon name="wallet" size={24} />
          <div>
            <small>LÍNEA DE CRÉDITO</small>
            <strong>
              {Number.isFinite(profile.availableCredit)
                ? new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(
                    profile.availableCredit,
                  )
                : 'Sin línea asignada'}
            </strong>
          </div>
        </div>
      </section>
      <div className="profile-columns">
        <form className="profile-information" onSubmit={save}>
          <header>
            <div>
              <h2>
                <Icon name="user" size={19} />
                Información personal
              </h2>
              <p>Datos registrados en tu cuenta.</p>
            </div>
            {!editing && typeof identity.updateContact === 'function' && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditing(true);
                  setMessage('');
                }}
              >
                Editar datos
              </button>
            )}
          </header>
          <div className="profile-fields">
            <label>
              Nombre completo
              <input value={profile.fullName || ''} readOnly autoComplete="name" />
            </label>
            <label>
              Correo electrónico
              <input value={profile.email || ''} readOnly type="email" autoComplete="email" />
            </label>
            <label>
              Teléfono celular de contacto
              <input
                ref={phoneInput}
                type="tel"
                autoComplete="tel"
                value={phone}
                readOnly={!editing}
                maxLength={20}
                placeholder={editing ? '+51 999 999 999' : 'No registrado'}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            {profile.accountType === 'SELLER' && (
              <label>
                Negocio
                <input value={profile.businessName || ''} readOnly />
              </label>
            )}
          </div>
          {editing && (
            <>
              <p className="profile-note">
                Puedes actualizar tu teléfono. El nombre, correo y DNI corresponden a los datos de
                registro.
              </p>
              <div className="profile-edit-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setPhone(profile.phone || '');
                    setEditing(false);
                    setError('');
                  }}
                >
                  Cancelar
                </button>
                <button className="primary-button" type="submit">
                  Guardar cambios
                </button>
              </div>
            </>
          )}
          {error && (
            <p className="profile-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="profile-message" role="status">
              {message}
            </p>
          )}
        </form>
        <aside className="profile-security">
          <button className="profile-signout" onClick={onSignOut}>
            <Icon name="lock" size={17} />
            Cerrar sesión
          </button>
          <p>Cierra la sesión de esta cuenta en este navegador.</p>
          <button className="text-button" onClick={onActivity}>
            Ver actividad de acceso →
          </button>
        </aside>
      </div>
      <button className="profile-back" onClick={onHome}>
        ← Volver al inicio
      </button>
    </section>
  );
}
