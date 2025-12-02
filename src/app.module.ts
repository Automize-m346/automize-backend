import { Module } from '@nestjs/common';
import { HelloController } from './controllers/hello.controller';
import { HelloService } from './services/hello.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DbModule, AuthModule],
  controllers: [HelloController],
  providers: [HelloService],
})
export class AppModule {}
