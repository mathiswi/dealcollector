import * as AWS from 'aws-sdk';
import { DocumentClient, Key } from 'aws-sdk/clients/dynamodb';

const db = new AWS.DynamoDB.DocumentClient({ region: 'eu-central-1' });

// TODO: Fix Typescript Errors

async function scanAll(params: DocumentClient.ScanInput): Promise<DocumentClient.ScanOutput> {
  let lastEvaluatedKey: Key | undefined | string = 'placeholder'; 
  const itemsAll: Array<DocumentClient.ScanOutput> = [];
  while (lastEvaluatedKey) {
    const data: DocumentClient.ScanOutput = await db.scan(params).promise();
    // @ts-ignore
    itemsAll.push(...data.Items);
    lastEvaluatedKey = data.LastEvaluatedKey;
    if (lastEvaluatedKey) {
      // eslint-disable-next-line no-param-reassign
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
  }
  // @ts-ignore
  return itemsAll;
}

export default scanAll;
