import chromium from 'chrome-aws-lambda';
import playwright from 'playwright-core';

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

function cleanRegularPriceString(string: string) {
  return string.replaceAll('*', '');
}

export async function scrapeSite(dealSite: string): Promise<Deal[]> {
  try {
    const validFrom = getValidFromHref(dealSite);
    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('https://lidl.de' + dealSite);
    await page.click('text=Zustimmen');

    const data = await page.content();
    const dom = new JSDOM(data);
    await browser.close();

    const deals: Deal[] = [];

    const dealCards: NodeListOf<HTMLAnchorElement> = dom.window.document.querySelectorAll('a.grid-box__pdp-link');
    for (const offer of dealCards) {
      const imageUrl = offer.querySelector('img')?.src as string;
      const name = offer.querySelector('.grid-box__headline')?.textContent?.trim() as string;
      const detailPage = `https://lidl.de${offer.href}`;
      const description = offer.querySelector('.product-grid-box__desc')?.textContent as string;

      const discount = offer.querySelector('.m-price__label')?.textContent;
      const regularPriceString = offer.querySelector('.m-price__rrp')?.textContent;
      let regularPrice;
      if (regularPriceString) {
        regularPrice = Number(cleanRegularPriceString(regularPriceString));
      }
      const basePrice = offer.querySelector('.m-price__base')?.textContent?.trim() as string;

      const dealPriceText = offer.querySelector('.m-price__price')?.textContent as string;
      let dealPrice;
      if (typeof dealPriceText === 'undefined') {
        dealPrice = 0;
      } else {
        dealPrice = Number(dealPriceText);
        if (dealPriceText.includes('-')) {
          const decimalPrice = dealPriceText.split('.')[1];
          dealPrice = Number(`0.${decimalPrice}`);
        }
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
        detailPage,
      });
    };
    return deals;
  } catch (err: any) {
    console.log(err);
    throw Error(err);
  }
}
