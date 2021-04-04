import { DocumentClient, ScanOutput } from 'aws-sdk/clients/dynamodb';
import scanAll from 'scan-all';
import batchWrite from 'batch-write';

export async function handler(): Promise<any> {
  try {
    const currentTable = 'currentDeals';
    const date = new Date().toISOString().split('T')[0];
    const newTable = `${date}_deals`;

    const params: DocumentClient.ScanInput = {
      TableName: currentTable,
    };
    const data: ScanOutput = await scanAll(params);
    await batchWrite(data, 'put', newTable);
    await batchWrite(data, 'delete', currentTable);
  } catch (err) {
    console.log(err);
  }
}
