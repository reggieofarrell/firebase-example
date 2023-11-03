import { FirestoreAPI } from '@/lib/firestore';
import { FedOfficialRead } from '@/lib/firestore/schemas/fed-official';
import * as functions from 'firebase-functions';

const HttpsError = functions.https.HttpsError;
const { fedOfficials } = new FirestoreAPI().models;

// https://firebase.google.com/docs/functions/task-functions?gen=1st

export const onDisp_FOUpdatePropublica = functions.tasks
  .taskQueue({
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 30,
    },
    rateLimits: {
      maxConcurrentDispatches: 1,
    },
  })
  .onDispatch(async (data: FedOfficialRead) => {
    try {
      // fetch the data from ProPublica and update the fedOfficial record
      // in firestore
      const proPublicaData = { someData: 'example' };

      await fedOfficials.updatePropublicaData(data.id, proPublicaData);
    } catch (err) {
      throw new HttpsError(
        'internal',
        `Error updating ProPublica data for FedOfficial ${data.id}`,
        err,
      );
    }
  });
