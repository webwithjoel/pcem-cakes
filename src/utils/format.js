export function formatNaira(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new TypeError('Naira amounts must be finite numbers.');
  }
  return `₦${new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatDate(date) {
  const [year, month, day] = String(date).split('-').map(Number);
  const parsedDate =
    Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day)
      ? new Date(year, month - 1, day)
      : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new RangeError(`Invalid date "${date}".`);
  }
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate);
}

export function dateAfterDays(days, fromDate = new Date()) {
  if (!Number.isInteger(days) || days < 0) {
    throw new RangeError('Lead time must be a non-negative whole number of days.');
  }
  const date = new Date(fromDate);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
