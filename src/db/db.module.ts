import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';

@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: async () => {
        const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

        if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME) {
          throw new Error('Database environment variables are missing');
        }

        const connection = await mysql.createConnection({
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASS,
          database: DB_NAME,
        });

        return drizzle(connection);
      },
    },
  ],
  exports: ['DB'],
})
export class DbModule {}
