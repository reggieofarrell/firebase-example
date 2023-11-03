import { optionalNumber, optionalString, requiredString } from '@/lib/utils/yup-utils';

/**
 * This inteface will be combined with the FirestoreDocument interface
 * in the consuming project which will also add 'id', 'createdAt', 'updatedAt'
 */

export interface StateBillRead {
  state: string;
  billCategory?: string;
  billSummary?: string;
  billCategoryUpdatedAt?: number;
  billSummaryUpdatedAt?: number;
  billNumber: string;
  billText: string;
  data: string;
}

export interface StateBillWrite extends StateBillRead {}

const FIELDS = {
  state: 'state',
  billCategory: 'billCategory',
  billSummary: 'billSummary',
  billCategoryUpdatedAt: 'billCategoryUpdatedAt',
  billSummaryUpdatedAt: 'billSummaryUpdatedAt',
  billNumber: 'billNumber',
  billText: 'billText',
  data: 'data',
};

/**
 * The name of the collection for this model in Firestore
 */
const COLLECTION = 'state_bills';

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
  [FIELDS.state]: requiredString(),
  [FIELDS.billCategory]: requiredString(),
  [FIELDS.billSummary]: optionalString().default(''),
  [FIELDS.billCategoryUpdatedAt]: optionalNumber().default(0),
  [FIELDS.billSummaryUpdatedAt]: optionalNumber().default(0),
  [FIELDS.billNumber]: requiredString(),
  [FIELDS.billText]: requiredString(),
  [FIELDS.data]: requiredString(),
};

export const stateBillsSchema = {
  FIELDS,
  COLLECTION,
  SUBCOLLECTIONS,
  IS_SUBCOLLECTION,
  SCHEMA,
  OTHER_DATE_FIELDS,
};
