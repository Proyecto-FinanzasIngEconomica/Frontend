const text = (name, label, rules = {}) => ({ name, label, ...rules });
const number = (name, label, min = 1, step = 1, max) =>
  text(name, label, { type: 'number', required: true, min, step, max });
const select = (name, label, options) => ({ name, label, options, required: true });
const required = { required: true };
const currency = select('currency', 'Moneda', [
  ['PEN', 'Soles'],
  ['USD', 'Dólares'],
]);
const credentials = [
  text('username', 'Usuario', { ...required, pattern: '[A-Za-z0-9]{4,50}' }),
  text('password', 'Contraseña inicial', {
    ...required,
    type: 'password',
    minLength: 8,
    maxLength: 72,
  }),
];
const contact = [
  text('address', 'Dirección', { maxLength: 200 }),
  text('phone', 'Teléfono', { type: 'tel', maxLength: 20 }),
  text('email', 'Correo', { type: 'email', maxLength: 100 }),
];
const name = text('name', 'Nombre', { ...required, maxLength: 100 });
const clientId = number('clientId', 'ID del cliente');
const statementId = number('statementId', 'ID del estado de cuenta');
const purchaseList = {
  title: 'Compras y financiamientos',
  path: 'purchases',
  columns: [
    ['purchasedAt', 'Fecha'],
    ['modality', 'Modalidad'],
    ['installmentCount', 'Cuotas'],
    ['totalToPay', 'Total'],
  ],
  detail: [
    ['items', 'Productos'],
    ['installments', 'Cronograma'],
  ],
};
const statementList = {
  title: 'Estados de cuenta',
  path: 'statements',
  columns: [
    ['cycleCutoffDate', 'Corte'],
    ['paymentDate', 'Vencimiento'],
    ['status', 'Estado'],
    ['totalToPay', 'Total'],
  ],
  detail: [['lines', 'Cuotas facturadas']],
};
const paymentList = {
  title: 'Historial de pagos',
  path: 'payments',
  columns: [
    ['paidAt', 'Fecha'],
    ['statementId', 'Estado de cuenta'],
    ['totalPaid', 'Pagado'],
  ],
  detail: [['lines', 'Detalle del pago']],
};
const changePassword = {
  title: 'Cambiar contraseña',
  fields: [
    text('currentPassword', 'Contraseña actual', { ...required, type: 'password' }),
    text('newPassword', 'Nueva contraseña', {
      ...required,
      type: 'password',
      minLength: 8,
      maxLength: 72,
    }),
  ],
  submit: (api, values) => api.patch('/api/v1/auth/password', values),
};

export const clientSections = [
  {
    title: 'Mi perfil',
    path: 'profile',
    columns: [
      ['name', 'Nombre'],
      ['lastName', 'Apellidos'],
      ['documentNumber', 'Documento'],
      ['email', 'Correo'],
      ['phone', 'Teléfono'],
      ['address', 'Dirección'],
    ],
    single: true,
    description: 'Consulta tus datos personales registrados por tu tienda.',
    forms: [changePassword],
  },
  {
    title: 'Línea de crédito',
    path: 'credit-line',
    columns: [
      ['creditLimit', 'Límite'],
      ['usedCredit', 'Crédito usado'],
      ['availableCredit', 'Crédito disponible'],
    ],
    single: true,
  },
  {
    title: 'Catálogo de mi tienda',
    path: 'products',
    columns: [
      ['name', 'Producto'],
      ['description', 'Descripción'],
      ['unitOfMeasure', 'Unidad'],
      ['cashPrice', 'Contado'],
      ['creditPrice', 'Crédito'],
    ],
  },
  {
    ...purchaseList,
    title: 'Mis compras',
    description: 'Consulta tus compras a crédito y el cronograma de cuotas.',
  },
  { ...statementList, title: 'Mis estados de cuenta' },
  {
    ...paymentList,
    title: 'Mis pagos',
    description: 'Revisa los pagos que tu tienda registró y el detalle de cada movimiento.',
  },
];

export const systemSections = [
  {
    title: 'Tiendas',
    path: 'stores',
    columns: [
      ['name', 'Nombre'],
      ['ruc', 'RUC'],
      ['status', 'Estado'],
      ['email', 'Correo'],
    ],
    forms: [
      {
        title: 'Registrar tienda y vendedor',
        fields: [
          {
            name: 'businessTypeId',
            label: 'Giro',
            required: true,
            optionsPath: '/api/v1/business-types',
          },
          name,
          text('legalName', 'Razón social', { maxLength: 150 }),
          text('ruc', 'RUC', { ...required, pattern: '[0-9]{11}' }),
          ...contact,
          ...credentials,
        ],
        submit: (api, { username, password, businessTypeId, ...shop }, base) =>
          api.post(base + '/stores', {
            ...shop,
            businessTypeId: Number(businessTypeId),
            admin: { username, password },
          }),
      },
    ],
  },
  {
    title: 'Auditoría',
    path: 'audit',
    columns: [
      ['occurredAt', 'Fecha'],
      ['username', 'Usuario'],
      ['storeId', 'Tienda'],
      ['action', 'Acción'],
      ['entityType', 'Recurso'],
      ['entityId', 'ID del recurso'],
      ['detail', 'Detalle'],
      ['ip', 'IP'],
    ],
    actionFilters: [
      ['LOGIN', 'Inicio de sesión'],
      ['LOGIN_FAILED', 'Inicio de sesión fallido'],
      ['PURCHASE_REGISTERED', 'Compra registrada'],
      ['PAYMENT_REGISTERED', 'Pago registrado'],
    ],
  },
  { title: 'Mi cuenta', forms: [changePassword] },
];

