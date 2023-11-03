import * as functions from 'firebase-functions';
import { FirestoreAPI } from '@/lib/firestore';
import { FO_REFRESH_PROPUBLICA_TASK } from '@/config/task-queues';
import { logError } from '@/lib/utils/log';
import { scheduleHydrationTasks } from '@/lib/utils/task-queue';
import { HydrationTaskRulesets } from '@/enums/hydration';

const { fedOfficials } = new FirestoreAPI().models;
const { fields } = fedOfficials;

/**
 * Runs nightly at 2am CT
 */
export const onSched_updateFedOfficials = functions
  .runWith({ timeoutSeconds: 540 })
  .pubsub.schedule('0 2 * * *')
  .timeZone('America/Chicago')
  .onRun(async () => {
    try {
      /**
       * Get all the federal officials
       * we could also save reads by streaming the records
       * to BigQuery and then querying BigQuery for the records.
       *
       * We should also think of different ways we might filter this
       * result set to reduce the number of records we need to update.
       */
      const records = await fedOfficials.getAll();

      await scheduleHydrationTasks(
        records,
        fields.proPublicaUpdatedAt,
        HydrationTaskRulesets.ProPublica,
        FO_REFRESH_PROPUBLICA_TASK,
      );

      // sechedule other hydration tasks here, congress.gov etc...

      return;
    } catch (error) {
      logError(error);
    }

    return;
  });
