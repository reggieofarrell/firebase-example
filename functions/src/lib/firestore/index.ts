import { getFirestore } from 'firebase-admin/firestore';
import { FedOfficialModel } from './models/fed-officials';

const initializedFirestore = getFirestore();

export class FirestoreAPI {
  models = {
    fedOfficials: new FedOfficialModel(initializedFirestore),
  };
}
