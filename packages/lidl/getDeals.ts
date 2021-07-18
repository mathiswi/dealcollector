import { JSDOM } from 'jsdom';
import axios from 'axios';
import { scrapeSite } from './scrapeSite';

export async function getDeals(): Promise<Deal[]> {
  try {
    const url: string = 'https://www.lidl.de/de/filial-angebote';
    const res: ScrapeResponse = await axios.get(url);

    const dom: JSDOM = new JSDOM(res.data);
    const links: Array<string> = [];
    // TODO: Links korrekt abgreifen, Lidl hat Navigation angepasst
    const navLinks: any = dom.window.document.querySelectorAll('.ATheHeroStage__OfferAnchor');

    Object.values(navLinks).forEach((link: any) => {
      if (link.href.includes('frische') || link.href.includes('angebote') || link.href.includes('testergebnisse') || link.href.includes('lidl-plus')) return;
      links.push(link.href);
    });

    let deals: Deal[] = [];
    await Promise.all(links.map(
      async (dealSite) => {
        const newDeals: Deal[] = await scrapeSite(dealSite);
        deals = [...deals, ...newDeals];
      },
    ));
    return deals;
  } catch (err) {
    throw Error(err);
  }
}
