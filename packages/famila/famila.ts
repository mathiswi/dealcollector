import batchWrite from 'batch-write';
import { getDeals } from './getDeals';

export const handler = async () : Promise <any> => {
  try {
    const deals: Deal[] = await getDeals();
    await batchWrite(deals);
    console.log(`Saved ${deals.length} Famila-Deals to DynamoDB`);
  } catch (err) {
    console.log(err);
  }
};
