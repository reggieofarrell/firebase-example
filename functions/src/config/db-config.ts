const { GS_DB_HOST, GS_DB_PORT, GS_DB_USER, GS_DB_PASSWORD, GS_DB_NAME } = process.env;

const dbConfig = {
  host: GS_DB_HOST,
  port: parseInt(GS_DB_PORT || '5432', 10),
  user: GS_DB_USER,
  password: GS_DB_PASSWORD,
  database: GS_DB_NAME,
};

export default dbConfig;
