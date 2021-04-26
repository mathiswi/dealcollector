import batchWrite from 'batch-write';
import { getDeals } from './getDeals';

export const handler = async (): Promise<any> => {
  try {
    const deals = await getDeals();
    await batchWrite({ data: deals });
    console.log(`Saved ${deals.length} Aldi-Deals to DynamoDB`);
  } catch (err) {
    console.error(err);
  }
};
