export function getImageUrl(img: HTMLImageElement): string {
  const srcsets: Array<string> = img?.srcset?.split(',') || [];
  if (srcsets.length < 1)
    return '';
  const tempString: string = srcsets.slice(-4)[0];
  const imgUrl: string = tempString.split(' ')[1];
  return (`https://www.aldi-nord.de${imgUrl}`);
}
