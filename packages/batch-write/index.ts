import {
  DocumentClient, WriteRequests, BatchWriteItemOutput,
  StringAttributeValue, ItemList, PutItemInputAttributeMap, AttributeMap,
} from 'aws-sdk/clients/dynamodb';

const db: DocumentClient = new DocumentClient({ region: 'eu-central-1' });

const oneWeek = 60 * 60 * 24 * 7;

interface BatchWriteInput {
  data: ItemList | Deal[]
  mode?: string
  tableName?: string
  primaryKey?: StringAttributeValue
  expireNextWeek?: boolean
}

async function batchWrite({
  data, mode = 'put', tableName = 'currentDeals', primaryKey = 'dealId', expireNextWeek = true,
}: BatchWriteInput): Promise<unknown> {
  try {
    if (typeof data === 'undefined' || data.length < 1) {
      throw Error('Batch Write: No data available');
    }
    console.log(`${data?.length} Items Batch ${mode}`);
    const batches: Array<WriteRequests> = [];
    let currentBatch: WriteRequests = [];
    // @ts-ignore
    data.forEach((element, index) => {
      if (index % 25 === 0 && index > 0) {
        batches.push(currentBatch);
        currentBatch = [];
      }
      const Item: Deal | AttributeMap = { ...element };
      if (expireNextWeek) {
        const expirationTime = Math.round(Date.now() / 1000) + oneWeek;
        Item.expirationTime = expirationTime;
      }
      if (mode === 'put') {
        currentBatch.push({
          PutRequest: {
            Item: Item as PutItemInputAttributeMap,
          },
        });
      } else if (mode === 'delete') {
        currentBatch.push({
          DeleteRequest: {
            Key: {
              // @ts-ignore
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
      try {
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
      } catch (err) {
        console.log(batch);
        console.log(err);
      }
    }));
    return 'Success';
  } catch (err) {
    throw Error(err);
  }
}

export default batchWrite;
