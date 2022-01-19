export function getValidFromHref(href: string): number {
  if (href.includes('aktion') === false || href.includes('archive'))
    return 0;
  const part = href.split('/')[2];
  const day = part.split('-')[2];
  const month = part.split('-')[3];
  const date = new Date();
  date.setMonth(Number(month) - 1);
  date.setDate(Number(day));
  date.setHours(12, 0, 0, 0);
  return date.getDay();
}
