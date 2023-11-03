import { optionalString, requiredNumber, requiredString } from '@/lib/utils/yup-utils';

/**
 * This inteface will be combined with the FirestoreDocument interface
 * in the consuming project which will also add 'id', 'createdAt', 'updatedAt'
 */

export interface FedBillRead {
  billNumber: string;
  billType: string;
  congress: string;
  chatGPTUpdatedAt?: string;
  congressUpdatedAt?: string;
  billCategoryUpdatedAt?: string;
  billSummaryUpdatedAt?: string;
  chatGPTData?: string;
  congressBill: string;
  congressBillText: string;
  billCategory?: string;
  billSummary?: string;
}

export interface FedBillWrite extends FedBillRead {}

const FIELDS = {
  billNumber: 'billNumber',
  billType: 'billType',
  congress: 'congress',
  chatGPTUpdatedAt: 'chatGPTUpdatedAt',
  congressUpdatedAt: 'congressUpdatedAt',
  billCategoryUpdatedAt: 'billCategoryUpdatedAt',
  billSummaryUpdatedAt: 'billSummaryUpdatedAt',
  chatGPTData: 'chatGPTData',
  congressBill: 'congressBill',
  congressBillText: 'congressBillText',
  billCategory: 'billCategory',
  billSummary: 'billSummary',
};

/**
 * The name of the collection for this model in Firestore
 */
const COLLECTION = 'fed_bills';

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
  [FIELDS.billNumber]: requiredString(),
  [FIELDS.billType]: requiredString(),
  [FIELDS.congress]: requiredString(),
  [FIELDS.chatGPTUpdatedAt]: requiredNumber().default(0),
  [FIELDS.congressUpdatedAt]: requiredNumber().default(0),
  [FIELDS.billCategoryUpdatedAt]: requiredNumber().default(0),
  [FIELDS.billSummaryUpdatedAt]: requiredNumber().default(0),
  [FIELDS.chatGPTData]: optionalString().default(''),
  [FIELDS.congressBill]: optionalString().default(''),
  [FIELDS.congressBillText]: optionalString().default(''),
  [FIELDS.billCategory]: optionalString().default(''),
  [FIELDS.billSummary]: optionalString().default(''),
};

export const fedBillsSchema = {
  FIELDS,
  COLLECTION,
  SUBCOLLECTIONS,
  IS_SUBCOLLECTION,
  SCHEMA,
  OTHER_DATE_FIELDS,
};
