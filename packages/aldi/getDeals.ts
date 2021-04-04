import { scrapeSite } from './scrapeSite';

export async function getDeals(): Promise<Deal[]> {
  try {
    const url = 'https://www.aldi-nord.de/angebote.html?ftl-avail=Filiale&ftl-pty=Hygiene+%26+Kosmetik%2CLebensmittel';
    const deals = await scrapeSite(url);
    return deals;
  } catch (err) {
    throw Error(err);
  }
}
