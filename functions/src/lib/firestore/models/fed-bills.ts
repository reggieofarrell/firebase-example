import { Firestore } from 'firebase-admin/firestore';
import {
  DEFAULT_FIRESTORE_SCHEMA,
  FirestoreDocument,
  FirestoreModel,
  DEFAULT_FIRESTORE_FIELDS,
} from './firestore';
import { FedBillRead, FedBillWrite, fedBillsSchema } from '../schemas/fed-bill';

interface FedBillDocumentRead extends FirestoreDocument, FedBillRead {}
interface FedBillDocumentWrite extends FirestoreDocument, FedBillWrite {}

/**
 * Class for interacting with fedOfficialsSchema documents in Firestore
 */
export class FedBillModel extends FirestoreModel<FedBillDocumentRead, FedBillDocumentWrite> {
  collection = fedBillsSchema.COLLECTION;
  subcollections = fedBillsSchema.SUBCOLLECTIONS;
  isSubcollection = fedBillsSchema.IS_SUBCOLLECTION;
  fields = { ...fedBillsSchema.FIELDS, ...DEFAULT_FIRESTORE_FIELDS };
  otherDateFields = fedBillsSchema.OTHER_DATE_FIELDS;
  protected schemaDef = { ...fedBillsSchema.SCHEMA, ...DEFAULT_FIRESTORE_SCHEMA };

  constructor(firestore: Firestore) {
    super(firestore, fedBillsSchema.COLLECTION);
  }
}
