/**
 * Utility methods for yup schema validation
 */

import * as Yup from 'yup';

export function requiredString(message = 'required') {
  return Yup.string().trim().required(message);
}

export function optionalString() {
  return Yup.string().trim();
}

export function requiredOneOf(values: any[], message = 'required') {
  return Yup.mixed().oneOf(values).required(message);
}

export function optionalOneOf(values: any[]) {
  return Yup.mixed().oneOf(values);
}

export function requiredNumber() {
  return Yup.number().required();
}

export function requiredInt() {
  return Yup.number().integer().required();
}

export function requiredEmail(message = 'required') {
  return Yup.string().email('invalid email address').required(message);
}

export function optionalEmail() {
  return Yup.string().email();
}

export function requiredUrl(message = 'required') {
  return Yup.string().url().required(message);
}

export function optionalUrl() {
  return Yup.string().url().nullable();
}

export function optionalNumber() {
  return Yup.number();
}

export function optionalInt() {
  return Yup.number().integer();
}

export function requiredDate() {
  return Yup.date().required();
}

export function optionalDate() {
  return Yup.date();
}

export function requiredObject() {
  return Yup.object().required();
}

export function firestoreIcrementFieldValueOrNumber() {
  return Yup.mixed().test(
    'firestoreIcrementFieldValueOrNumber',
    'Must be a number or the result of an Firestore increment() call',
    (value: any) => {
      if (typeof value === 'object') {
        return (
          (value._methodName === 'increment' && typeof value.Ia === 'number') || // front-end firestore
          (value.operand !== undefined && typeof value.operand === 'number')
        ); // back-end firestore
      } else {
        return typeof value === 'number';
      }
    },
  );
}

export function optionalObject() {
  return Yup.object().default(null).nullable();
}

export function arrayOf(itemSchema: Yup.AnySchema) {
  return Yup.array().of(itemSchema);
}

export function requiredArrayOf(itemSchema: Yup.AnySchema, message = 'required') {
  return Yup.array().of(itemSchema).ensure().required(message);
}

export function optionalArrayOf(itemSchema: Yup.AnySchema) {
  return Yup.array().of(itemSchema);
}

export function optionalBool() {
  return Yup.boolean();
}

export function requiredBool() {
  return Yup.boolean().required();
}

/**
 * Validates the object against the given Yup schema with standard options.
 */
export async function validateObject(schema: Yup.AnySchema, object: object) {
  return schema.validate(object, {
    abortEarly: false,
    stripUnknown: true,
    context: schema.cast(object),
  });
}

// function _isIntegerString(value: string) {
//   if (typeof value !== 'string') return false;
//   return /^\d+$/.test(value);
// }
