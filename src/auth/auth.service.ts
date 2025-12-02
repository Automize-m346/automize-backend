import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import type { MySql2Database } from 'drizzle-orm/mysql2';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DB') private readonly db: MySql2Database,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, email: string, password: string) {
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hash(password, 10);

    const result = await this.db
      .insert(users)
      .values({ username, email, password: hashedPassword })
      .execute();

    const userId = Array.isArray(result)
      ? result[0]?.insertId
      : (result as any)?.insertId;

    if (!userId) {
      throw new Error('Failed to insert user');
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return { id: user.id, username: user.username, email: user.email };
  }

  async validateUser(email: string, password: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }

  async getMe(userId: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, username: user.username, email: user.email };
  }
}
