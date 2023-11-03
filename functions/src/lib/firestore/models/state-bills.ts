import { Firestore } from 'firebase-admin/firestore';
import {
  DEFAULT_FIRESTORE_SCHEMA,
  FirestoreDocument,
  FirestoreModel,
  DEFAULT_FIRESTORE_FIELDS,
} from './firestore';
import { StateBillRead, StateBillWrite, stateBillsSchema } from '../schemas/state-bill';

interface StateBillDocumentRead extends FirestoreDocument, StateBillRead {}
interface StateBillDocumentWrite extends FirestoreDocument, StateBillWrite {}

/**
 * Class for interacting with fedOfficialsSchema documents in Firestore
 */
export class StateBillModel extends FirestoreModel<StateBillDocumentRead, StateBillDocumentWrite> {
  collection = stateBillsSchema.COLLECTION;
  subcollections = stateBillsSchema.SUBCOLLECTIONS;
  isSubcollection = stateBillsSchema.IS_SUBCOLLECTION;
  fields = { ...stateBillsSchema.FIELDS, ...DEFAULT_FIRESTORE_FIELDS };
  otherDateFields = stateBillsSchema.OTHER_DATE_FIELDS;
  protected schemaDef = { ...stateBillsSchema.SCHEMA, ...DEFAULT_FIRESTORE_SCHEMA };

  constructor(firestore: Firestore) {
    super(firestore, stateBillsSchema.COLLECTION);
  }
}
