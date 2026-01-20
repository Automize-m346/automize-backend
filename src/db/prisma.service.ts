import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { SqlDriverAdapterFactory } from '@prisma/client/runtime/client';

const host = process.env.DB_HOST ?? 'localhost';
const user = process.env.DB_USER ?? 'root';
const password = process.env.DB_PASS ?? 'password';
const dbName = process.env.DB_NAME ?? 'mydb';
const port = Number(process.env.DB_PORT ?? 3306);

const databaseUrl = `mysql://${user}:${password}@${host}:${port}/${dbName}`;

const adapter: SqlDriverAdapterFactory = new PrismaMariaDb(databaseUrl);

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter });
  }

  async onModuleInit() {
    const maxAttempts = 5;
    const delayMs = 2000;
    let lastErr: any = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        console.log('Connected to the database');
        lastErr = null;
        break;
      } catch (err: any) {
        lastErr = err;
        console.warn(
          `Database connection attempt ${attempt} failed: ${String(err)}`,
        );
        if (attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }

    if (lastErr) {
      console.error(
        'Could not connect to the database after multiple attempts. Continuing without DB connection.',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
