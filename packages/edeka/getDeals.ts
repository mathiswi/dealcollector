import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface EdekaDeal {
  titel: string
  beschreibung: string
  preis: number
  basicPrice: string
  // eslint-disable-next-line camelcase
  bild_app: string
  warengruppe: string
  nachlass: string
}

interface EdekaData {
  docs: Array<EdekaDeal>
}

interface EdekaResponse {
  data: EdekaData
}

export async function getDeals(): Promise<Deal[]> {
  try {
    const url = 'https://www.edeka.de/eh/service/eh/offers?marketId=691397&limit=100000';
    const res: EdekaResponse = await axios.get(url);
    const deals: Deal[] = [];
    res.data.docs.forEach((deal: EdekaDeal) => {
      deals.push({
        dealId: uuidv4(),
        shop: 'edeka',
        name: deal.titel,
        description: deal.beschreibung,
        dealPrice: deal.preis,
        imageUrl: deal.bild_app,
        basePrice: deal.basicPrice,
        discount: deal.nachlass,
        category: deal.warengruppe,
      });
    });
    return deals;
  } catch (err: any) {
    throw Error(err);
  }
}
