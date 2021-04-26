import { DocumentClient } from 'aws-sdk/clients/dynamodb';
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
    const res = await scanAll(params);
    console.log(res.length);
    await batchWrite({ data: res, mode: 'put', tableName: newTable });
    await batchWrite({ data: res, mode: 'delete', tableName: currentTable });
  } catch (err) {
    console.log(err);
  }
}
/*
async function batchWrite({data, mode: 'put', tableName: 'currentDeals', primaryKey: 'dealId'} : { data:  Array<unknown> | ScanOutput, mode: string, tableName: string, primaryKey: StringAttributeValue }): Promise<unknown> {

  async function batchWrite({data: Array<unknown> | ScanOutput, mode: string = 'put', tableName: string = 'currentDeals', primaryKey: StringAttributeValue = 'dealId'}): Promise<unknown> {

*/