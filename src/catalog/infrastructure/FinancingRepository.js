import { recordInstallment } from '../application/installmentPayments.js';

export class FinancingRepository {
  constructor(storage, userId) {
    this.storage = storage;
    this.key = `crediflow.financings.v1.${userId}`;
    if (!userId) throw new Error('Inicia sesión para acceder a tus financiamientos.');
  }
  list() {
    return JSON.parse(this.storage.getItem(this.key) || '[]');
  }
  save(records) {
    this.storage.setItem(this.key, JSON.stringify(records));
  }
  accept(record) {
    const records = this.list();
    const existing = records.find((item) => item.id === record.id);
    if (existing) return existing;
    const financing = { ...record, receipts: [], acceptedAt: new Date().toISOString() };
    this.save([...records, financing]);
    return financing;
  }
  pay(id, index, details) {
    const records = this.list();
    const financing = records.find((item) => item.id === id);
    if (!financing) throw new Error('No encontramos este financiamiento.');
    const receipt = recordInstallment(
      financing.result.schedule,
      financing.receipts,
      index,
      details,
    );
    financing.receipts.push(receipt);
    this.save(records);
    return financing.receipts;
  }
}
