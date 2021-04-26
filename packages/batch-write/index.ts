import {
  DocumentClient, WriteRequests, BatchWriteItemOutput, StringAttributeValue, ItemList,
} from 'aws-sdk/clients/dynamodb';

const db: DocumentClient = new DocumentClient({ region: 'eu-central-1' });

interface BatchWriteInput {
  data: ItemList
  mode?: string
  tableName?: string
  primaryKey?: StringAttributeValue
}

async function batchWrite({ data, mode = 'put', tableName = 'currentDeals', primaryKey = 'dealId' } : BatchWriteInput): Promise<unknown> {  try {
    console.log(tableName);
    if (typeof data === 'undefined' || data.length < 1) {
      throw Error('Batch Write: No data available')
    }
    console.log(`${data?.length} Items Batch ${mode}`);
    const batches: Array<WriteRequests> = [];
    let currentBatch: WriteRequests = [];
    data.forEach((element, index) => {
      if (index % 25 === 0 && index > 0) {
        batches.push(currentBatch);
        currentBatch = [];
      }
      if (mode === 'put') {
        currentBatch.push({
          PutRequest: {
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
