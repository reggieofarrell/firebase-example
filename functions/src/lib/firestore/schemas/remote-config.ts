import { requiredString } from '@/lib/utils/yup-utils';

/**
 * This inteface will be combined with the FirestoreDocument interface
 * in the consuming project which will also add 'id', 'createdAt', 'updatedAt'
 */

export interface RemoteConfigRead {
  value: string;
}

export interface RemoteConfigWrite extends RemoteConfigRead {}

const FIELDS = {
  value: 'value',
};

/**
 * The name of the collection for this model in Firestore
 */
const COLLECTION = 'remote_config';

/**
 * Any subcollections this model may have
 */
const SUBCOLLECTIONS: string[] = [];

/**
 * Whether or not this model is a subcollection
 */
const IS_SUBCOLLECTION = false;

/**
 * Keys of any other date fields aside from the standard 'createdAt' and 'updatedAt'
 */
const OTHER_DATE_FIELDS: string[] = [];

/**
 * Yup schema for this model
 */
const SCHEMA: Record<string, any> = {
  [FIELDS.value]: requiredString(),
};

export const remoteConfigSchema = {
  FIELDS,
  COLLECTION,
  SUBCOLLECTIONS,
  IS_SUBCOLLECTION,
  SCHEMA,
  OTHER_DATE_FIELDS,
};
