import { initializeApp, getApps } from 'firebase-admin/app';
// import * as Sentry from '@sentry/node';

const apps = getApps();

if (apps.length === 0) {
  initializeApp();
}

// if (process.env.FUNCTIONS_EMULATOR !== 'true') {
//   Sentry.init({
//     dsn: SENTRY_DSN,
//     environment: RUNTIME_ENV
//   });
// }

/**
 * function groups
 * https://firebase.google.com/docs/functions/organize-functions?gen=2nd#group_functions
 */
exports.api = require('./cloud-functions/api');
exports.hydrationWorkflow = require('./cloud-functions/hydration-workflow');
exports.helpers = require('./cloud-functions/helpers');
