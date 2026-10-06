/**
 * Shared dynamic date utility for CRM system
 * Ensures consistent date references across backend and frontend.
 */

export function getSystemDateStrings() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const tom = new Date(now);
  tom.setDate(tom.getDate() + 1);
  const tomYear = tom.getFullYear();
  const tomMonth = String(tom.getMonth() + 1).padStart(2, '0');
  const tomDay = String(tom.getDate()).padStart(2, '0');
  const tomorrowStr = `${tomYear}-${tomMonth}-${tomDay}`;

  const week = new Date(now);
  week.setDate(week.getDate() + 7);
  const weekYear = week.getFullYear();
  const weekMonth = String(week.getMonth() + 1).padStart(2, '0');
  const weekDay = String(week.getDate()).padStart(2, '0');
  const nextWeekStr = `${weekYear}-${weekMonth}-${weekDay}`;

  return { todayStr, tomorrowStr, nextWeekStr };
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
