# `batch-write`

Performs either a batch-`put` or -`delete` operation with an array of items on a given table.


| Parameter        | Default           |  Description |
| ------------- |:-------------:| -----:|
| data          |               | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

## Usage

```
const batchWrite = require('batch-write');

await batchWrite($data, 'put', $tableName, $primaryKey);

```
