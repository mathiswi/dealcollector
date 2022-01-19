export function extractRegularPrice(string: string | undefined | null): number | undefined {
  if (typeof string === 'undefined' || string === null)
    return undefined;
  /*
      If price is  UVP 0.99
    */
  if (string.includes(' ')) {
    return Number(string.split(' ')[1]);
  }
  return Number(string);
}
