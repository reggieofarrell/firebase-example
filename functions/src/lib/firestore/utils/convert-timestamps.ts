import { Timestamp } from 'firebase-admin/firestore';

/**
 * Converts a Firstore Timestamp to milliseconds since Epoch
 * @param {Timestamp} timestamp a Timestamp object pulled from a Firestore document
 */
export function convertTimestampToMillis(timestamp: Timestamp): number {
  if (!timestamp.toMillis) {
    throw new Error('passed value for timestamp is not a Firestore Timestamp');
  }

  return timestamp.toMillis();
}

/**
 * Converts milliseconds since Epoch to a Firstore Timestamp
 * @param {number} milliseconds date represented as milliseconds since Epoch
 * @param {Timestamp} timestamp Timestamp class from the Firestore SDK
 */
export function convertMillisToTimestamp(milliseconds: number): Timestamp {
  return Timestamp.fromMillis(milliseconds);
}

/**
 * Converts number values in the data object to Firestore Timestamps to be written to Firestore
 * @param {object} data object to be written to Firestore
 * @param {string[]} otherDateFields array of keys in the data object that need to be converted from milliseconds since Epoch to Firestore Timestamps
 * @param {Object} Timestamp Timestamp class from the Firestore SDK
 * @returns
 */
export function convertMillisDatesToTimestamps(
  data: Record<string, any>,
  otherDateFields: string[] = [],
) {
  const theData = { ...data };

  if (otherDateFields.length) {
    otherDateFields.forEach(dateField => {
      if (dateField in theData) {
        theData[dateField] = convertMillisToTimestamp(theData[dateField]);
      } else {
        console.warn(`expected dateField ${dateField} not found in convertMillisDatesToTimestamps`);
      }
    });
  }

  return theData;
}

/**
 * Converts number values in the data object to Firestore Timestamps to be written to Firestore
 * @param {object} data object to be written to Firestore
 * @param {string[]} otherDateFields array of keys in the data object that need to be converted from milliseconds since Epoch to Firestore Timestamps
 * @returns
 */
export function convertTimestampsToMillis(
  data: Record<string, any>,
  otherDateFields: string[] = [],
) {
  const theData = { ...data };

  if (otherDateFields.length) {
    otherDateFields.forEach(dateField => {
      if (dateField in theData) {
        theData[dateField] = convertTimestampToMillis(theData[dateField]);
      } else {
        console.warn(`expected dateField ${dateField} not found in convertTimestampsToMillis`);
      }
    });
  }

  return theData;
}
