import { Firestore } from 'firebase-admin/firestore';
import {
  DEFAULT_FIRESTORE_SCHEMA,
  FirestoreDocument,
  FirestoreModel,
  DEFAULT_FIRESTORE_FIELDS,
} from './firestore';
import { PerigonTopicRead, PerigonTopicWrite, perigonTopicsSchema } from '../schemas/perigon-topic';

interface PerigonTopicDocumentRead extends FirestoreDocument, PerigonTopicRead {}
interface PerigonTopicDocumentWrite extends FirestoreDocument, PerigonTopicWrite {}

/**
 * Class for interacting with fedOfficialsSchema documents in Firestore
 */
export class PerigonTopicModel extends FirestoreModel<
  PerigonTopicDocumentRead,
  PerigonTopicDocumentWrite
> {
  collection = perigonTopicsSchema.COLLECTION;
  subcollections = perigonTopicsSchema.SUBCOLLECTIONS;
  isSubcollection = perigonTopicsSchema.IS_SUBCOLLECTION;
  fields = { ...perigonTopicsSchema.FIELDS, ...DEFAULT_FIRESTORE_FIELDS };
  otherDateFields = perigonTopicsSchema.OTHER_DATE_FIELDS;
  protected schemaDef = { ...perigonTopicsSchema.SCHEMA, ...DEFAULT_FIRESTORE_SCHEMA };

  constructor(firestore: Firestore) {
    super(firestore, perigonTopicsSchema.COLLECTION);
  }
}
