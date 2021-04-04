import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const storeId = 579339103;
const publisherId = 47692065;

interface Brochure {
  id: string
  validFrom: Date
  title: string
}

interface FamilaResponse {
  data: FamilaData
}

interface FamilaData {
  page?: PageObject
  content?: Array<BrochureDeal>
  brochures?: Array<Brochure>
}

interface PageObject {
  totalPages: number
}

interface FamilaDeal {
  type: string
  minAmount: number
}

interface Product {
  description: Array<string>
  name: string
}

interface BrochureDeal {
  deals: Array<FamilaDeal>
  products: Array<Product>
  description?: string
  dealPrice: Number
  image: string
}

async function getBrochures(): Promise<string> {
  const url = `https://www.bonialserviceswidget.de/de/stores/${storeId}/brochures?storeId=${storeId}&publisherId=${publisherId}&limit=100&hasOffers=true`;
  const response: FamilaResponse = await axios.get(url);
  let brochureIds = '';
  response?.data?.brochures?.forEach((brochure: Brochure) => {
    if (brochure.title !== 'Sonderangebote') {
      brochureIds += `${brochure.id},`;
    }
  });
  return brochureIds;
}

export async function getDeals(): Promise<Deal[]> {
  try {
    const brochureIds = await getBrochures();
    const deals: Deal[] = [];
    let page = 0;

    let totalPages = 1;
    do {
      const url = `
      https://www.bonialserviceswidget.de/de/personalised/offers?storeIds=${storeId}&page=${page}&size=185&brochureIds=${brochureIds}&sort=&publisherId=${publisherId}&bonialAccountId=undefined
      `;
      const response: FamilaResponse = await axios.get(url);
      totalPages = response?.data?.page?.totalPages ?? 0;
      page += 1;
      response?.data?.content?.forEach((deal: BrochureDeal) => {
        const dealPrice: number = deal.deals[0].minAmount;
        const regularPrice: number = deal.deals[1]?.minAmount;
        deals.push({
          dealId: uuidv4(),
          shop: 'famila',
          name: deal.products[0].name,
          dealPrice,
          regularPrice,
          description: deal.products[0].description[0],
          imageUrl: deal.image,
          discount: Number(dealPrice / regularPrice).toFixed(2),
        });
      });
    } while (totalPages > page);
    return deals;
  } catch (error) {
    throw new Error(error);
  }
}
