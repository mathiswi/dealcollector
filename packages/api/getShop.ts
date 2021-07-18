import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import scanAll from 'scan-all';

export async function handler(event: any = {}): Promise<any> {
  const requestedShop: string = event.pathParameters.shop;
  const table = 'currentDeals';
  const timestampNow = Math.round(Date.now() / 1000);

  const params: DocumentClient.ScanInput = {
    TableName: table,
    FilterExpression: 'shop = :shop AND expirationTime > :timestampNow',
    ExpressionAttributeValues: {
      ':shop': requestedShop,
      ':timestampNow': timestampNow,

    },
  };

  const res = await scanAll(params);
  return {
    statusCode: 200,
    body: JSON.stringify(res),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  };
}
