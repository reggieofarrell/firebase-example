import { Firestore } from 'firebase-admin/firestore';
import {
  DEFAULT_FIRESTORE_SCHEMA,
  FirestoreDocument,
  FirestoreModel,
  DEFAULT_FIRESTORE_FIELDS,
} from './firestore';
import { NewsRead, NewsWrite, newsSchema } from '../schemas/news';

interface NewsDocumentRead extends FirestoreDocument, NewsRead {}
interface NewsDocumentWrite extends FirestoreDocument, NewsWrite {}

/**
 * Class for interacting with fedOfficialsSchema documents in Firestore
 */
export class NewsModel extends FirestoreModel<NewsDocumentRead, NewsDocumentWrite> {
  collection = newsSchema.COLLECTION;
  subcollections = newsSchema.SUBCOLLECTIONS;
  isSubcollection = newsSchema.IS_SUBCOLLECTION;
  fields = { ...newsSchema.FIELDS, ...DEFAULT_FIRESTORE_FIELDS };
  otherDateFields = newsSchema.OTHER_DATE_FIELDS;
  protected schemaDef = { ...newsSchema.SCHEMA, ...DEFAULT_FIRESTORE_SCHEMA };

  constructor(firestore: Firestore) {
    super(firestore, newsSchema.COLLECTION);
  }
}
