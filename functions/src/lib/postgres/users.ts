import { Pool } from 'pg';
import dbConfig from '@/config/db-config';
import generateUsername from '../services/usernameGenerator';
import { IUser } from '@/types/user';

const pool = new Pool(dbConfig);

// todo: input the user weighting logic for user scores
export const readUser = async (userId: string) => {
  const query = `
    SELECT
      u.cognito_user_id,
      u.username,
      u.street_address,
      u.state,
      u.city,
      u.zipcode,
      u.gender,
      u.age,
      u.lat,
      u.lng,
      u.google_place_id,
      u.name,
      u.date_of_birth,
      u.avatar,
      u.is_interested_in_social,
      u.is_interested_in_economic,
      u.is_interested_in_international,
      u.is_interested_in_local_candidates,
      u.is_interested_in_state_candidates,
      u.is_interested_in_federal_candidates,
      u.is_interested_in_municipal_legislation,
      u.is_interested_in_state_legislation,
      u.is_interested_in_federal_legislation,
      u.has_seen_tutorial,
      COALESCE(SUM(
          CASE
              WHEN us.action_type = 'right' THEN c.social_score
              WHEN us.action_type = 'left' THEN -c.social_score
              ELSE 0
          END
      ) / NULLIF(COUNT(
          CASE
              WHEN c.social_score IS NOT NULL AND us.action_type IN ('right', 'left') THEN 1
          END
      ), 0) + 50, 50) AS average_social_score,
      COALESCE(SUM(
          CASE
              WHEN us.action_type = 'right' THEN c.economic_score
              WHEN us.action_type = 'left' THEN -c.economic_score
              ELSE 0
          END
      ) / NULLIF(COUNT(
          CASE
              WHEN c.economic_score IS NOT NULL AND us.action_type IN ('right', 'left') THEN 1
          END
      ), 0) + 50, 50) AS average_economic_score,
      COALESCE(SUM(
          CASE
              WHEN us.action_type = 'right' THEN c.international_score
              WHEN us.action_type = 'left' THEN -c.international_score
              ELSE 0
          END
      ) / NULLIF(COUNT(
          CASE
              WHEN c.international_score IS NOT NULL AND us.action_type IN ('right', 'left') THEN 1
          END
      ), 0) + 50, 50) AS average_international_score
    FROM
        users u
    LEFT JOIN
        user_swipes us
    ON
        u.cognito_user_id = us.user_id
    LEFT JOIN
        cards c
    ON
        us.card_id = c.id
    WHERE
        u.cognito_user_id = $1
    GROUP BY
        u.id;`;
  const values = [userId];
  const response = await pool.query<IUser>(query, values);
  return response;
};

export const createUser = async (newUser: Partial<IUser>) => {
  const username = await generateUsername();
  const user = { ...newUser, username };
  const fields = Object.keys(user).join(', ');
  const values = Object.values(user);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const insertQuery = `INSERT INTO users (${fields}) VALUES (${placeholders});`;
  await pool.query(insertQuery, values);
};

export const updateUser = async (updateUser: Partial<IUser>) => {
  const { cognito_user_id, ...userFields } = updateUser;
  const fields = Object.keys(userFields)
    .map((k, i) => `${k} = $${i + 1}`)
    .join(', ');
  const values = Object.values(userFields);
  if (values.length === 0) {
    // Nothing to update, so just return
    return;
  }
  const updateQuery = `UPDATE users SET ${fields} WHERE cognito_user_id = $${values.length + 1};`;
  await pool.query(updateQuery, [...values, cognito_user_id]);
};

// export const deleteCognitoUser = async (cognitoId: string) => {
//   if (!process.env.COGNITO_USER_POOL_ARN) {
//     throw new Error('COGNITO_USER_POOL_ARN not found in environment variables');
//   }

//   const command = new AdminDeleteUserCommand({
//     UserPoolId: process.env.COGNITO_USER_POOL_ARN,
//     Username: cognitoId,
//   });

//   try {
//     const result = await cognitoClient.send(command);
//     return true;
//   }
//   catch (e) {
//     // ignore user not found, throw everything else
//     if (e instanceof UserNotFoundException) {
//       console.warn('User not found in Cognito: ' + cognitoId);
//       return true;
//     }

//     console.error('Error deleting user from Cognito: ' + cognitoId, e);
//     throw e;
//   }
// };

export const userFeed = async (userId: string) => {
  const query = `
    SELECT
      c.id,
      c.external_id,
      c.state,
      ct.name as card_type
    FROM cards c
    JOIN card_type ct
      ON c.card_type_id = ct.id
    JOIN users u
      ON u.cognito_user_id = $1
      AND ((c.is_reviewed=FALSE AND u.is_reviewer=TRUE)
      OR (u.is_reviewer=FALSE AND (c.state IS NULL or u.state = c.state )))
    WHERE c.id NOT IN (
      SELECT card_id
      FROM user_swipes
      WHERE user_id = $1
    )
    ORDER BY priority DESC, RANDOM()
    LIMIT 100;
  `;
  const values = [userId];
  const response = await pool.query(query, values);
  return response;
};

