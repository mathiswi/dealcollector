import axios from 'axios';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

function getValidFromWeekDay(link: string): number {
  const part = link.split('/')[4];
  const dateParts = part.split('-');
  const month = dateParts.slice(-1)[0];
  const day = dateParts.slice(-2)[0];
  const date = new Date();

  date.setMonth(Number(month) - 1);
  date.setDate(Number(day));
  date.setHours(12, 0, 0, 0);
  return date.getDay();
}

function extractRegularPrice(node: Element | null): number | undefined {
  if (node?.textContent?.includes('%') || node === null) return undefined;
  return Number(node?.textContent?.replace((/ {2}|\r\n\t\s-|-|\t|\n|\r|\s/gm), ''));
}

function extractDealPrice(node: Element | null): number | null {
  node?.querySelectorAll('span,sup').forEach((element) => element.remove());
  if (node?.textContent?.includes('%')) return null;
  return Number(node?.textContent?.replace((/ {2}|\r\n\t\s-|-|\t|\n|\r|\s/gm), ''));
}

function extractDiscount(node: Element | null) : string | null | undefined {
  node?.querySelectorAll('sup').forEach((element) => element.remove());
  return node?.textContent?.replace((/ {2}|\r\n\t|\t|\n|\r|/gm), '');
}

function changeBrTagToNewLine(str: string | null | undefined): string | null | undefined {
  return str?.replace(/<br\s*\/?>/mg, '\n');
}

export async function scrapeSite(dealSite: string): Promise<Deal[]> {
  try {
    const validFrom = getValidFromWeekDay(dealSite);
    const res = await axios.get(dealSite);
    const dom = new JSDOM(res.data);

    const deals: Deal[] = [];

    // Offers up top
    const topOffers = [...dom.window.document.querySelectorAll('.product-frische-tag')];
    await Promise.all(topOffers.map(async (offer: Element) => {
      const productDiscount = offer?.querySelector('p.yellow-tag')?.textContent;
      let discount = productDiscount;
      /*
        Offers with "tagesaktuell" have the discount in the price tag
      */
      if (productDiscount?.includes('tagesaktuell')) {
        discount = extractDiscount(offer.querySelector('.red-price-tag'));
      }

      if (!productDiscount?.includes('%')) {
        discount = undefined;
      }

      const imageUrl = offer.querySelector<HTMLImageElement>('.product-image > img')?.src as string;

      const name = offer.querySelector<HTMLHeadingElement>('.description > h1')?.textContent!;
      const description = changeBrTagToNewLine(offer.querySelector<HTMLParagraphElement>('.description > p')?.innerHTML);

      const regularPrice = extractRegularPrice(offer.querySelector('.old-price'));
      const dealPrice = extractDealPrice(offer.querySelector('.red-price-tag'))!;

      deals.push({
        dealId: uuidv4(),
        shop: 'lidl',
        name,
        description,
        imageUrl,
        dealPrice,
        regularPrice,
        validFrom,
        discount,
      });
    }));

    // Offers at the bottom of the page
    const bottomOffers = [...dom.window.document.querySelectorAll('.product-grid__item ')];
    await Promise.all(bottomOffers.map(async (offer: Element) => {
      if (!offer.querySelector('.desc-height')) return;

      const imageUrl = offer.querySelector('img')?.src as string;
      const name = offer.querySelector('.desc-height > strong')?.textContent as string;
      const descriptions: NodeList = offer.querySelectorAll('.desc-height > .small')!;
      let description = '';
      descriptions.forEach((item) => {
        if (item.textContent) description += `${item.textContent} `;
      });

      const discount = offer.querySelector('.pricelabel__action-text')?.textContent;
      const regPriceText = offer.querySelector('#oldPriceId')?.textContent;

      const regularPrice = regPriceText ? Number(regPriceText) : undefined;

      const basePrice = offer.querySelector('.pricelabel__baseprice')?.textContent?.replace((/ {2}|\r\n\t|\t|\n|\r/gm), '');

      let dealPrice;
      if (!offer.querySelector('.pricelabel__decimal-behind')) {
        const integerPrice = Number(offer.querySelector('.pricelabel__integer')?.textContent);
        const decimalPrice = Number(offer.querySelector('.pricelabel__decimal-superscript')?.textContent);
        dealPrice = Number(`${integerPrice}.${decimalPrice}`);
      } else {
        const decimalPrice = Number(offer.querySelector('.pricelabel__decimal-behind')?.textContent);
        dealPrice = Number(`0.${decimalPrice}`);
      }
      deals.push({
        dealId: uuidv4(),
        shop: 'lidl',
        name,
        description,
        imageUrl,
        discount,
        regularPrice,
        basePrice,
        dealPrice,
        validFrom,
      });
    }));
    return deals;
  } catch (err) {
    console.log(err);
    throw Error(err);
  }
}
