import { JSDOM } from 'jsdom';
import axios from 'axios';
import { scrapeSite } from './scrapeSite';
import { getDealsLink } from './getDealsLink';

export async function getDeals(): Promise<Deal[]> {
  try {
    const dealsLink = await getDealsLink();
    const url: string = `https://www.lidl.de${dealsLink}`;
    const res = await axios.get(url);

    const dom: JSDOM = new JSDOM(res.data);
    const links: Array<string> = [];
    // TODO: Links korrekt abgreifen, Lidl hat Navigation angepasst
    const navLinks = dom.window.document.querySelectorAll('.ATheHeroStage__SliderTrack');
    const filialAngebote: HTMLDivElement = navLinks[0] as HTMLDivElement;

    const newLinks = filialAngebote.querySelectorAll('a');
    Object.values(newLinks).some((link: any) => {
      if (link.href.includes('coupons')) {
        return true;
      }
      links.push(link.href);
      return false;
    });

    let deals: Deal[] = [];
    await Promise.all(links.map(
      async (dealSite) => {
        const newDeals: Deal[] = await scrapeSite(dealSite);
        deals = [...deals, ...newDeals];
      },
    ));
    return deals;
  } catch (err: any) {
    throw Error(err);
  }
}
