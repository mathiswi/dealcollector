import batchWrite from 'batch-write';
import { getDeals } from './getDeals';

export const handler = async () : Promise <any> => {
  try {
    const deals = await getDeals();
    await batchWrite(deals);
    console.log(`Saved ${deals.length} Lidl-Deals to DynamoDB`);
  } catch (err) {
    console.error(err);
  }
};
