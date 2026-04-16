function getAPIDateString(d: Date) {
  /* Fix date for API calls
   * `.toISOString()` returns:  YYYY-MM-DDTHH:mm:ss.sssZ
   * API needs ISO date like:   YYYY-MM-DDTHH:mmZ
   * */
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}Z`;
}

export function pad(num: number) {
  return `${num <= 9 ? '0' : ''}${num}`;
}

export function getDateFW24h(d: string) {
  const date = new Date(d);
  date.setDate(date.getDate() + 1);
  return getAPIDateString(date);
}

export function getDatePT24h(d: string) {
  const date = new Date(d);
  date.setDate(date.getDate() - 1);
  return getAPIDateString(date);
}

export function getNow() {
  const date = new Date();
  const min = date.getMinutes();
  const roundedDate = min >= 30 ? dateToHalfHour(date) : dateToHour(date);
  return getAPIDateString(roundedDate);
}

export function dateToHalfHour(date: Date) {
  date.setSeconds(0);
  date.setMinutes(30);
  return date;
}

export function dateToHour(date: Date) {
  date.setSeconds(0);
  date.setMinutes(0);
  return date;
}

export function hoursBetween(start: string, end: string) {
  const msHour = 3600000;
  return (Date.parse(end) - Date.parse(start)) / msHour;
}

export function getDateString(date: string) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  } as const;
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', options).format(d);
}

export function msUntilNextHalfHour(): number {
  const now = new Date();
  const ms = now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
  const halfHour = 30 * 60000;
  return halfHour - (ms % halfHour);
}
