/**
 * Start/end of a calendar day in server local timezone.
 * @param {string|Date|undefined} dateInput - YYYY-MM-DD string or Date; defaults to today
 */
const getDayBounds = (dateInput) => {
  let d;
  if (!dateInput) {
    d = new Date();
  } else if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, day] = dateInput.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(dateInput);
  }

  if (isNaN(d.getTime())) {
    return null;
  }

  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  const dateLabel = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;

  return { start, end, dateLabel };
};

module.exports = { getDayBounds };
