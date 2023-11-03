import { RUNTIME_ENV } from '../../config';

export const makeFirestorConsoleUrl = (firestorePath: string) => {
  if (RUNTIME_ENV !== 'local') {
    return `https://console.firebase.google.com/project/${process.env.GCLOUD_PROJECT}/firestore/data${firestorePath}`;
  }

  return `http://localhost:4000/firestore/data${firestorePath}`;
};
