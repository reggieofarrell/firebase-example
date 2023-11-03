import { GenericObject } from './global';

export type DynamoKeys = {
  [k: string]: { S: string } | { N: string };
};

export type DynamoOptions = {
  table: string;
  keys: GenericObject;
  projection?: string;
  size?: number;
};
