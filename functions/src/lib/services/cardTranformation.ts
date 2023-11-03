import { FedBill, parsedFedBill } from '../models/dynamo/fedBill';
import { FedOfficial, parsedFedOfficial } from '../models/dynamo/fedOfficial';
import { StateBill } from '../models/dynamo/stateBill';
import { StateOfficial } from '../models/dynamo/stateOfficial';
import { TYPES } from '../utils/constants';

const parseProperty = (prop: any) => (prop ? JSON.parse(prop) : undefined);

const parseFedOfficial = (dynamoRecord: FedOfficial): parsedFedOfficial => {
  const {
    chatGPTData,
    congressData,
    memberLegislation,
    openSecretsData,
    proPublicaData,
    voteSmartData,
    memberBio,
    memberScores,
  } = dynamoRecord;
  return {
    ...dynamoRecord,
    chatGPTData: parseProperty(chatGPTData),
    congressData: parseProperty(congressData),
    memberLegislation: parseProperty(memberLegislation),
    openSecretsData: parseProperty(openSecretsData),
    proPublicaData: parseProperty(proPublicaData),
    voteSmartData: parseProperty(voteSmartData),
    memberBio: parseProperty(memberBio),
    memberScores: parseProperty(memberScores),
  };
};

const parseFedBill = (dynamoRecord: FedBill): parsedFedBill => {
  const { chatGPTData, congressBill, congressBillText, billCategory, billSummary } = dynamoRecord;
  return {
    ...dynamoRecord,
    chatGPTData: parseProperty(chatGPTData),
    congressBill: parseProperty(congressBill),
    congressBillText: parseProperty(congressBillText),
    billCategory: parseProperty(billCategory),
    billSummary: parseProperty(billSummary),
  };
};

const parseStateOfficial = (dynamoRecord: StateOfficial): parsedStateOfficial => {
  const { memberScores } = dynamoRecord;
  return {
    ...dynamoRecord,
    memberScores: parseProperty(memberScores),
  };
};

const parseStateBill = (dynamoRecord: StateBill): parsedStateBill => {
  const { billCategory, billSummary } = dynamoRecord;
  return {
    ...dynamoRecord,
    billCategory: parseProperty(billCategory),
    billSummary: parseProperty(billSummary),
  };
};

export const transformFedOfficial = (dynamoRecord: FedOfficial) => {
  const parsedDynamoRecord = parseFedOfficial(dynamoRecord);
  const {
    id,
    propublica_id,
    first_name,
    last_name,
    congressData,
    memberLegislation,
    proPublicaData,
    chatGPTData,
    voteSmartData,
    openSecretsData,
    memberScores,
    memberBio,
    biography,
  } = parsedDynamoRecord;
  const bioguideId = propublica_id || 'MockedBioGuideId';
  const image = congressData?.depiction?.imageUrl || 'MockedImageURL';
  const type = TYPES.FedOfficial;
  const name = `${first_name ?? ''}${last_name ? ` ${last_name}` : 'MockedName'}`;
  const party = proPublicaData?.current_party || 'MockedParty';
  let bio = {
    birthDate: 'MockedBirthDate',
    birthPlace: 'MockedBirthPlace',
    gender: 'MockedGender',
    family: 'MockedFamily',
    homeCity: 'MockedHomeCity',
    homeState: 'MockedHomeState',
  };
  if (voteSmartData?.candidate) {
    const { birthDate, birthPlace, gender, family, homeCity, homeState } = voteSmartData.candidate;
    bio = {
      birthDate,
      birthPlace,
      gender,
      family,
      homeCity,
      homeState,
    };
  }
  const political_scores = {
    economic: Number(memberScores?.economic ?? chatGPTData?.economic ?? 0),
    social: Number(memberScores?.social ?? chatGPTData?.social ?? 0),
    foreign: Number(memberScores?.international ?? chatGPTData?.foreign ?? 0),
  };
  const sponsors =
    openSecretsData?.contributor.map(({ $ }) => ({
      name: $.org_name,
      total: Number($.total),
    })) || [];
  const sponsoredLegislation = memberLegislation?.map(l => ({
    amendmentNumber: l.amendmentNumber,
    number: l.number,
    type: l.type,
    congress: l.congress,
    title: l.title,
  }));
  return {
    id,
    bioguideId,
    image,
    type,
    name,
    party,
    bio,
    political_scores,
    sponsors,
    sponsoredLegislation,
    memberBio,
    biography,
  };
};

export const transformFedBill = (dynamoRecord: FedBill) => {
  const parsedDynamoRecord = parseFedBill(dynamoRecord);
  const {
    id,
    billNumber,
    billType,
    congress,
    chatGPTData,
    congressBill,
    congressBillText,
    billCategory,
    billSummary,
  } = parsedDynamoRecord;
  const {
    tag,
    summary: oldBulletPoints,
    Economic: economic,
    Social: social,
    Foreign: foreign,
  } = chatGPTData ?? {};
  const type = TYPES.FedBill;
  const title = `Bill ${billType}.${billNumber}[${congress}th]`;
  const headline = congressBill?.title ?? '';
  const links = congressBillText?.billTextLinks;
  const texts = congressBillText?.billTextStrings;
  const openAiCategory = billCategory?.category ?? tag;
  const category = openAiCategory === 'international' ? 'foreign' : openAiCategory;
  const tags: string[] = [...(billCategory?.tags || [])];
  const scores = billCategory?.category
    ? {
        economic: openAiCategory === 'economic' ? billCategory?.score : 'null',
        social: openAiCategory === 'social' ? billCategory?.score : 'null',
        foreign: openAiCategory === 'international' ? billCategory?.score : 'null',
      }
    : { economic, social, foreign };
  const bulletPoints = billSummary?.sentences ?? oldBulletPoints;
  const summary = billSummary?.summary ?? '';
  const sponsors = congressBill?.sponsors?.map(s => ({
    name: `${s.firstName} ${s.lastName}`,
    party: s.party,
    state: s.state,
  }));
  return {
    id,
    type,
    title,
    billNumber,
    billType,
    congress,
    headline,
    links,
    texts,
    sponsors,
    scores,
    bulletPoints,
    summary,
    tags,
    category,
  };
};

export const transformStateBill = (dynamoRecord: StateBill) => {
  return parseStateBill(dynamoRecord);
};
export const transformStateOfficial = (dynamoRecord: StateOfficial) => {
  return parseStateOfficial(dynamoRecord);
};
