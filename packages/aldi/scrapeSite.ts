import chromium from 'chrome-aws-lambda';
import playwright, { Page } from 'playwright-core';
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';
import { extractRegularPrice } from './extractRegularPrice';
import { getValidFromHref } from './getValidFromHref';
import { getImageUrl } from './getImageUrl';
import { capitalizeFirstLetters } from './capitalizeFirstLetters';


async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve(undefined);
        }
      }, 1);
    });
  });
}


export async function scrapeSite(dealSite: string): Promise<Deal[]> {
  const browser = await playwright.chromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(dealSite);
  await page.setViewportSize({
    width: 1200,
    height: 800
  });
  await autoScroll(page);
  await page.screenshot({
    path: 'yoursite.png',
    fullPage: true
  });
  const data = await page.content();
  const dom = new JSDOM(data);
  await browser.close();
  const dealTiles: NodeListOf<HTMLDivElement> = dom.window.document.querySelectorAll('div.mod-article-tile');
  const deals: Deal[] = [];

  for (let dealTile of dealTiles) {
    let delivery = false;
    const classes: string[] = [].slice.apply(dealTile.classList);
    classes.forEach((element) => {
      if (element.includes('liefert')) {
        delivery = true;
      }
    });
    if (delivery) continue;

    const validFrom = getValidFromHref(dealTile.querySelector<HTMLAnchorElement>('a')?.href as string);
    const nameRaw = dealTile.querySelector('.mod-article-tile__title')?.textContent?.trim().toLocaleLowerCase()!;
    const name = capitalizeFirstLetters(nameRaw?.replace((/ {2}|\r\n\t|\t|\n|\r/gm), ''));

    const description = dealTile.querySelector('.mod-article-tile__info')?.querySelector('p')?.textContent;
    const detailPage = `https://www.aldi-nord.de${dealTile.querySelector('a')?.href}`;

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
      detailPage,
    });
  };
  return deals;
}
