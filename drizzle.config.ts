import { defineConfig } from 'drizzle-kit';

const isAzure = process.env.DB_HOST?.includes('mysql.database.azure.com');

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema/*',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    ssl: { rejectUnauthorized: false },
  },
});
