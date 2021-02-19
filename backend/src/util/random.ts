export function chooseRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
