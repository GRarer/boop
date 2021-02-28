// based on ordinalJS (https://www.npmjs.com/package/ordinal)
// re-implemented to be more efficient and avoid using CommonJS
export function ordinal(n: number): string {
  if (! Number.isInteger(n)) {
    return `${n}th`;
  }
  let indicator: string;
  const cent = n % 100;
  if (cent >= 10 && cent <= 20) {
    indicator = 'th';
  } else {
    const dec = n % 10;
    if (dec === 1) {
      indicator = 'st';
    } else if (dec === 2) {
      indicator = 'nd';
    } else if (dec === 3) {
      indicator = 'rd';
    } else {
      indicator = 'th';
    }
  }

  return `${n}${indicator}`;
}
