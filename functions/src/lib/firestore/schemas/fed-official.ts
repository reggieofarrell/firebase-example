import { optionalString, requiredNumber } from '@/lib/utils/yup-utils';

/**
 * This inteface will be combined with the FirestoreDocument interface
 * in the consuming project which will also add 'id', 'createdAt', 'updatedAt'
 */

export interface FedOfficialRead {
  id: string;
  propublica_id?: string;
  crp_id?: string;
  votesmart_id?: string;
  first_name?: string;
  last_name?: string;
  congressUpdatedAt?: number;
  openSecretsUpdatedAt?: string;
  proPublicaUpdatedAt?: number;
  voteSmartUpdatedAt?: number;
  memberBioUpdatedAt?: number;
  memberScoresUpdatedAt?: number;
  congressData?: string;
  memberLegislation?: string;
  openSecretsData?: string;
  proPublicaData?: string;
  voteSmartData?: string;
  memberBio?: string;
  memberScores?: string;
}

export interface FedOfficialWrite extends FedOfficialRead {}

const FIELDS = {
  id: 'id',
  propublica_id: 'propublica_id',
  crp_id: 'crp_id',
  votesmart_id: 'votesmart_id',
  first_name: 'first_name',
  last_name: 'last_name',
  congressUpdatedAt: 'congressUpdatedAt',
  openSecretsUpdatedAt: 'openSecretsUpdatedAt',
  proPublicaUpdatedAt: 'proPublicaUpdatedAt',
  voteSmartUpdatedAt: 'voteSmartUpdatedAt',
  memberBioUpdatedAt: 'memberBioUpdatedAt',
  memberScoresUpdatedAt: 'memberScoresUpdatedAt',
  congressData: 'congressData',
  memberLegislation: 'memberLegislation',
  openSecretsData: 'openSecretsData',
  proPublicaData: 'proPublicaData',
  voteSmartData: 'voteSmartData',
  memberBio: 'memberBio',
  memberScores: 'memberScores',
};

/**
 * The name of the collection for this model in Firestore
 */
const COLLECTION = 'fed_officials';

/**
 * Any subcollections this model may have
 */
const SUBCOLLECTIONS: string[] = [];

/**
 * Whether or not this model is a subcollection
 */
const IS_SUBCOLLECTION = false;

/**
 * Keys of any other date fields aside from the standard 'createdAt' and 'updatedAt'
 */
const OTHER_DATE_FIELDS: string[] = [];

/**
 * Yup schema for this model
 */
const SCHEMA: Record<string, any> = {
  [FIELDS.propublica_id]: optionalString().default(''),
  [FIELDS.crp_id]: optionalString().default(''),
  [FIELDS.votesmart_id]: optionalString().default(''),
  [FIELDS.first_name]: optionalString().default(''),
  [FIELDS.last_name]: optionalString().default(''),
  [FIELDS.congressUpdatedAt]: requiredNumber().default(0),
  [FIELDS.openSecretsUpdatedAt]: requiredNumber().default(0),
  [FIELDS.proPublicaUpdatedAt]: requiredNumber().default(0),
  [FIELDS.voteSmartUpdatedAt]: requiredNumber().default(0),
  [FIELDS.memberBioUpdatedAt]: requiredNumber().default(0),
  [FIELDS.memberScoresUpdatedAt]: requiredNumber().default(0),
  [FIELDS.congressData]: optionalString().default(''),
  [FIELDS.memberLegislation]: optionalString().default(''),
  [FIELDS.openSecretsData]: optionalString().default(''),
  [FIELDS.proPublicaData]: optionalString().default(''),
  [FIELDS.voteSmartData]: optionalString().default(''),
  [FIELDS.memberBio]: optionalString().default(''),
  [FIELDS.memberScores]: optionalString().default(''),
};

export const fedOfficialsSchema = {
  FIELDS,
  COLLECTION,
  SUBCOLLECTIONS,
  IS_SUBCOLLECTION,
  SCHEMA,
  OTHER_DATE_FIELDS,
};
