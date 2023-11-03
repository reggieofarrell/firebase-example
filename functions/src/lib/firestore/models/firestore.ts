import {
  convertMillisDatesToTimestamps,
  convertTimestampsToMillis,
} from '../utils/convert-timestamps';
import {
  CollectionReference,
  Firestore,
  FieldValue,
  DocumentSnapshot,
  Timestamp,
  WriteBatch,
  DocumentReference,
  Query,
  WhereFilterOp,
  WithFieldValue,
  DocumentData,
} from 'firebase-admin/firestore';
import * as Yup from 'yup';

export interface FirestoreDocument {
  /**
   * The ID of the document
   */
  id: string;
  /**
   * The timestamp of when the document was created. This is
   * stored in Firestore as a Firestore Timestamp object, but
   * is converted to milliseconds when read from Firestore
   */
  createdAt: number;
  /**
   * The timestamp of when the document was last updated. This is
   * stored in Firestore as a Firestore Timestamp object, but
   * is converted to milliseconds when read from Firestore
   */
  updatedAt: number;
}

export const DEFAULT_FIRESTORE_FIELDS = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export const DEFAULT_FIRESTORE_SCHEMA = {
  [DEFAULT_FIRESTORE_FIELDS.id]: Yup.string().required(),
  [DEFAULT_FIRESTORE_FIELDS.createdAt]: Yup.number().required(),
  [DEFAULT_FIRESTORE_FIELDS.updatedAt]: Yup.number().required(),
};

export type QueryWhereClause = [string, WhereFilterOp, any];
export type QueryOrderByClause = [string, ('asc' | 'desc' | undefined)?]; // [field, 'asc' | 'desc']
export type QueryStartAfterClause = (string | number | Timestamp)[] | string | number | Timestamp;

/**
 * This class does most of the heavy lifting for reading and writing data in Firestore. It exposes main CRUD operations
 * and some helper functions
 */
export class FirestoreModel<DocumentTypeRead, DocumentTypeWrite> {
  protected firestore: Firestore;
  protected schemaDef: Record<string, any>;
  protected otherDateFields: string[];
  protected beforeSave: (data: Partial<DocumentTypeWrite>) => Partial<DocumentTypeWrite>;
  collection: string;
  collectionRef: CollectionReference;
  subcollections: string[];
  isSubcollection: boolean;
  fields: Record<string, any>;

  /**
   * Main constructor
   * @param firestore Initialized instance of Firestore
   * @param collection the firestore collection name
   */
  constructor(firestore: Firestore, collection: string) {
    if (this.constructor == FirestoreModel) {
      throw new Error("Abstract classes can't be instantiated.");
    }

    this.firestore = firestore;
    this.collection = collection;
    this.collectionRef = this.firestore.collection(collection);
  }

  /**
   * Removes fields from the schema and returns a new Yup schema. This is
   * helpful for updates where you don't want to require all fields. See the update
   * method for an example of how this is used.
   */
  getModifiedSchema(fieldsToRemove: string[] = []): Yup.Schema {
    const modifiedSchemaDef = { ...this.schemaDef };

    if (fieldsToRemove.length) {
      fieldsToRemove.forEach(field => {
        if (field in modifiedSchemaDef) {
          delete modifiedSchemaDef[field];
        }
      });
    }

    return Yup.object().shape(modifiedSchemaDef);
  }

  /**
   * Creates the Yup schema from this.schemaDef
   * @returns {import('Yup/lib/types').SchemaLike}
   */
  getSchema(): Yup.Schema {
    return Yup.object().shape(this.schemaDef);
  }

  /**
   * Validates the schema of the object passed in
   * @param schema Yup schema to validate against
   * @param object The object to validate
   * @returns validated object or throws an error
   */
  protected async validate(
    schema: Yup.Schema,
    object: Record<string, any>,
  ): Promise<Partial<DocumentTypeRead>> {
    const validated = await schema.validate(object, {
      abortEarly: true,
      stripUnknown: true,
    });
    return validated;
  }

