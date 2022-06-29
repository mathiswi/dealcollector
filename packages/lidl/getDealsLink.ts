import { JSDOM } from 'jsdom';
import axios from 'axios';


export async function getDealsLink(): Promise<string> {
  const url: string = 'https://www.lidl.de/';
  const res = await axios.get(url);
  const dom: JSDOM = new JSDOM(res.data);
  const dealLinkElement = dom.window.document.querySelector('[data-ga-label="Filial-Angebote"') as HTMLAnchorElement;
  return dealLinkElement.href;
}
