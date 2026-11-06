export function nextPayableIndex(schedule, receipts) {
  return schedule.findIndex(
    (row, index) =>
      row.payment > 0 && !receipts.some((receipt) => receipt.installment === index + 1),
  );
}
export function recordInstallment(schedule, receipts, index, details) {
  if (index < 0 || index !== nextPayableIndex(schedule, receipts))
    throw new Error('Esta cuota ya fue pagada o no es la siguiente pendiente.');
  const amount = schedule[index].payment;
  const total = schedule.reduce((sum, row) => sum + row.payment, 0);
  const paid = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  return {
    ...details,
    installment: index + 1,
    amount,
    remaining: Math.max(0, total - paid - amount),
  };
}
