import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import 'dotenv/config';

@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: async () => {
        const {
          DB_HOST,
          DB_USER,
          DB_PASS,
          DB_NAME,
          DB_REQUIRE_SSL,
          DB_SSL_CA_PATH,
          DB_SSL_REJECT_UNAUTHORIZED,
        } = process.env;

        if (!DB_HOST || !DB_USER || !DB_PASS || !DB_NAME) {
          throw new Error('Database environment variables are missing');
        }

        const connectionOptions: any = {
          host: DB_HOST,
          user: DB_USER,
          password: DB_PASS,
          database: DB_NAME,
        };

        // Enable TLS/SSL when DB_REQUIRE_SSL is 'true'
        if (DB_REQUIRE_SSL === 'true') {
          connectionOptions.ssl = { rejectUnauthorized: true };

          // If a CA path is provided, load it
          if (DB_SSL_CA_PATH) {
            try {
              // require fs lazily to avoid import at module top
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const fs = require('fs');
              connectionOptions.ssl.ca = fs.readFileSync(DB_SSL_CA_PATH);
            } catch (err: any) {
              console.warn(
                'Could not read DB_SSL_CA_PATH:',
                DB_SSL_CA_PATH,
                err?.message || err,
              );
            }
          }

          // Allow opting out of strict certificate verification for non-prod
          if (DB_SSL_REJECT_UNAUTHORIZED === 'false') {
            connectionOptions.ssl.rejectUnauthorized = false;
          }
        }

        const connection = await mysql.createConnection(connectionOptions);

        return drizzle(connection);
      },
    },
  ],
  exports: ['DB'],
})
export class DbModule {}
