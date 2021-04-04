import {
  DocumentClient, WriteRequests, BatchWriteItemOutput, StringAttributeValue, ScanOutput,
} from 'aws-sdk/clients/dynamodb';

const db: DocumentClient = new DocumentClient({ region: 'eu-central-1' });

async function batchWrite(data: Array<unknown> | ScanOutput, mode: string = 'put', tableName: string = 'currentDeals', primaryKey: StringAttributeValue = 'dealId'): Promise<unknown> {
  try {
    // @ts-ignore
    console.log(`${data.length} Items Batch ${mode}`);
    const batches: Array<WriteRequests> = [];
    let currentBatch: WriteRequests = [];
    // @ts-ignore
    data.forEach((element, index) => {
      if (index % 25 === 0 && index > 0) {
        batches.push(currentBatch);
        currentBatch = [];
      }
      if (mode === 'put') {
        currentBatch.push({
          PutRequest: {
            // @ts-ignore
            Item: element,
          },
        });
      } else if (mode === 'delete') {
        currentBatch.push({
          DeleteRequest: {
            Key: {
              [`${primaryKey}`]: element[primaryKey],
            },
          },
        });
      }
    });
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    await Promise.all(batches.map(async (batch) => {
      let keepSending: Boolean = true;
      do {
        let batchParams: DocumentClient.BatchWriteItemInput = {
          RequestItems: {
            [`${tableName}`]: batch,
          },
        };
        // eslint-disable-next-line no-await-in-loop
        const batchRes: BatchWriteItemOutput = await db.batchWrite(batchParams).promise();
        // @ts-ignore
        if (Object.keys(batchRes.UnprocessedItems).length > 0) {
          // @ts-ignore
          batchParams = batchRes.UnprocessedItems[`${tableName}`];
        } else {
          keepSending = false;
        }
      } while (keepSending);
    }));
    return 'Success';
  } catch (err) {
    throw Error(err);
  }
}

export default batchWrite;
