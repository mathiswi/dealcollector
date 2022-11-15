# `batch-write`

Performs either a batch-`put` or -`delete` operation with an array of items on a given table.


## Usage

```
const batchWrite = require('batch-write');

await batchWrite($data, 'put', $tableName, $primaryKey);

```
