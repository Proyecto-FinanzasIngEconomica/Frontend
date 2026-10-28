import { useState } from 'react';
import { Icon } from './Icon.jsx';

export function FormField({ name, label, error, hint, type = 'text', ...props }) {
  const [visible, setVisible] = useState(false);
  const password = type === 'password';
  return (
    <div className="form-field">
      <div className="label-row">
        <label htmlFor={name}>{label}</label>
        <span>Requerido</span>
      </div>
      <div className={`input-wrap ${error ? 'invalid' : ''}`}>
        <input
          {...props}
          id={name}
          name={name}
          type={password && visible ? 'text' : type}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />
        {password && (
          <button
            type="button"
            className="icon-button password-toggle"
            aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} />
          </button>
        )}
      </div>
      {error ? (
        <p className="field-error" id={`${name}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="field-hint" id={`${name}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
