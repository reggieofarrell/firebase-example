import { Firestore } from 'firebase-admin/firestore';
import {
  DEFAULT_FIRESTORE_SCHEMA,
  FirestoreDocument,
  FirestoreModel,
  DEFAULT_FIRESTORE_FIELDS,
} from './firestore';
import {
  StateOfficialRead,
  StateOfficialWrite,
  stateOfficialsSchema,
} from '../schemas/state-official';

interface StateOfficialDocumentRead extends FirestoreDocument, StateOfficialRead {}
interface StateOfficialDocumentWrite extends FirestoreDocument, StateOfficialWrite {}

/**
 * Class for interacting with fedOfficialsSchema documents in Firestore
 */
export class StateOfficialModel extends FirestoreModel<
  StateOfficialDocumentRead,
  StateOfficialDocumentWrite
> {
  collection = stateOfficialsSchema.COLLECTION;
  subcollections = stateOfficialsSchema.SUBCOLLECTIONS;
  isSubcollection = stateOfficialsSchema.IS_SUBCOLLECTION;
  fields = { ...stateOfficialsSchema.FIELDS, ...DEFAULT_FIRESTORE_FIELDS };
  otherDateFields = stateOfficialsSchema.OTHER_DATE_FIELDS;
  protected schemaDef = { ...stateOfficialsSchema.SCHEMA, ...DEFAULT_FIRESTORE_SCHEMA };

  constructor(firestore: Firestore) {
    super(firestore, stateOfficialsSchema.COLLECTION);
  }
}
