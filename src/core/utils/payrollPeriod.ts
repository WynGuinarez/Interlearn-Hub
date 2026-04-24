export interface PayrollPeriod {
  start: string;
  end: string;
  label: string;
}

const toIso = (value: Date) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

export const getPayrollPeriod = (dateInput: Date | string): PayrollPeriod => {
  const date = typeof dateInput === 'string' ? parseIsoDate(dateInput) : new Date(dateInput);
  const day = date.getDate();

  if (day >= 11 && day <= 25) {
    const start = new Date(date.getFullYear(), date.getMonth(), 11);
    const end = new Date(date.getFullYear(), date.getMonth(), 25);
    const startIso = toIso(start);
    const endIso = toIso(end);
    return { start: startIso, end: endIso, label: `${startIso}_to_${endIso}` };
  }

  if (day >= 26) {
    const start = new Date(date.getFullYear(), date.getMonth(), 26);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 10);
    const startIso = toIso(start);
    const endIso = toIso(end);
    return { start: startIso, end: endIso, label: `${startIso}_to_${endIso}` };
  }

  const start = new Date(date.getFullYear(), date.getMonth() - 1, 26);
  const end = new Date(date.getFullYear(), date.getMonth(), 10);
  const startIso = toIso(start);
  const endIso = toIso(end);
  return { start: startIso, end: endIso, label: `${startIso}_to_${endIso}` };
};

export const getCurrentPayrollPeriod = () => getPayrollPeriod(new Date());

export const resolvePeriodLabel = (recordDate: string, explicitPeriodLabel?: string) => {
  if (explicitPeriodLabel) return explicitPeriodLabel;
  return getPayrollPeriod(recordDate).label;
};
