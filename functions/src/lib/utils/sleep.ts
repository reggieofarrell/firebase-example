import { random } from 'lodash';

/**
 * Creates a promise that resolves after the given number of milliseconds
 * @param {number} ms - number of ms before returning the resolved promise
 * @returns {Promise}
 */
export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a promise that resolves after a random amount of milliseconds
 * between the given min and max
 * @param {number} min
 * @param {number} max
 * @returns {Promise}
 */
export async function sleepRandom(min = 1000, max = 15000) {
  const ms = random(min, max);
  return new Promise(resolve => setTimeout(resolve, ms));
}
