// returns true if the given date was on or before a certain number of years before now
export function minYearsAgo(date: Date, years: number): boolean {
  const datePlus: Date = new Date(date.getTime());
  datePlus.setUTCFullYear(datePlus.getUTCFullYear() + years);
  return datePlus.getTime() <= Date.now();
}
