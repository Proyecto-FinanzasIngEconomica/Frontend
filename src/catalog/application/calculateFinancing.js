export function calculateFinancing({
  principal,
  annualRate,
  rateType,
  months,
  frequency,
  amortization,
  grace,
  gracePeriods,
}) {
  const interval = { monthly: 1, bimonthly: 2, quarterly: 3 }[frequency];
  const periods = months / interval;
  const skipped = grace === 'none' ? 0 : gracePeriods;
  if (
    ![principal, annualRate, months, gracePeriods].every(Number.isFinite) ||
    principal <= 0 ||
    annualRate < 0 ||
    !interval ||
    !Number.isInteger(periods) ||
    periods < 1 ||
    !Number.isInteger(skipped) ||
    skipped < 0 ||
    skipped >= periods
  )
    throw new Error(
      'El plazo debe coincidir con la frecuencia de pago y superar los períodos de gracia.',
    );
  const rate =
    rateType === 'effective'
      ? Math.expm1((Math.log1p(annualRate / 100) * interval) / 12)
      : ((annualRate / 100) * interval) / 12;
  let balance = principal;
  let total = 0;
  const payments = [];
  const schedule = [];
  for (let index = 0; index < skipped; index++) {
    const opening = balance;
    const interest = balance * rate;
    if (grace === 'total') balance += interest;
    const payment = grace === 'partial' ? interest : 0;
    payments.push(payment);
    schedule.push({
      opening,
      interest,
      amortization: payment - interest,
      payment,
      closing: balance,
      grace: true,
    });
    total += payment;
  }
  const remaining = periods - skipped;
  const fixed =
    rate === 0
      ? balance / remaining
      : (balance * rate) / -Math.expm1(-remaining * Math.log1p(rate));
  const capital = balance / remaining;
  for (let index = 0; index < remaining; index++) {
    const opening = balance;
    const interest = balance * rate;
    const amortized =
      index === remaining - 1 ? balance : amortization === 'german' ? capital : fixed - interest;
    const payment = amortized + interest;
    balance -= amortized;
    payments.push(payment);
    schedule.push({
      opening,
      interest,
      amortization: amortized,
      payment,
      closing: balance,
      grace: false,
    });
    total += payment;
  }
  return {
    payment: payments[skipped],
    lastPayment: payments.at(-1),
    total,
    interest: total - principal,
    periods,
    rate,
    interval,
    schedule,
  };
}
