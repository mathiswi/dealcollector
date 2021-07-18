import axios from 'axios';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

function capitalizeFirstLetters(string: string): string {
  const words = string.split(' ');
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  let result = '';
  capitalizedWords.forEach((word) => {
    result += `${word} `;
  });
  result += ' ';
  return result;
}

function getImageUrl(img: HTMLImageElement): string {
  const srcsets: Array<string> = img?.dataset?.srcset?.split(',') || [];
  if (srcsets.length < 1) return '';
  const tempString: string = srcsets.slice(-1)[0];
  const imgUrl: string = tempString.split(' ')[1];
  return (`https://www.aldi-nord.de/${imgUrl}`);
}

function getValidFromFromHref(href: string): number {
  if (href.includes('aktion') === false || href.includes('archive')) return 0;
  const part = href.split('/')[2];
  const day = part.split('-')[2];
  const month = part.split('-')[3];
  const date = new Date();
  date.setMonth(Number(month) - 1);
  date.setDate(Number(day));
  date.setHours(12, 0, 0, 0);
  return date.getDay();
}

function extractRegularPrice(string: string | undefined | null): number | undefined {
  if (typeof string === 'undefined' || string === null) return undefined;
  /*
      If price is  UVP 0.99
    */
  if (string.includes(' ')) {
    return Number(string.split(' ')[1]);
  }
  return Number(string);
}

export async function scrapeSite(dealSite: string): Promise<Deal[]> {
  const { data } = await axios.get(dealSite);
  const dom = new JSDOM(data);
  const dealTiles = [...dom.window.document.querySelectorAll('.mod-article-tile')];
  const deals: Deal[] = [];
  await Promise.all(dealTiles.map(async (dealTile: Element) => {
    let delivery = false;
    const classes: string[] = [].slice.apply(dealTile.classList);
    classes.forEach((element) => {
      if (element.includes('liefert')) {
        delivery = true;
      }
    });
    if (delivery) return;

    const validFrom = getValidFromFromHref(dealTile.querySelector<HTMLAnchorElement>('a')?.href as string);
    const nameRaw = dealTile.querySelector('.mod-article-tile__title')?.textContent?.trim().toLocaleLowerCase()!;
    const name = capitalizeFirstLetters(nameRaw?.replace((/ {2}|\r\n\t|\t|\n|\r/gm), ''));

    const description = dealTile.querySelector('.mod-article-tile__info')?.querySelector('p')?.textContent;

    const priceString = dealTile.querySelector('.price__wrapper')?.textContent;
    const dealPrice: number | undefined = Number(priceString?.replace((/ {2}|\r\n\t\*|\*|\t|\n|\r/gm), ''));
    const regularPriceText = dealTile.querySelector('.price__previous')?.textContent;
    const regularPrice = extractRegularPrice(regularPriceText);

    const unit = dealTile.querySelector('.price__unit')?.textContent?.trimLeft();
    const basePrice = dealTile.querySelector('.price__base')?.textContent?.trimLeft();
    let discount = dealTile.querySelector('.price__previous-percentage')?.textContent;
    if (discount?.includes('XXL')) discount = undefined;

    const img = dealTile.querySelector('img')!;
    const imageUrl: string = getImageUrl(img);
    deals.push({
      dealId: uuidv4(),
      shop: 'aldi',
      name,
      description,
      dealPrice,
      regularPrice,
      discount,
      imageUrl,
      validFrom,
      unit,
      basePrice,
    });
  }));
  return deals;
}
