import { getFunctions } from 'firebase-admin/functions';
import { hydrationTaskRules } from '@/config/hydration-task-rules';
import { HydrationTaskRulesets } from '@/enums/hydration';
import { differenceInDays } from 'date-fns';
import { GenericObject } from '@/types/global';

/**
 * Schedules hydration tasks for records that have not been updated within a certain number of days.
 * @param records - An array of objects representing records to be hydrated.
 * @param timekey - The key in each record object that represents the last update time.
 * @param rulesetName - The name of the hydration task ruleset to use.
 * @param queueName - The name of the task queue to use.
 * @returns A promise that resolves when all tasks have been enqueued.
 * @throws An error if no ruleset is found for the given ruleset name.
 */
export async function scheduleHydrationTasks(
  records: GenericObject[],
  timekey: string,
  rulesetName: HydrationTaskRulesets,
  queueName: string,
) {
  if (!(rulesetName in hydrationTaskRules)) {
    throw new Error(`No ruleset found for ${rulesetName}`);
  }

  const rules = hydrationTaskRules[rulesetName] as HydrationTaskRule;

  const queue = getFunctions().taskQueue(queueName);
  const enqueues = [];

  let i = 1;

  for (const record of records) {
    const lastUpdate: number = record[timekey];

    if (differenceInDays(new Date(), new Date(lastUpdate || 0)) >= rules.days) {
      enqueues.push(
        queue.enqueue(record, {
          scheduleDelaySeconds: calcuateHourlyRateLimitDelay(i, rules.hourlyRateLimit),
          dispatchDeadlineSeconds: 60 * 5, // 5 minutes
        }),
      );

      i++;
    }
  }

  return Promise.all(enqueues);
}

/**
 * Calculates the request delay for an item in a task queue
 * required to stay within an hourly rate limit.
 *
 * @param iteration The current iteration number.
 * @param hourlyRateLimit The maximum number of iterations allowed per hour.
 * @returns The delay required in seconds.
 */
export const calcuateHourlyRateLimitDelay = (iteration: number, hourlyRateLimit: number) => {
  const n = Math.floor(iteration / hourlyRateLimit);
  return n * (60 * 60); // Delay each batch by N * hour
};
