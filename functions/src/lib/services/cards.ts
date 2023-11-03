import { Pool } from 'pg';
import dbConfig from '../config/db-config';

const pool = new Pool(dbConfig);

export enum CardType {
  FedOfficial = 'FedOfficial',
  FedBill = 'FedBill',
  StateOfficial = 'StateOfficial',
  StateBill = 'StateBill',
}

export enum JobTitle {
  Senator = 'Senator',
  Representative = 'Representative',
  Candidate = 'Candidate',
  Assemblyman = 'Assemblyman',
  Delegate = 'Delegate',
}

// represents the cardTypeId table values in RDS
const cardTypeIds = {
  FedOfficial: 1,
  FedBill: 3,
  StateOfficial: 4,
  StateBill: 5,
};

export interface CreateCardInput {
  id: string;
  state: string | null;
  externalId: string;
  socialScore: number | null;
  economicScore: number | null;
  internationalScore: number | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  topic: string | null;
  jobTitle: string | null;
}
interface CreateCardsInput {
  cards: CreateCardInput[];
  type: CardType;
}

export const createCardsOfType = async (newCards: CreateCardsInput) => {
  const cardTypeId = cardTypeIds[newCards.type];

  const isOfficial =
    cardTypeId === cardTypeIds.FedOfficial || cardTypeId === cardTypeIds.StateOfficial;

  const isState = cardTypeId === cardTypeIds.StateOfficial || cardTypeId === cardTypeIds.StateBill;

  const client = await pool.connect();
  await client.query('BEGIN');

  const sql = `
    INSERT INTO cards (id, external_id, card_type_id, social_score, economic_score, international_score, title, description, image_url${
      isOfficial ? ', topic, job_title' : ''
    }${isState ? ', state' : ''}
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9${
      isOfficial && isState ? ', $10, $11, $12' : isOfficial ? ', $10, $11' : isState ? ', $10' : ''
    })
    ON CONFLICT (id) DO NOTHING;
  `;

  const insertPromises = newCards.cards.map(card => {
    const params = [
      card.id,
      card.externalId,
      cardTypeId,
      card.socialScore,
      card.economicScore,
      card.internationalScore,
      card.title,
      card.description,
      card.imageUrl,
    ];

    if (isOfficial) {
      params.push(card.title);
      params.push(card.jobTitle);
    }
    if (isState) {
      params.push(card.state);
    }

    return client.query(sql, params);
  });

  const resultPromises = await Promise.allSettled(insertPromises);
  console.log('AllSettle');

  resultPromises.forEach(result => {
    if (result.status === 'rejected') console.error(result.reason);
  });

  await client.query('COMMIT');
  client.release();
};

export const updateCardById = async (partialCards: Partial<CreateCardInput>[]) => {
  const client = await pool.connect();
  await client.query('BEGIN');

  const updatePromises = partialCards.map(partialCard => {
    const { id, ...cardToUpdate } = partialCard;
    const sql = `UPDATE cards SET ${Object.keys(cardToUpdate)
      .map((key, index) => `${key === 'jobTitle' ? 'job_title' : key} = $${index + 1}`)
      .join(',')} WHERE id = $${Object.keys(partialCard).length}`;

    const params = Object.values(cardToUpdate);
    params.push(id as string);

    console.log('updating card: ', sql, JSON.stringify(params));
    return client.query(sql, params);
  });

  await Promise.all(updatePromises);
  await client.query('COMMIT');
  client.release();
};

export const updateCardTopicFlag = async (id: any) => {
  const query = `Update
      cards
    set is_topic_created = true
    WHERE id = $1;`;
  const values = [id];
  console.log('updating cards: ', values);
  const response = await pool.query(query, values);
  return response;
};

export const getCardPoll = async (cardId: string) => {
  const query = `SELECT
      c.id,
      COUNT(us.action_type) AS total_swipes,
      COUNT(CASE WHEN us.action_type = 'left' THEN 1 END) AS left_swipes,
      COUNT(CASE WHEN us.action_type = 'right' THEN 1 END) AS right_swipes
    FROM
      cards c
    LEFT JOIN
      user_swipes us ON c.id = us.card_id
    WHERE c.id = $1
    GROUP BY
      c.id;`;
  const values = [cardId];
  const response = await pool.query(query, values);
  return response;
};

export const getCardById = async (cardId: string) => {
  //Just need to grab topic, but more fields can be added if required
  const query = `SELECT
      c.id,
      c.topic
    FROM
      cards c
    WHERE c.id = $1;`;
  const values = [cardId];
  const response = await pool.query(query, values);
  return response;
};

export const markReviewedCards = async () => {
  const query = `
    UPDATE cards
    SET is_reviewed = true
    WHERE is_reviewed = false
    AND cards.id in (
      SELECT c.id
      FROM user_swipes us
      JOIN users u ON us.user_id = u.cognito_user_id
      JOIN cards c ON us.card_id = c.id
      WHERE us.action_type = 'right'
      AND c.is_reviewed = false
      AND u.is_reviewer = true
    );`;
  const response = await pool.query(query);
  return response;
};
