type DynamoDbJson =
  | { S: string }
  | { N: string }
  | { BOOL: boolean }
  | { M: { [key: string]: DynamoDbJson } }
  | { L: DynamoDbJson[] }
  | { NULL: null }
  | { SS: string[] }
  | { NS: string[] }
  | { BS: string[] };

export function dynamoDbJSONtoObject(dynamoDbJSON: { [key: string]: DynamoDbJson }): any {
  const transformObject = (obj: { [key: string]: DynamoDbJson }): any => {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
      const value = obj[key];
      result[key] = transformValue(value);
    }
    return result;
  };

  const transformValue = (value: DynamoDbJson): any => {
    if (typeof value !== 'object' || value === null) {
      return value;
    }

    const keys = Object.keys(value);
    if (keys.length !== 1) {
      return value;
    }

    const type = keys[0] as keyof DynamoDbJson;
    const typedValue = value[type];

    switch (type) {
      case 'S':
      case 'N':
        return typedValue;
      case 'BOOL':
        return typedValue;
      case 'M':
        return transformObject(typedValue);
      case 'L':
        // @ts-ignore
        return typedValue.map(transformValue);
      case 'NULL':
        return null;
      case 'SS':
      case 'NS':
      case 'BS':
        return typedValue;
      default:
        return value;
    }
  };

  return transformObject(dynamoDbJSON);
}