  /**
   * Validates the data against the given schema, converts any Unix
   * timestamps to Firestore Timestamps, and adds the createdAt and
   * updatedAt Timestamps
   */
  protected async validateAndPrepareForCreate(
    data: Record<string, any>,
    schema: Yup.Schema,
  ): Promise<DocumentTypeWrite> {
    let validatedObject;

    try {
      validatedObject = await this.validate(schema, data);
    } catch (e: any) {
      throw new Error(`[Firestore Validation] ${e.path} - ${e.message}`);
    }

    validatedObject = convertMillisDatesToTimestamps({ ...validatedObject }, this.otherDateFields);

    validatedObject.createdAt = FieldValue.serverTimestamp();
    validatedObject.updatedAt = FieldValue.serverTimestamp();

    return validatedObject as DocumentTypeWrite;
  }

  /**
   * Writes an object to Firestore. All records automagically get "createdAt" and "updatedAt" values added to the saved
   * object.
   * @param object    The object to write
   * @param returnDoc If true, the function will read the document from Firestore again and return it
   * @returns Promise that resolves to the object stored in Firestore
   */
  async create(
    object: Omit<DocumentTypeWrite, 'id' | 'createdAt' | 'updatedAt'>,
    options: {
      returnDoc?: boolean;
    } = {},
  ) {
    options = { returnDoc: false, ...options };

    const createSchema = this.getModifiedSchema([
      DEFAULT_FIRESTORE_FIELDS.createdAt,
      DEFAULT_FIRESTORE_FIELDS.updatedAt,
    ]);

    // @ts-ignore
    let objectId: string = object.id;

    const newDocRef = objectId ? this.collectionRef.doc(objectId) : this.collectionRef.doc();

    const validatedObject = (await this.validateAndPrepareForCreate(
      { ...object, id: newDocRef.id },
      createSchema,
    )) as WithFieldValue<DocumentData>;

    await newDocRef.set(validatedObject);

    if (options.returnDoc) {
      return this.get(newDocRef.id);
    }

    return newDocRef.id;
  }

  /**
   * Adds a write operation to the passed in batch. All records get "createdAt" and "updatedAt" values added
   * @param object - The object to write to Firestore
   * @param batch - the batch to add the write to
   * @param docRef - If a docRef is passed in, the write will be written to that docRef instead of a new one
   * @returns   Promise that resolves to the id of the new document
   */
  async createForBatch(
    object: Partial<DocumentTypeWrite>,
    batch: WriteBatch,
    docRef?: DocumentReference,
  ): Promise<string> {
    const createSchema = this.getModifiedSchema([
      DEFAULT_FIRESTORE_FIELDS.createdAt,
      DEFAULT_FIRESTORE_FIELDS.updatedAt,
    ]);

    // @ts-ignore
    let objectId: string | undefined = object.id;

    let newDocRef: DocumentReference;

    if (docRef) {
      newDocRef = docRef;
    } else {
      newDocRef = objectId ? this.collectionRef.doc(objectId) : this.collectionRef.doc();
    }

    const validatedObject = (await this.validateAndPrepareForCreate(
      { ...object, id: newDocRef.id },
      createSchema,
    )) as WithFieldValue<DocumentData>;

    batch.set(newDocRef, validatedObject);

    return newDocRef.id;
  }

  /**
   * Validates the data against the given schema, converts any Unix
   * timestamps to Firestore Timestamps, and adds the "updatedAt" Timestamp
   */
  protected async validateAndPrepareForUpdate(
    data: Partial<DocumentTypeWrite>,
    schema: Yup.Schema,
  ): Promise<Partial<DocumentTypeWrite>> {
    let validatedObject;

    try {
      validatedObject = await this.validate(schema, data);
    } catch (e: any) {
      throw new Error(`[Firestore Validation] ${e.path} - ${e.message}`);
    }

    validatedObject = convertMillisDatesToTimestamps(validatedObject, this.otherDateFields);

    validatedObject['updatedAt'] = FieldValue.serverTimestamp();

    return validatedObject as Partial<DocumentTypeWrite>;
  }

