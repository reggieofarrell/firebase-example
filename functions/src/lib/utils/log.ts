import { logger } from 'firebase-functions/v1';
import chalk from 'chalk';
import util from 'util';
import * as Sentry from '@sentry/node';
import { RUNTIME_ENV } from '@/config/global';
import { RuntimeEnv } from '@/enums/global';

chalk.level = 1;

/**
 * Logs a warning to CGP/Firebase console or creates
 * colorized console output for local development
 * @param {string} message
 * @param {boolean} localOnly only execute the logging in the local environment
 */
export const logWarning = (message: string, localOnly = false) => {
  const isLocal = RUNTIME_ENV === RuntimeEnv.Local;
  if (isLocal) {
    console.log(chalk.yellow(message));
  } else if (!isLocal && !localOnly) {
    logger.warn(message);
  }
};

/**
 * Logs info to CGP/Firebase console or creates
 * colorized console output for local development
 * @param {string} message
 * @param {boolean} localOnly only execute the logging in the local environment
 */
export const logInfo = (message: string, localOnly = false) => {
  const isLocal = RUNTIME_ENV === RuntimeEnv.Local;

  if (isLocal) {
    console.log(chalk.greenBright(message));
  } else if (!isLocal && !localOnly) {
    logger.log(message);
  }
};

/**
 * Logs data to CGP/Firebase console or creates
 * colorized console output for local development
 *
 * @param {string} title
 * @param {string|object} data
 * @param {boolean} localOnly only execute the logging in the local environment
 */
export const logData = (title = '', data: any, localOnly = false) => {
  const isLocal = RUNTIME_ENV === RuntimeEnv.Local;

  if (isLocal) {
    console.log(chalk.cyanBright(`== ${title} ==`));

    if (data) {
      if (typeof data === 'object') {
        console.log(util.inspect(data, { showHidden: false, depth: null, colors: true }));
      } else {
        console.log(data);
      }
    }
    console.log('');
  } else if (!isLocal && !localOnly) {
    if (data) {
      logger.log(`${title} [+]`, data);
    } else {
      logger.log(`${title}`);
    }
  }
};

/**
 * Logs an error to the GCP/Firebase console or creates
 * colorized console output for local development
 * @param {*} error
 * @param {Object} context - only used if error is a string
 */
export const logError = (error: unknown, context: any | null = null) => {
  const isLocal = RUNTIME_ENV === RuntimeEnv.Local;

  if (!isLocal) {
    Sentry.captureException(error);
  }

  if (error instanceof Error) {
    if (isLocal) {
      // console.error(chalk.red.bold(error.message));
      console.log(chalk.red(error.stack));

      // @ts-ignore
      if (error.cause) {
        console.log('');
        console.log(chalk.bold.red('== Error Cause =='));

        // @ts-ignore
        if (error.cause instanceof Error) {
          // @ts-ignore
          console.log(chalk.red(error.cause.stack));
        } else {
          // @ts-ignore
          console.log(chalk.red(JSON.stringify(error.cause, null, 2)));
        }
      }
    } else {
      logger.error(error.message);
      logger.error(error.stack);

      // @ts-ignore
      if (error.cause) {
        logger.error('== Error Cause ==');

        // @ts-ignore
        if (error.cause instanceof Error) {
          // @ts-ignore
          logger.error(error.cause.message);
          // @ts-ignore
          logger.error(error.cause.stack);
        } else {
          // @ts-ignore
          logger.error(error.cause);
        }
      }
    }
  } else {
    if (isLocal) {
      console.error(chalk.red(error));
    } else {
      logger.error(error);
    }
  }
};
