import batchWrite from 'batch-write';
import { getDeals } from './getDeals';

export const handler = async (): Promise<any> => {
  try {
    const deals: Deal[] = await getDeals();
    console.log(deals.length);
    await batchWrite({ data: deals });
    console.log(`Saved ${deals.length} Combi-Deals to DynamoDB`);
  } catch (err) {
    console.log(err);
  }
};
