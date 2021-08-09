import batchWrite from 'batch-write';
import { getDeals } from './getDeals';

export const handler = async (saveToDb: Boolean = true): Promise<any> => {
  try {
    const deals = await getDeals();
    if (saveToDb) {
      await batchWrite({ data: deals });
    }
    console.log(`Saved ${deals.length} Combi-Deals to DynamoDB`);
  } catch (err) {
    console.log(err);
  }
};