  /**
   * Writes an object to Firestore. All records automagically get "createdAt" and "updatedAt" values added to the saved
   * object.
   * @param id The Firestore document id
   * @param updateObj The object to write
   * @param options Options for the update
   * @param options.returnDoc If true, the function will read the document from Firestore again and return it
   * @param options.useTransaction If true, the update will be wrapped in a Firestore transaction
   * @returns Promise that resolves either to void or to updated record from Firestore if returnDoc = true
   */
  async update(
    id: string,
    updateObj: Partial<DocumentTypeWrite>,
    options: {
      returnDoc?: boolean;
      useTransaction?: boolean;
    } = {},
  ): Promise<DocumentTypeRead | void> {
    options = {
      returnDoc: false,
      useTransaction: false,
      ...options,
    };

    const ref = this.collectionRef.doc(id);

    if (options.useTransaction) {
      await this.firestore.runTransaction(transaction => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(ref).then(async document => {
          if (!document.exists) {
            throw 'Document does not exist!';
          }

          let validatedObject;

          let docData = convertTimestampsToMillis({ ...document.data() }, this.otherDateFields);

          let combinedData: Partial<DocumentTypeWrite> = {
            ...docData,
            ...updateObj,
          };

          if (this.beforeSave) {
            combinedData = this.beforeSave({ ...combinedData });
          }

          try {
            await this.validate(this.getSchema(), combinedData);
          } catch (e: any) {
            throw new Error(`[Firestore Validation] ${e.path} - ${e.message}`);
          }

          validatedObject = convertMillisDatesToTimestamps(combinedData, this.otherDateFields);

          validatedObject.updatedAt = FieldValue.serverTimestamp();

          transaction.set(ref, validatedObject, { merge: true });
        });
      });
    } else {
      const schemaKeys = Object.keys(this.schemaDef);
      const updateKeys = Object.keys(updateObj);

      // create an array of the fields to remove from the
      // schema before validating so that we can do a partial
      // update
      const intersection = [...new Set(schemaKeys.filter(x => !updateKeys.includes(x)))];

      const updateSchema = this.getModifiedSchema(intersection);

      const validatedObject = await this.validateAndPrepareForUpdate(updateObj, updateSchema);

      await ref.set(validatedObject, { merge: true });
    }

    if (options.returnDoc) {
      return this.get(id) as Promise<DocumentTypeRead>;
    }

