import {
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs';

const client = new SQSClient({ region: 'us-east-1' });

export const sendMessage = async (
  queueName: string,
  message: any,
): Promise<SendMessageCommandOutput> => {
  const sqsEvent: SendMessageCommandInput = {
    QueueUrl: queueName,
    MessageBody: JSON.stringify(message),
  };
  const sqsResponse = await client.send(new SendMessageCommand(sqsEvent));
  return sqsResponse;
};
