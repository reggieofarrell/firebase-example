import { Firestore } from 'firebase-admin/firestore';
import {
  DEFAULT_FIRESTORE_SCHEMA,
  FirestoreDocument,
  FirestoreModel,
  DEFAULT_FIRESTORE_FIELDS,
} from './firestore';
import { RemoteConfigRead, RemoteConfigWrite, remoteConfigSchema } from '../schemas/remote-config';

interface RemoteConfigDocumentRead extends FirestoreDocument, RemoteConfigRead {}
interface RemoteConfigDocumentWrite extends FirestoreDocument, RemoteConfigWrite {}

/**
 * Class for interacting with fedOfficialsSchema documents in Firestore
 */
export class RemoteConfigModel extends FirestoreModel<
  RemoteConfigDocumentRead,
  RemoteConfigDocumentWrite
> {
  collection = remoteConfigSchema.COLLECTION;
  subcollections = remoteConfigSchema.SUBCOLLECTIONS;
  isSubcollection = remoteConfigSchema.IS_SUBCOLLECTION;
  fields = { ...remoteConfigSchema.FIELDS, ...DEFAULT_FIRESTORE_FIELDS };
  otherDateFields = remoteConfigSchema.OTHER_DATE_FIELDS;
  protected schemaDef = { ...remoteConfigSchema.SCHEMA, ...DEFAULT_FIRESTORE_SCHEMA };

  constructor(firestore: Firestore) {
    super(firestore, remoteConfigSchema.COLLECTION);
  }
}
