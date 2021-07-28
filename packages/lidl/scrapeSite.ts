import axios from 'axios';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';

function getValidFromHref(href: string): number {
  const partOfLink = href.split('/')[2];
  if (partOfLink.includes('billiger')) {
    const weekDay: string = partOfLink.split('-')[1];
    switch (weekDay) {
      case 'montag':
        return 1;
      case 'dienstag':
        return 2;
      case 'mittwoch':
        return 3;
      case 'donnerstag':
        return 4;
      case 'wochenendlich':
        return 5;
      default:
        return 0;
    }
  } else {
    const month = partOfLink.split('-').slice(-1)[0];
    const dayOfMonth = partOfLink.split('-').slice(-2)[0];
    const date = new Date();
    date.setMonth(Number(month) - 1);
    date.setDate(Number(dayOfMonth));
    date.setHours(12, 0, 0, 0);
    return date.getDay();
  }
}

export async function scrapeSite(dealSite: string): Promise<Deal[]> {
  try {
    const validFrom = getValidFromHref(dealSite);
    const res = await axios.get(`https://lidl.de${dealSite}`);
    const dom = new JSDOM(res.data);

    const deals: Deal[] = [];

    // Offers at the bottom of the page
    const bottomOffers = [...dom.window.document.querySelectorAll('.product-grid-box') as NodeListOf<HTMLAnchorElement>];
    await Promise.all(bottomOffers.map(async (offer: HTMLAnchorElement) => {

      const imageUrl = offer.querySelector('img')?.src as string;
      const name = offer.querySelector('.product-grid-box__title')?.textContent?.trim() as string;
      const detailPage = `https://lidl.de${offer.href}`;
      const description = offer.querySelector('.product-grid-box__desc')?.textContent as string;

      const discount = offer.querySelector('.m-price__label')?.textContent;
      const regularPrice = offer.querySelector('.m-price__rrp')?.textContent ? Number(offer.querySelector('.m-price__rrp')?.textContent) : undefined;
      const basePrice = offer.querySelector('.m-price__base')?.textContent?.trim() as string;

      const dealPriceText = offer.querySelector('.m-price__price')?.textContent as string;
      let dealPrice = Number(dealPriceText);

      // bei Preisen unter 1€
      if (dealPriceText.includes('-')) {
        const decimalPrice = dealPriceText.split('.')[1];
        dealPrice = Number(`0.${decimalPrice}`);
      }

      if (name.includes('Wassermelone')) {
        console.log(dealPrice);
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