const productFields = [
  text('name', 'Nombre', { ...required, maxLength: 150 }),
  text('description', 'Descripción', { maxLength: 300 }),
  text('supplier', 'Proveedor', { maxLength: 100 }),
  text('brand', 'Marca', { maxLength: 100 }),
  text('unitOfMeasure', 'Unidad de medida', { ...required, maxLength: 30 }),
  text('imageUrl', 'URL de la imagen (HTTP o HTTPS)', { type: 'url', maxLength: 255 }),
  number('cashPrice', 'Precio al contado', 0, 0.01),
  number('creditPrice', 'Precio a crédito', 0, 0.01),
  currency,
  text('endOfMonthAllowed', 'Permite pago a fin de mes', { type: 'checkbox' }),
  text('installmentsAllowed', 'Permite cuotas', { type: 'checkbox' }),
];
const yearlyRate = (percent) => ({ type: 'EFFECTIVE', value: percent / 100, period: 'ANNUAL' });

export const storeSections = [
  {
    title: 'Mi tienda',
    path: '',
    single: true,
    columns: [
      ['name', 'Nombre'],
      ['ruc', 'RUC'],
      ['address', 'Dirección'],
      ['email', 'Correo'],
      ['status', 'Estado'],
    ],
    forms: [changePassword],
  },
  {
    title: 'Productos',
    path: 'products',
    columns: [
      ['name', 'Nombre'],
      ['unitOfMeasure', 'Unidad'],
      ['cashPrice', 'Contado'],
      ['creditPrice', 'Crédito'],
      ['status', 'Estado'],
    ],
    forms: [
      {
        title: 'Registrar producto',
        fields: productFields,
        submit: (api, values, base) => api.post(base + '/products', values),
      },
    ],
    edit: {
      title: 'Editar producto',
      fields: productFields,
      submit: (api, values, base, row) => api.put(base + '/products/' + row.id, values),
    },
    deactivate: (api, base, row) => api.patch(base + '/products/' + row.id + '/deactivate'),
  },
  {
    title: 'Clientes',
    path: 'clients',
    columns: [
      ['name', 'Nombre'],
      ['lastName', 'Apellidos'],
      ['documentNumber', 'Documento'],
      ['status', 'Estado'],
    ],
    forms: [
      {
        title: 'Registrar cliente',
        fields: [
          text('documentNumber', 'DNI', { ...required, pattern: '[0-9]{8}' }),
          name,
          text('lastName', 'Apellidos', { maxLength: 100 }),
          ...contact,
        ],
        submit: (api, values, base) =>
          api.post(base + '/clients', { documentType: 'DNI', ...values }),
      },
      {
        title: 'Habilitar acceso al cliente',
        fields: [clientId, ...credentials],
        submit: (api, { clientId, ...values }, base) =>
          api.post(base + '/clients/' + clientId + '/account', values),
      },
      {
        title: 'Asignar condición de crédito',
        fields: [
          clientId,
          number('creditLimit', 'Límite de crédito', 0.01, 0.01),
          currency,
          number('interest', 'Interés efectivo anual (%)', 0, 0.01),
          number('lateInterest', 'Mora efectiva anual (%)', 0, 0.01),
          number('maxInstallmentMonths', 'Máximo de cuotas', 1, 1, 60),
          number('cutoffDay', 'Día de corte', 1, 1, 30),
          text('cutoffTime', 'Hora de corte', { ...required, type: 'time' }),
          number('paymentDay', 'Día de pago', 1, 1, 30),
        ],
        submit: (api, { clientId, interest, lateInterest, ...values }, base) =>
          api.post(base + '/clients/' + clientId + '/credit-conditions', {
            ...values,
            compensatoryRate: yearlyRate(interest),
            lateRate: yearlyRate(lateInterest),
          }),
      },
    ],
  },
  {
    ...purchaseList,
    forms: [
      {
        title: 'Registrar compra a crédito',
        fields: [
          clientId,
          number('productId', 'ID del producto'),
          number('quantity', 'Cantidad', 0.001, 0.001),
          select('modality', 'Modalidad', [
            ['INSTALLMENTS', 'Cuotas'],
            ['END_OF_MONTH', 'Fin de mes'],
          ]),
          {
            ...number('installmentCount', 'Número de cuotas', 1, 1, 60),
            when: ['modality', 'INSTALLMENTS'],
          },
        ],
        submit: (api, { productId, quantity, ...values }, base) =>
          api.post(base + '/purchases', { ...values, items: [{ productId, quantity }] }),
      },
    ],
  },
  {
    ...statementList,
    forms: [
      {
        title: 'Generar estado de cuenta',
        fields: [clientId],
        submit: (api, { clientId }, base) =>
          api.post(base + '/clients/' + clientId + '/statements'),
      },
    ],
  },
  {
    ...paymentList,
    forms: [
      {
        title: 'Registrar pago recibido',
        fields: [statementId, number('amount', 'Monto recibido', 0.01, 0.01)],
        submit: (api, { statementId, amount }, base) =>
          api.post(base + '/statements/' + statementId + '/payments', { amount }),
      },
    ],
  },
];
