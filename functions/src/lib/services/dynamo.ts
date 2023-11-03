import {
  BatchGetItemCommand,
  DescribeTableCommand,
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { DynamoKeys, DynamoOptions } from '@/types/dynamo-db';
import { GenericObject, StringMap } from '@/types/global';
import { logData } from '../utils/log';

const { AWS_REGION, AWS_KEY, AWS_SECRET } = process.env;

const client = new DynamoDBClient({
  region: AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: AWS_KEY || '',
    secretAccessKey: AWS_SECRET || '',
  },
});

const mapObjectToKeys = (parameters: GenericObject): DynamoKeys =>
  Object.fromEntries(
    Object.entries(parameters).map(([k, v]) => [
      k,
      typeof v === 'number' ? { N: String(v) } : { S: v },
    ]),
  );

const mapKeysToObject = (keys: DynamoKeys): StringMap =>
  Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, 'S' in v ? v.S : v.N]));

export const getCount = async ({ table: TableName }: DynamoOptions) => {
  try {
    const describeTableCommand = new DescribeTableCommand({ TableName });
    const response = await client.send(describeTableCommand);
    return response.Table?.ItemCount ?? 0;
  } catch (error) {
    console.error(`Error retrieving table item count: ${error}`);
    throw error;
  }
};

export const getItem = async ({
  table: TableName,
  keys,
}: DynamoOptions): Promise<StringMap | undefined> => {
  try {
    const data = await client.send(new GetItemCommand({ TableName, Key: mapObjectToKeys(keys) }));
    return data.Item ? mapKeysToObject(data.Item as DynamoKeys) : undefined;
  } catch (error: unknown) {
    console.error(`Error retrieving data from Dynamo: ${parseError(error)}`);
    throw error;
  }
};

export const getItems = async <T>({ table: TableName, keys }: DynamoOptions): Promise<T[]> => {
  const keysArray: DynamoKeys[] = [];

  const parseKeys = (tableKey: string): DynamoKeys => {
    const keyObject: DynamoKeys = {};
    for (const [key, value] of Object.entries(tableKey)) {
      keyObject[key] = mapObjectToKeys({ [key]: value })[key];
    }
    return keyObject;
  };

  try {
    if (Array.isArray(keys)) {
      for (const key of keys) {
        keysArray.push(parseKeys(key));
      }
    } else {
      for (const [key, values] of Object.entries(keys)) {
        for (const value of values.split(',').map((v: string) => v.trim())) {
          keysArray.push(mapObjectToKeys({ [key]: value }));
        }
      }
    }
    const data = await client.send(
      new BatchGetItemCommand({
        RequestItems: { [TableName]: { Keys: keysArray } },
      }),
    );
    const results: T[] = [];
    if (data.Responses && data.Responses[TableName]) {
      for (const item of data.Responses[TableName]) {
        results.push(mapKeysToObject(item as DynamoKeys) as T);
      }
    }
    return results;
  } catch (error: unknown) {
    console.error(`Error retrieving data from Dynamo: ${parseError(error)}`);
    throw error;
  }
};

export const getItemsFromKey = async ({
  table: TableName,
  keys,
  projection: ProjectionExpression,
  size: Limit = 100,
}: DynamoOptions): Promise<StringMap[]> => {
  try {
    const data = await client.send(
      new ScanCommand({
        TableName,
        ExclusiveStartKey: mapObjectToKeys(keys),
        Limit,
        ProjectionExpression,
      }),
    );
    if (data.Items && data.Items.length > 0) {
      return data.Items.map(item => mapKeysToObject(item as DynamoKeys));
    }
    return [];
  } catch (error: unknown) {
    console.error(`Error retrieving data from Dynamo: ${parseError(error)}`);
    throw error;
  }
};

export const getAllItems = async ({
  table: TableName,
  projection: ProjectionExpression,
}: DynamoOptions): Promise<StringMap[]> => {
  try {
    const items: StringMap[] = [];
    let ExclusiveStartKey = undefined;
    do {
      const data: ScanCommandOutput = await client.send(
        new ScanCommand({ TableName, ExclusiveStartKey, ProjectionExpression }),
      );
      if (data.Items && data.Items.length > 0) {
        const batchItems = data.Items.map(item => mapKeysToObject(item as DynamoKeys));
        items.push(...batchItems);
      }
      ExclusiveStartKey = data.LastEvaluatedKey;
    } while (ExclusiveStartKey);
    return items;
  } catch (error: unknown) {
    console.error(`Error retrieving data from Dynamo: ${parseError(error)}`);
    throw error;
  }
};

export const parseError = (error: unknown): string =>
  String(
    typeof error === 'object' && error !== null && 'message' in error
      ? error.message
      : JSON.stringify(error),
  );
