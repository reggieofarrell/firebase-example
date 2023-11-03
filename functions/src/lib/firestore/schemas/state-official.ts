import { optionalString, requiredNumber, requiredString } from '@/lib/utils/yup-utils';

/**
 * This inteface will be combined with the FirestoreDocument interface
 * in the consuming project which will also add 'id', 'createdAt', 'updatedAt'
 */

export interface StateOfficialRead {
  state: string;
  biography?: string;
  birth_date?: string;
  capitol_address?: string;
  capitol_fax?: string;
  capitol_voice?: string;
  current_chamber: string;
  current_district: number;
  current_party: string;
  death_date: string;
  district_address: string;
  district_fax?: string;
  district_voice?: string;
  email: string;
  facebook: string;
  family_name?: string;
  given_name?: string;
  gender?: string;
  image?: string;
  instagram?: string;
  links?: string;
  memberScores?: string;
  memberScoresUpdatedAt?: number;
  name: string;
  refId?: string;
  sources?: string;
  twitter?: string;
  wikidata?: string;
  youtube?: string;
}

export interface StateOfficialWrite extends StateOfficialRead {}

const FIELDS = {
  state: 'state',
  biography: 'biography',
  birth_date: 'birth_date',
  capitol_address: 'capitol_address',
  capitol_fax: 'capitol_fax',
  capitol_voice: 'capitol_voice',
  current_chamber: 'current_chamber',
  current_district: 'current_district',
  current_party: 'current_party',
  death_date: 'death_date',
  district_address: 'district_address',
  district_fax: 'district_fax',
  district_voice: 'district_voice',
  email: 'email',
  facebook: 'facebook',
  family_name: 'family_name',
  given_name: 'given_name',
  gender: 'gender',
  image: 'image',
  instagram: 'instagram',
  links: 'links',
  memberScores: 'memberScores',
  memberScoresUpdatedAt: 'memberScoresUpdatedAt',
  name: 'name',
  refId: 'refId',
  sources: 'sources',
  twitter: 'twitter',
  wikidata: 'wikidata',
  youtube: 'youtube',
};

/**
 * The name of the collection for this model in Firestore
 */
const COLLECTION = 'state_officials';

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
  [FIELDS.state]: requiredString().default(''),
  [FIELDS.biography]: optionalString().default(''),
  [FIELDS.birth_date]: optionalString().default(''),
  [FIELDS.capitol_address]: optionalString().default(''),
  [FIELDS.capitol_fax]: optionalString().default(''),
  [FIELDS.capitol_voice]: optionalString().default(''),
  [FIELDS.current_chamber]: optionalString().default(''),
  [FIELDS.current_district]: optionalString().default(''),
  [FIELDS.current_party]: optionalString().default(''),
  [FIELDS.death_date]: optionalString().default(''),
  [FIELDS.district_address]: optionalString().default(''),
  [FIELDS.district_fax]: optionalString().default(''),
  [FIELDS.district_voice]: optionalString().default(''),
  [FIELDS.email]: optionalString().default(''),
  [FIELDS.facebook]: optionalString().default(''),
  [FIELDS.family_name]: optionalString().default(''),
  [FIELDS.given_name]: optionalString().default(''),
  [FIELDS.gender]: optionalString().default(''),
  [FIELDS.image]: optionalString().default(''),
  [FIELDS.instagram]: optionalString().default(''),
  [FIELDS.links]: optionalString().default(''),
  [FIELDS.memberScores]: optionalString().default(''),
  [FIELDS.memberScoresUpdatedAt]: requiredNumber().default(0),
  [FIELDS.name]: optionalString().default(''),
  [FIELDS.refId]: optionalString().default(''),
  [FIELDS.sources]: optionalString().default(''),
  [FIELDS.twitter]: optionalString().default(''),
  [FIELDS.wikidata]: optionalString().default(''),
  [FIELDS.youtube]: optionalString().default(''),
};

export const stateOfficialsSchema = {
  FIELDS,
  COLLECTION,
  SUBCOLLECTIONS,
  IS_SUBCOLLECTION,
  SCHEMA,
  OTHER_DATE_FIELDS,
};
