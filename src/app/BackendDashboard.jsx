import { useEffect, useRef, useState } from 'react';
import { Icon } from '../shared/presentation/Icon.jsx';
import { api } from './backendSession.js';
import { clientSections, storeSections, systemSections } from './backendSections.js';
import '../dashboard/presentation/dashboard.css';
import './backendDashboard.css';

export function BackendDashboard({ user, onSignOut }) {
  const [tab, setTab] = useState(0);
  const config = {
    SYSTEM_ADMIN: ['/api/v1', systemSections, 'Administrador del sistema'],
    STORE_ADMIN: ['/api/v1/stores/' + user.storeId, storeSections, 'Vendedor'],
    CLIENT: ['/api/v1/me', clientSections, 'Cliente'],
  };
  const [base, sections, role] = config[user.role];
  return (
    <div className="app-shell dashboard-shell">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-symbol">
            <Icon name="store" size={26} />
          </span>
          <span className="brand-name">CrediFlow</span>
        </div>
        <nav aria-label="Navegación principal">
          {sections.map(({ title }, index) => (
            <button
              key={title}
              className={index === tab ? 'active' : ''}
              aria-current={index === tab ? 'page' : undefined}
              onClick={() => setTab(index)}
            >
              {title}
            </button>
          ))}
        </nav>
        <div className="dashboard-user">
          <span>
            {user.username} · {role}
          </span>
          <button className="logout-button" onClick={onSignOut}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="dashboard-main">
        {user.role === 'CLIENT' && <p className="eyebrow">PORTAL DEL CLIENTE</p>}
        <ResourceSection key={tab} base={base} section={sections[tab]} />
      </main>
    </div>
  );
}

