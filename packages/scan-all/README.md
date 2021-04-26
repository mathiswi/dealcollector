# `scan-all`

Returns all items in a given DynamoDB Table with the possibility of filtering the the output.

## Usage

```
const scanAll = require('scan-all');

const params: DocumentClient.ScanInput = {
  TableName: $tableName,
  FilterExpression: 'shop = :shop',
  ExpressionAttributeValues: {
    ':shop': $requestedShop,
  },
};
const res: DocumentClient.ScanOutput = await scanAll(params);
```