export const findUserMatches = async (userId: string) => {
  const query = `
    WITH
    IntSig AS (
      SELECT
          int_q,
          MAX(international_score) as max_int_score,
          MIN(international_score) as min_int_score,
          COUNT(id) as count
      FROM (
        SELECT
            id,
            international_score,
            NTILE(4) OVER (ORDER BY international_score) AS int_q
        FROM cards
        WHERE international_score != 0 AND international_score IS NOT NULL
      ) as X
      GROUP BY int_q
    ),
    EcoSig AS (
      SELECT
          eco_q,
          MAX(economic_score) as max_eco_score,
          MIN(economic_score) as min_eco_score,
          COUNT(id) as count
      FROM (
        SELECT
            id,
            economic_score,
            NTILE(4) OVER (ORDER BY economic_score) AS eco_q
        FROM cards
        WHERE economic_score != 0 AND economic_score IS NOT NULL
      ) as X
      GROUP BY eco_q
    ),
    SocSig AS (
      SELECT
          soc_q,
          MAX(social_score) as max_soc_score,
          MIN(social_score) as min_soc_score,
          COUNT(id) as count
      FROM (
        SELECT
            id,
            social_score,
            NTILE(4) OVER (ORDER BY social_score) AS soc_q
        FROM cards
        WHERE social_score != 0 AND social_score IS NOT NULL
      ) as X
      GROUP BY soc_q
    ),
    Sig AS (
      SELECT
        ( SELECT max_int_score FROM IntSig WHERE int_q = 1 ) as int_min,
        ( SELECT min_int_score FROM IntSig WHERE int_q = 4 ) as int_max,
        ( SELECT max_eco_score FROM EcoSig WHERE eco_q = 1 LIMIT 1 ) as eco_min,
        ( SELECT min_eco_score FROM EcoSig WHERE eco_q = 4 LIMIT 1 ) as eco_max,
        ( SELECT max_soc_score FROM SocSig WHERE soc_q = 1 LIMIT 1 ) as soc_min,
        ( SELECT min_soc_score FROM SocSig WHERE soc_q = 4 LIMIT 1 ) as soc_max
    ),
    UserSwipes AS (
      SELECT *
      FROM user_swipes us
      LEFT JOIN cards c ON us.card_id = c.id
        WHERE us.user_id = $1
    ),
    UserScore AS (
      SELECT
        user_id,
        (
          SELECT
            SUM(
              CASE
                WHEN action_type = 'right' THEN international_score
                WHEN action_type = 'left' THEN -international_score
              END
            ) / COUNT(1)
          FROM UserSwipes
          WHERE international_score IS NOT NULL
            AND action_type IN ('right', 'left')
            AND international_score != 0
            AND (
              international_score <= (SELECT int_min FROM SIG) OR
              international_score >= (SELECT int_max FROM SIG)
            )
            AND user_id = US.user_id
        ) as avg_int_score,
        (
          SELECT
            SUM(
              CASE
                WHEN action_type = 'right' THEN economic_score
                WHEN action_type = 'left' THEN -economic_score
              END
            ) / COUNT(1)
          FROM UserSwipes
          WHERE economic_score IS NOT NULL
            AND action_type IN ('right', 'left')
            AND economic_score != 0
            AND (
              economic_score <= (SELECT eco_min FROM SIG) OR
              economic_score >= (SELECT eco_max FROM SIG)
            )
            AND user_id = US.user_id
        ) as avg_eco_score,
        (
          SELECT
            SUM(
              CASE
                WHEN action_type = 'right' THEN social_score
                WHEN action_type = 'left' THEN -social_score
              END
            ) / COUNT(1)
          FROM UserSwipes
          WHERE social_score IS NOT NULL
            AND action_type IN ('right', 'left')
            AND social_score != 0
            AND (
              social_score <= (SELECT soc_min FROM SIG) OR
              social_score >= (SELECT soc_max FROM SIG)
            )
            AND user_id = US.user_id
        ) as avg_soc_score
      FROM UserSwipes US
      GROUP BY user_id
    ),
    Cards AS (
      SELECT
        Card.id,
        Card.external_id,
        Card.priority,
        Card.card_type_id,
        COALESCE(ABS(UserScore.avg_soc_score - Card.social_score), 3)
          + COALESCE(ABS(UserScore.avg_eco_score - Card.economic_score), 3)
          + COALESCE(ABS(UserScore.avg_int_score - Card.international_score), 3)
        as rank,
        Card.social_score,
        Card.economic_score,
        Card.international_score,
        UserScore.avg_soc_score,
        Userscore.avg_eco_score,
        UserScore.avg_int_score
      FROM cards Card, UserScore
      WHERE Card.id IN (
        SELECT card_id
        FROM UserSwipes
      )
      AND (
        (Card.social_score != 0 AND Card.social_score IS NOT NULL AND ABS(UserScore.avg_soc_score - Card.social_score) <= 5)
        OR (Card.economic_score != 0 AND Card.economic_score IS NOT NULL AND ABS(UserScore.avg_eco_score - Card.economic_score) <= 5)
        OR (Card.international_score != 0 AND Card.international_score IS NOT NULL AND ABS(UserScore.avg_int_score - Card.international_score) <= 5)
      )
    )
    SELECT
      Cards.id,
      Cards.external_id,
      CardType.name as card_type
    FROM Cards
    LEFT JOIN card_type CardType ON CardType.id = Cards.card_type_id
    WHERE rank <= 8
    ORDER BY Cards.rank ASC, Cards.priority DESC
    LIMIT 20;
  `;

  const values = [userId];
  const response = await pool.query(query, values);
  return response;
};
