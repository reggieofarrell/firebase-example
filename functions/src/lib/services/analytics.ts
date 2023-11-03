import { PostHog } from 'posthog-node';

const env = process.env.RUNTIME_ENVIRONMENT;
const PH_KEY = env === 'production' ? process.env.PH_KEY || '' : '';
const PH_HOST = process.env.PH_HOST;

export const initAnalytics = (): PostHog => {
  return new PostHog(PH_KEY, { host: PH_HOST });
};
