import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import scanAll from 'scan-all';

export async function handler(): Promise<any> {
  const table = 'currentDeals';

  const params: DocumentClient.ScanInput = {
    TableName: table,
    // ProjectionExpression: 'basePrice, category, dealPrice, discount, description, imageUrl, #nm, shop, regularPrice, validFrom',
    // ExpressionAttributeNames: {
    //   '#nm': 'name',
    // },
  };

  const res: DocumentClient.ScanOutput = await scanAll(params);
  return {
    statusCode: 200,
    body: JSON.stringify(res),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  };
}
