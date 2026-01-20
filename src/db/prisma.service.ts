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
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
