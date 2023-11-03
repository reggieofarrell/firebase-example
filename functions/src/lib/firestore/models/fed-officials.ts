import { Firestore } from 'firebase-admin/firestore';
import {
  DEFAULT_FIRESTORE_SCHEMA,
  FirestoreDocument,
  FirestoreModel,
  DEFAULT_FIRESTORE_FIELDS,
} from './firestore';
import { FedOfficialRead, FedOfficialWrite, fedOfficialsSchema } from '../schemas/fed-official';

interface FedOfficialDocumentRead extends FirestoreDocument, FedOfficialRead {}
interface FedOfficialDocumentWrite extends FirestoreDocument, FedOfficialWrite {}

/**
 * Class for interacting with fedOfficialsSchema documents in Firestore
 */
export class FedOfficialModel extends FirestoreModel<
  FedOfficialDocumentRead,
  FedOfficialDocumentWrite
> {
  collection = fedOfficialsSchema.COLLECTION;
  subcollections = fedOfficialsSchema.SUBCOLLECTIONS;
  isSubcollection = fedOfficialsSchema.IS_SUBCOLLECTION;
  fields = { ...fedOfficialsSchema.FIELDS, ...DEFAULT_FIRESTORE_FIELDS };
  otherDateFields = fedOfficialsSchema.OTHER_DATE_FIELDS;
  protected schemaDef = { ...fedOfficialsSchema.SCHEMA, ...DEFAULT_FIRESTORE_SCHEMA };

  constructor(firestore: Firestore) {
    super(firestore, fedOfficialsSchema.COLLECTION);
  }

  /**
   * Updates the ProPublica data for a federal official with the given ID.
   * @param {string} id - The ID of the federal official to update.
   * @param {object} data - The ProPublica data to update.
   * @returns {Promise<void>} - A Promise that resolves when the update is complete.
   */
  async updatePropublicaData(id: string, data: object) {
    return this.update(id, {
      proPublicaData: JSON.stringify(data),
      proPublicaUpdatedAt: Date.now(),
    });
  }
}
