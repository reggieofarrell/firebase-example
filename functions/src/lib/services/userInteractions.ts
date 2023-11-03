import { Pool } from 'pg';
import dbConfig from '../config/db-config';

const pool = new Pool(dbConfig);

export enum ActionType {
  left = 'left',
  right = 'right',
  watch = 'watch',
}

interface CreateUserSwipeInput {
  cognitoId: string;
  cardId: string;
  actionType: ActionType;
}

interface DeleteUserSwipeInput {
  cognitoId: string;
  cardId: string;
}

const whereClause = "WHERE card_id = $1 AND user_id = $2 AND action_type IN ('left', 'right');";
const getQuery = `SELECT id FROM user_swipes ${whereClause}`;
const updateQuery = `UPDATE user_swipes SET timestamp = CURRENT_TIMESTAMP, action_type = $3 ${whereClause}`;
const insertQuery = 'INSERT INTO user_swipes (card_id, user_id, action_type) VALUES ($1, $2, $3);';

export const createUserSwipe = async ({ cognitoId, cardId, actionType }: CreateUserSwipeInput) => {
  let query = insertQuery;
  if (['left', 'right'].includes(actionType)) {
    const { rowCount } = await pool.query(getQuery, [cardId, cognitoId]);
    query = rowCount ? updateQuery : insertQuery;
  }
  await pool.query(query, [cardId, cognitoId, actionType]);
};

export const deleteUserSwipe = async ({ cognitoId, cardId }: DeleteUserSwipeInput) => {
  const query = 'DELETE FROM user_swipes WHERE user_id = $1 AND card_id = $2;';
  await pool.query(query, [cognitoId, cardId]);
};

// export const updateUserSwipe = async (id, user_id, content_id, action_type_id) => {
//   const query = 'UPDATE user_swipes SET user_id = $1, content_id = $2, action_type_id = $3 WHERE id = $4';
//   const values = [user_id, content_id, action_type_id, id];
//   await pool.query(query, values);
// };

export const countUserInteractionsByUserId = async (cognito_user_id: string) => {
  const query = `
    SELECT count(*) as swipes
    FROM user_swipes us
    WHERE user_id = $1
    LIMIT 1;
  `;
  const values = [cognito_user_id];
  const response = await pool.query(query, values);
  return response;
};

export const listUserInteractionsByUserId = async (cognito_user_id: string) => {
  const query = `SELECT
      us.action_type,
      us.timestamp as action_timestamp,
      ct.name as card_type,
      us.card_id,
      c.external_id,
      COALESCE(c.social_score + 50, NULL) as social_score,
      COALESCE(c.economic_score + 50, NULL) as economic_score,
      COALESCE(c.international_score + 50, NULL) as international_score,
      c.title,
      c.description
    FROM user_swipes us
    join cards c
      on us.card_id = c.id
    join card_type ct
      on c.card_type_id = ct.id
    WHERE user_id = $1`;
  const values = [cognito_user_id];
  const response = await pool.query(query, values);
  return response;
};

export const listUserTopicsByUserId = async (cognito_user_id: string, type?: ActionType) => {
  const query = `SELECT distinct
      c.topic
      FROM user_swipes us
      join cards c
        on us.card_id = c.id
      join card_type ct
        on c.card_type_id = ct.id
      WHERE user_id = $1 ${type ? 'AND action_type = $2' : ''}`;

  const values = [cognito_user_id];
  if (type) {
    values.push(type);
  }
  const response = await pool.query(query, values);
  return response;
};
