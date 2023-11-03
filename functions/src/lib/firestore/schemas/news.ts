import { requiredNumber, requiredString } from '@/lib/utils/yup-utils';

/**
 * This inteface will be combined with the FirestoreDocument interface
 * in the consuming project which will also add 'id', 'createdAt', 'updatedAt'
 */

export interface NewsRead {
  topic: string;
  date: number;
  news: string;
}

export interface NewsWrite extends NewsRead {}

const FIELDS = {
  topic: 'topic',
  date: 'date',
  news: 'news',
};

/**
 * The name of the collection for this model in Firestore
 */
const COLLECTION = 'news';

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
  [FIELDS.topic]: requiredString().default(''),
  [FIELDS.date]: requiredNumber().default(0),
  [FIELDS.news]: requiredString().default(''),
};

export const newsSchema = {
  FIELDS,
  COLLECTION,
  SUBCOLLECTIONS,
  IS_SUBCOLLECTION,
  SCHEMA,
  OTHER_DATE_FIELDS,
};
