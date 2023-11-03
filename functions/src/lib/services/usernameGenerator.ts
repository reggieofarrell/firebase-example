import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';
import { Pool } from 'pg';
import dbConfig from '@/config/db-config';

const config = {
  dictionaries: [colors, animals],
  separator: '-',
  length: 2,
};

const pool = new Pool(dbConfig);
const query = 'SELECT id FROM users WHERE username = $1;';

const generateUsername = async (): Promise<string> => {
  const username = uniqueNamesGenerator(config);
  const { rowCount } = await pool.query(query, [username]);
  return rowCount ? generateUsername() : username;
};

export default generateUsername;
