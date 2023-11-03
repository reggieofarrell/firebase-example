import { RuntimeEnv } from '@/enums/global';

export const RUNTIME_ENV = (process.env.RUNTIME_ENV as RuntimeEnv) || 'local';