function ResourceSection({ base, section }) {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState('');
  const request = useRef(0);
  const busy = useRef(false);
  const path = section.path ? base + '/' + section.path : base;

  useEffect(() => {
    if (section.path === undefined) return;
    let active = true;
    const params = new URLSearchParams({ page, size: 20 });
    if (actionFilter) params.set('action', actionFilter);
    api
      .get(section.single ? path : path + '?' + params)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [section, path, page, revision, actionFilter]);

  function refresh() {
    setResult(null);
    setError('');
    setRevision((value) => value + 1);
  }

  async function showDetail(row) {
    const id = ++request.current;
    setDetail({ loading: true });
    try {
      const data = await api.get(path + '/' + row.id);
      if (id === request.current) setDetail({ data });
    } catch (failure) {
      if (id === request.current) setDetail({ error: failure.message });
    }
  }

  async function deactivate(row) {
    if (busy.current || !window.confirm('¿Dar de baja este producto?')) return;
    busy.current = true;
    try {
      await section.deactivate(api, base, row);
      setNotice('Producto dado de baja.');
      refresh();
    } catch (failure) {
      setNotice(failure.message);
    } finally {
      busy.current = false;
    }
  }

  const rows = section.single ? (result ? [result] : []) : result?.content || [];
  return (
    <section className="dashboard-panel backend-panel">
      <h1>{section.title}</h1>
      {section.description && <p>{section.description}</p>}
      {section.actionFilters && (
        <label>
          Tipo de evento{' '}
          <select
            value={actionFilter}
            onChange={(event) => {
              setActionFilter(event.target.value);
              setPage(0);
              refresh();
            }}
          >
            <option value="">Todos</option>
            {section.actionFilters.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="backend-actions">
        {section.forms?.map((action) => (
          <button
            className="secondary-button"
            key={action.title}
            onClick={() => {
              setForm({ action });
              setNotice('');
            }}
          >
            {action.title}
          </button>
        ))}
      </div>
      {notice && <p role="status">{notice}</p>}
      {form && (
        <OperationForm
          key={form.action.title + (form.row?.id || '')}
          {...form}
          base={base}
          onClose={() => setForm(null)}
          onSaved={(record) => {
            setForm(null);
            setNotice(
              record?.id ? 'Operación guardada. ID ' + record.id + '.' : 'Operación completada.',
            );
            refresh();
          }}
        />
      )}
      {error && (
        <p role="alert">
          {error} <button onClick={refresh}>Reintentar</button>
        </p>
      )}
      {section.path !== undefined && !result && !error && <p role="status">Cargando…</p>}
      {result && rows.length === 0 && <p>Todavía no hay registros.</p>}
      {rows.length > 0 && (
        <DataTable
          rows={rows}
          columns={section.columns}
          labels={section.actionFilters && Object.fromEntries(section.actionFilters)}
          actions={
            section.detail || section.edit
              ? (row) => (
                  <>
                    {section.detail && <button onClick={() => showDetail(row)}>Ver detalle</button>}
                    {section.edit && (
                      <button onClick={() => setForm({ action: section.edit, row })}>Editar</button>
                    )}
                    {section.deactivate && row.status === 'ACTIVE' && (
                      <button onClick={() => deactivate(row)}>Dar de baja</button>
                    )}
                  </>
                )
              : undefined
          }
        />
      )}
      {result?.page?.totalPages > 1 && (
        <div className="backend-actions">
          <button
            disabled={page === 0}
            onClick={() => {
              setPage(page - 1);
              refresh();
            }}
          >
            Anterior
          </button>
          <span>
            Página {page + 1} de {result.page.totalPages}
          </span>
          <button
            disabled={page + 1 >= result.page.totalPages}
            onClick={() => {
              setPage(page + 1);
              refresh();
            }}
          >
            Siguiente
          </button>
        </div>
      )}
      {detail && (
        <div className="backend-detail">
          <button
            onClick={() => {
              request.current += 1;
              setDetail(null);
            }}
          >
            Cerrar detalle
          </button>
          {detail.loading && <p role="status">Cargando detalle…</p>}
          {detail.error && <p role="alert">{detail.error}</p>}
          {detail.data &&
            section.detail.map(([key, title]) => (
              <div key={key}>
                <h2>{title}</h2>
                {detail.data[key]?.length > 0 ? (
                  <DataTable
                    rows={detail.data[key]}
                    currency={detail.data.currency}
                    columns={detailColumns[section.path + '/' + key]}
                  />
                ) : (
                  <p>Sin registros.</p>
                )}
              </div>
            ))}
        </div>
      )}
    </section>
  );
}

const detailColumns = {
  'purchases/items': [
    ['productName', 'Producto'],
    ['quantity', 'Cantidad'],
    ['unitPrice', 'Precio unitario'],
    ['subtotal', 'Subtotal'],
  ],
  'purchases/installments': [
    ['installmentNumber', 'Cuota'],
    ['dueDate', 'Vencimiento'],
    ['principalPart', 'Capital'],
    ['interestPart', 'Interés'],
    ['amount', 'Total'],
    ['status', 'Estado'],
  ],
  'statements/lines': [
    ['purchaseId', 'Compra'],
    ['installmentNumber', 'Cuota'],
    ['dueDate', 'Vencimiento'],
    ['principalPart', 'Capital'],
    ['interestPart', 'Interés'],
    ['amount', 'Importe'],
  ],
  'payments/lines': [
    ['purchaseId', 'Compra'],
    ['installmentNumber', 'Cuota'],
    ['principalPaid', 'Capital'],
    ['interestPaid', 'Interés'],
    ['lateInterestPaid', 'Mora pagada'],
    ['total', 'Total'],
  ],
};
const moneyFields = new Set([
  'cashPrice',
  'creditPrice',
  'creditLimit',
  'usedCredit',
  'availableCredit',
  'totalToPay',
  'totalPaid',
  'unitPrice',
  'subtotal',
  'principalPart',
  'interestPart',
  'amount',
  'principalPaid',
  'interestPaid',
  'lateInterestPaid',
  'total',
]);
const status = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  INSTALLMENTS: 'Cuotas',
  END_OF_MONTH: 'Fin de mes',
  PAID: 'Pagado',
  PENDING: 'Pendiente',
  ISSUED: 'Emitido',
};

function display(value, field, currency) {
  if (value == null || value === '') return '—';
  if (currency && moneyFields.has(field)) {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(value);
  }
  return status[value] || String(value).replace(/^(\d{4}-\d{2}-\d{2})T/, '$1 ');
}

function DataTable({ rows, columns, actions, currency, labels }) {
  return (
    <div className="backend-table">
      <table>
        <thead>
          <tr>
            <th scope="col">ID</th>
            {columns.map(([field, label]) => (
              <th scope="col" key={field}>
                {label}
              </th>
            ))}
            {actions && <th scope="col">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              <td>{row.id ?? '—'}</td>
              {columns.map(([field]) => (
                <td key={field}>
                  {field === 'action' && labels?.[row[field]]
                    ? labels[row[field]]
                    : display(row[field], field, row.currency || currency)}
                </td>
              ))}
              {actions && <td className="backend-actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OperationForm({ action, row, base, onSaved, onClose }) {
  const [values, setValues] = useState(row || {});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const fields = action.fields.filter(({ when }) => !when || values[when[0]] === when[1]);

  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    const data = new FormData(event.currentTarget);
    const payload = {};
    for (const field of fields) {
      const value = data.get(field.name);
      if (field.type === 'checkbox') payload[field.name] = value !== null;
      else if (field.type === 'number') payload[field.name] = Number(value);
      else payload[field.name] = value || null;
    }
    try {
      onSaved(await action.submit(api, payload, base, row));
    } catch (failure) {
      setError(failure.message);
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <form className="backend-form" onSubmit={submit}>
      <h2>{action.title}</h2>
      <fieldset disabled={pending}>
        {fields.map(({ name, label, options, optionsPath, when, ...rules }) => (
          <label key={name}>
            <span>{label}</span>
            {optionsPath ? (
              <RemoteSelect path={optionsPath} name={name} required={rules.required} />
            ) : options ? (
              <select
                name={name}
                required={rules.required}
                value={values[name] ?? ''}
                onChange={(event) => setValues({ ...values, [name]: event.target.value })}
              >
                <option value="">Selecciona</option>
                {options.map(([value, title]) => (
                  <option key={value} value={value}>
                    {title}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={name}
                defaultValue={rules.type === 'checkbox' ? undefined : (row?.[name] ?? '')}
                defaultChecked={rules.type === 'checkbox' ? Boolean(row?.[name]) : undefined}
                {...rules}
              />
            )}
          </label>
        ))}
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <div className="backend-actions">
        <button className="secondary-button" type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onClose} disabled={pending}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function RemoteSelect({ path, name, required }) {
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api
      .get(path)
      .then((result) => {
        if (active) setOptions(result);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [path]);
  return (
    <>
      <select name={name} required={required} defaultValue="">
        <option value="">Selecciona</option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      {error && <span role="alert">{error}</span>}
    </>
  );
}