    return;
  }

  /**
   * Creates an update operation on the passed in batch.
   * All records get the updatedAt value added
   * @param id The id of the document to update
   * @param updateObj The object to write
   * @param batch the batch to add the write to
   * @returns   Promise that resolves void
   */
  async updateForBatch(
    id: string,
    updateObj: Partial<DocumentTypeWrite>,
    batch: WriteBatch,
  ): Promise<void> {
    const docRef = this.collectionRef.doc(id);
    const schemaKeys = Object.keys(this.schemaDef);
    const updateKeys = Object.keys(updateObj);

    // create an array of the fields to remove from the
    // schema before validating so that we can do a partial
    // update
    const intersection = [...new Set(schemaKeys.filter(x => !updateKeys.includes(x)))];

    const updateSchema = this.getModifiedSchema(intersection);

    const validatedObject = await this.validateAndPrepareForUpdate(updateObj, updateSchema);

    batch.set(docRef, validatedObject, { merge: true });

    return;
  }

  /**
   * Fetches a single object from this Firestore collection
   * @param id  The id of the object to fetch
   * @returns Promise that resolves to the document, if it exists, or null
   */
  async get(id: string): Promise<DocumentTypeRead | null> {
    const ref = this.collectionRef.doc(id);
    const docSnapshot = await ref.get();

    if (!docSnapshot.exists) {
      return null;
    }

    return this.convertFromFirestoreDoc(docSnapshot);
  }

  /**
   * Fetches all documents in a collection and orders them by the specified field
   * @param field  the field to order by
   * @returns Promise that resolves to the document, if it exists, or null
   */
  async getAllAndOrderBy(field: string): Promise<DocumentTypeRead[]> {
    return this.query(null, [field]);
  }

  /**
   * Fetches a single object from this Firestore collection by the passed field and value
   * @param field  the field to look up the document by
   * @param value  the value to look up the document by
   */
  async getOneBy(field: string, value: string | number): Promise<DocumentTypeRead | false> {
    const results = await this.query([field, '==', value]);

    if (results.length > 1) {
      throw new Error('found more than one result');
    }

    return results.length ? results[0] : false;
  }

  /**
   * Fetches a single object from this Firestore collection by the passed field and value
   * @param field  the field to look up the document by
   * @param value  the value to look up the document by
   * @returns Promise that resolves to the document, if it exists, or null
   */
  async getBy(field: string, value: string | number) {
    const results = await this.query([field, '==', value]);

    return results.length ? results : null;
  }

  /**
   * Fetches the entire collection
   * @param orderBy OrderBy parameters to pass to the Firestore query when fetching all the records
   */
  async getAll(orderBy: QueryOrderByClause | null = null) {
    return this.query(null, orderBy);
  }

  /**
   * Converts the Firestore document into an object
   * with the Timestamps replaced
   */
  // private convertFromFirestoreDocument(firestoreDocument: DocumentSnapshot) {
  //   return convertTimestampsToMillis(
  //     { ...firestoreDocument },
  //     this.otherDateFields
  //   );
  // }

  /**
   * Converts the raw data object to be stored in Firestore
   */
  // private convertToFirestoreDocument(data: Record<string, any>) {
  //   return convertMillisDatesToTimestamps({ ...data }, this.otherDateFields);
  // }

  /**
   * Deletes a document from Firestore
   */
  async delete(id: string): Promise<void> {
    await this.collectionRef.doc(id).delete();
  }

  /**
   * Performs a query on the Firestore collection
   * @param where       Parameters to pass to a Firestore "where" query
   * @param orderBy     Parameters to pass to a Firestore "orderBy" query
   * @param startAfter  The orderBy value to start after, for pagination. Only applied if orderBy also specified
   * @param limit       Maximum number of records to return. Only applied if orderBy also specified
   */
  async query(
    whereClause: QueryWhereClause | QueryWhereClause[] | null = null,
    orderByClause: QueryOrderByClause | QueryOrderByClause[] | null = null,
    startAfterClause: QueryStartAfterClause | QueryStartAfterClause[] | null = null,
    limitClause: number | null = null,
  ): Promise<DocumentTypeRead[]> {
    let query = this.firestore.collection(this.collection) as Query;

    if (whereClause && whereClause.length) {
      if (Array.isArray(whereClause[0])) {
        whereClause.forEach((wq: QueryWhereClause) => {
          query = query.where(...wq);
        });
      } else {
        // @ts-ignore
        query = query.where(...whereClause);
      }
    }

    if (orderByClause && orderByClause.length) {
      if (orderByClause && orderByClause.length) {
        if (Array.isArray(orderByClause[0])) {
          orderByClause.forEach(o => {
            // @ts-ignore
            query = query.orderBy(...o);
          });
        } else {
          // @ts-ignore
          query = query.orderBy(...orderByClause);
        }
      }

      if (startAfterClause) {
        if (Array.isArray(startAfterClause)) {
          query = query.startAfter(...startAfterClause);
        } else {
          query = query.startAfter(startAfterClause);
        }
      }

      if (limitClause) {
        query = query.limit(limitClause);
      }
    }

    return this.runQuery(query);
  }

  /**
   * Queries Firestore and converts the resulting documents
   * @param query The query to perform on the Firebase collection
   * @param otherDateFields The custom function for transforming internal Timestamps to JS Dates
   */
  private async runQuery(query: Query): Promise<DocumentTypeRead[]> {
    const querySnapshot = await query.get();

    return querySnapshot.size > 0
      ? querySnapshot.docs.map(doc => this.convertFromFirestoreDoc(doc) as DocumentTypeRead)
      : [];
  }

  /**
   * Transforms raw output from a Firestore document to a more "consumable" object. By default createdAt and updatedAt
   * values get converted to normal JS Dates, and if a otherDateFields function has been supplied to the model it will run
   * the custom convert function as well.
   * @param firestoreDocument The document from Firestore
   * @param otherDateFields Custom method passed into the model for transforming other date objects inside of the model
   * @returns firestore document with any Timestamps converted to milliseconds since epoch
   */
  convertFromFirestoreDoc(firestoreDocument: DocumentSnapshot): DocumentTypeRead {
    let retVal = firestoreDocument.data() || {};

    retVal.id = firestoreDocument.id;

    // convert timestamps
    if (retVal.createdAt && retVal.createdAt.toMillis) {
      retVal.createdAt = retVal.createdAt.toMillis();
    }

    if (retVal.updatedAt && retVal.updatedAt.toMillis) {
      retVal.updatedAt = retVal.updatedAt.toMillis();
    }

    if (this.otherDateFields.length) {
      retVal = convertTimestampsToMillis(retVal, this.otherDateFields);
    }

    return retVal as DocumentTypeRead;
  }
}
