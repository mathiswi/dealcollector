import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

const dynamoDB = new AWS.DynamoDB({ region: 'eu-central-1' });

export async function handler(): Promise<any> {
  try {
    const date = new Date().toISOString().split('T')[0];
    const newTable = `${date}_deals`;

    const newTableParams: DocumentClient.CreateTableInput = {
      TableName: newTable,
      AttributeDefinitions: [
        {
          AttributeName: 'dealId',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'dealId',
          KeyType: 'HASH',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    };

    const tableRes = await dynamoDB.createTable(newTableParams).promise();
    console.log(tableRes);
    return 'success';
  } catch (err) {
    console.log(err, err.stack);
    return 'failure';
  }
}
