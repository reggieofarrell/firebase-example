import * as functions from 'firebase-functions';
import { logData, logError, logInfo } from '@/lib/utils/log';
import { Topic } from '@google-cloud/pubsub';
const { PubSub } = require('@google-cloud/pubsub');
const pubsub = new PubSub();

/**
 * for locally testing pubsub function via network request
 */
export default functions.https.onRequest(
  async (req: functions.Request, res: functions.Response): Promise<void> => {
    /**
     * Note:
     *
     * to test a scheduled function locally, the topic would be:
     *
     * firebase-schedule-{functionName}
     *
     * such as...
     *
     * firebase-schedule-hydrationWorkflow-onSched_hydrate_fo
     */

    // 1. make sure the function can't be used in production
    if (!process.env.PUBSUB_EMULATOR_HOST) {
      logError('This function should only run locally in an emulator.');
      res.status(400).end();
      return;
    }

    logData('pubsub emulator host', process.env.PUBSUB_EMULATOR_HOST, true);

    try {
      const theTopic = req.body.topic;
      logInfo(`onRequest_pub_sub_helper : topic ${theTopic}`);

      const json = req.body.json || {};

      // 2. make sure the test topic exists and
      // if it doesn't then create it.
      const [topics] = await pubsub.getTopics();
      // logData('onRequest_pub_sub_helper : topics', topics, true);

      // topic.name is of format 'projects/PROJECT_ID/topics/test-topic',
      const testTopic = topics.filter((topic: Topic) => topic.name.includes(theTopic))?.[0];

      if (!testTopic) {
        logInfo(`onRequest_pub_sub_helper : topic ${theTopic} not found, creating...`);
        await pubsub.createTopic(theTopic);
      }

      // 3. publish to test topic and get message ID
      const messageID = await pubsub.topic(theTopic).publishMessage({ json });

      // 4. send back a helpful message
      res.status(201).send({ success: `Published to pubsub ${theTopic}`, messageID });
      return;
    } catch (error) {
      logError(error);
      res.status(500).send({ message: error.message });
      return;
    }
  },
);
