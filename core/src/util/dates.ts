// utilities for working with dates and ISO 8601 representations of dates

// convert from a javascript date object to an ISO 8601 representation of the date (e.g. "2020-12-30")
export function toIsoDate(date: Date): string {
  const isoDateTime = date.toISOString();
  const timeIndex = isoDateTime.indexOf("T");
  if (timeIndex === -1) {
    throw `invalid date ${isoDateTime}`;
  }
  return isoDateTime.slice(0, timeIndex);
}
