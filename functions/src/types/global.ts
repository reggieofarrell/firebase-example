export type GenericObject = {
  [x: string]: any;
};

export type StringMap = {
  [x: string]: string;
};

export type DynamoKeys = {
  [k: string]: { S: string } | { N: string };
};

export type DynamoOptions = {
  table: string;
  keys: GenericObject;
  projection?: string;
  size?: number;
};

export type StaticString = Readonly<string>;
